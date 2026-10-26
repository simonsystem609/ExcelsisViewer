const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
// Our fixed, independently authored OLE helper. No shell, arbitrary executable,
// destination path, renderer receipts or customer-document parsing.
function startFileClipboard(sourcePath, onEvent, { runtimeRoot, spawnProcess = spawn } = {}) {
  const helper = path.join(runtimeRoot, 'native', 'file-clipboard.exe');
  if (!fs.statSync(helper).isFile()) throw new Error('Windows file clipboard helper is unavailable.');
  return new Promise((resolve, reject) => {
    // This UI-facing helper creates its own bounded Job Object. The decoder
    // guard deliberately does not inherit stdio and cannot serve OLE callbacks.
    const child = spawnProcess(helper, [sourcePath],
    { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'], cwd: runtimeRoot });
    let ready = false, stopped = false, buffer = '', total = 0;
    const deadline = setTimeout(() => { stop(); reject(new Error('Windows clipboard did not become ready.')); }, 10000);
    function stop() {
      if (stopped) return;
      stopped = true; clearTimeout(deadline);
      child.stdin?.write('stop\n'); child.stdin?.end();
      const timer = setTimeout(() => child.kill(), 1500); timer.unref?.();
    }
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      total += chunk.length; buffer += chunk;
      if (buffer.length > 4096 || total > 64 * 1024) { stop(); if (!ready) reject(new Error('Invalid clipboard helper output.')); else onEvent({ type: 'error' }); return; }
      let end;
      while ((end = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, end).trim(); buffer = buffer.slice(end + 1);
        let value; try {
          value = JSON.parse(line);
          if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid response');
        } catch {
          stop();
          if (!ready) reject(new Error('Invalid clipboard helper response.'));
          else onEvent({ type: 'error' });
          return;
        }
        if (value.type === 'ready' && !ready) { ready = true; clearTimeout(deadline); resolve({ stop }); }
        else if (ready && ['receipt', 'lost', 'error'].includes(value.type)) onEvent(value);
      }
    });
    // Drain bounded native diagnostics; never write paths/clipboard contents to logs.
    child.stderr.on('data', () => {});
    child.stdin.on('error', () => {});
    child.once('error', error => { clearTimeout(deadline); if (!ready) reject(error); else if (!stopped) onEvent({ type: 'error' }); });
    child.once('exit', () => { clearTimeout(deadline); if (!ready) reject(new Error('Windows could not prepare the file cut.')); else if (!stopped) onEvent({ type: 'error' }); });
  });
}
module.exports = { startFileClipboard };
