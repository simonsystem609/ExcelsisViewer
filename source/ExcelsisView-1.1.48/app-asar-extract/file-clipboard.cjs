// One user-authorized file cut. Completion comes from our Windows OLE source,
// not a renderer or a mere path disappearing. Never removes a folder tree.
const fs = require('node:fs/promises');
const path = require('node:path');
const same = (a, b) => ['dev', 'ino', 'size', 'mtimeMs', 'ctimeMs'].every(k => a[k] === b[k]);
function createFileClipboard({ transport, assertCurrent, onState, onMoved, io = fs,
  intervalMs = 750, now = () => Date.now() }) {
  let current = null, starting = false;
  const key = value => path.resolve(value).toLowerCase();
  const locked = file => !!current && key(current.path) === key(file);
  async function finish(session, phase, error) {
    if (current !== session || session.finishing) return;
    session.finishing = true;
    clearInterval(session.timer);
    current = null;
    session.task?.stop();
    if (phase === 'moved') {
      try { await onMoved(session.path); }
      catch { error = new Error('The file moved, but its view could not be closed. Reopen it from the pasted location; no cleanup was retried.'); }
    }
    await onState({ path: session.path, owner: session.owner, phase, error: error?.message });
  }
  function check(session) {
    if (current !== session || session.finishing) return Promise.resolve();
    if (session.checking) return session.checking;
    session.checking = (async () => {
    try {
      // Explicit copy/link/failure feedback takes precedence over any earlier
      // move hint. Even a subsequently missing path must not trigger cleanup.
      if ([0, 1, 4].includes(session.paste) || [0, 1, 4].includes(session.logical)) {
        await finish(session, 'canceled'); return;
      }
      const stat = await io.lstat(session.path).catch(error => {
        if (error.code === 'ENOENT') return null;
        throw error;
      });
      if (current !== session || session.finishing) return;
      const receipt = session.paste === 2 || session.logical === 2 || session.performed === 0;
      if (!stat) {
        // An offline NAS is not proof of a move. Verify the original directory
        // is readable and no case-variant source name remains there.
        if (receipt) {
          const entries = await io.readdir(path.dirname(session.path));
          if (current !== session || session.finishing) return;
          if (!entries.some(name => name.toLowerCase() === path.basename(session.path).toLowerCase())) {
            await finish(session, 'moved'); return;
          }
        }
      } else {
        if (!stat.isFile() || stat.isSymbolicLink() || !same(session.stat, stat)) {
          throw new Error('The cut file changed externally. Cut was canceled; nothing was removed by Viewer.');
        }
        // Microsoft's unoptimized delete-on-paste handshake requires BOTH
        // confirmations. A preferred/logical effect or COPY alone never deletes.
        if (session.performed === 2 && session.paste === 2) {
          const recheck = await io.lstat(session.path);
          if (current !== session || session.finishing) return;
          if (!recheck.isFile() || recheck.isSymbolicLink() || !same(session.stat, recheck)) {
            throw new Error('The original cut file changed; it was not removed.');
          }
          // Only the exact original regular file, no recursion or retry.
          session.removing = true;
          await io.unlink(session.path);
          await finish(session, 'moved'); return;
        }
      }
      if (session.lostAt !== undefined && now() - session.lostAt > 5000 && !receipt) {
        await finish(session, 'canceled');
      }
    } catch (error) {
      // Unavailable shares remain visible/read-only; don't infer deletion or
      // ever run a cleanup sweep. A real unlink failure ends with an error.
      if (!session.removing && ['EACCES', 'EPERM', 'EBUSY', 'ENOENT', 'ENOTDIR', 'ENETUNREACH', 'EHOSTUNREACH', 'EIO'].includes(error.code)) return;
      await finish(session, 'error', error);
    } finally { session.checking = null; }
    })();
    return session.checking;
  }
  async function event(session, value) {
    if (current !== session || session.finishing) return;
    if (value.type === 'receipt' && [0, 1, 2, 4].includes(value.effect) &&
        ['performed', 'paste', 'logical'].includes(value.format)) session[value.format] = value.effect;
    else if (value.type === 'lost') session.lostAt ??= now();
    else if (value.type === 'error') {
      // Drain an in-flight completion before reporting helper shutdown. Never
      // claim the source was kept when Explorer has already moved it.
      await check(session);
      if (current === session) await finish(session, 'error', new Error('Windows clipboard cut stopped. No extra cleanup or retry was performed.'));
      return;
    }
    await check(session);
  }
  return {
    isLocked: locked,
    isStarting: () => starting,
    async start(owner, sourcePath) {
      if (starting) throw new Error('Another clipboard cut is being prepared.');
      if (current?.removing) throw new Error('The previous paste is completing its move. Wait briefly.');
      if (!path.isAbsolute(sourcePath) || !/^\.(dxf|dwg|pdf)$/i.test(path.extname(sourcePath))) {
        throw new Error('Only the current DXF, DWG or PDF can be cut.');
      }
      const claim = assertCurrent(owner, sourcePath, null);
      starting = true;
      let session;
      try {
        const stat = await io.lstat(sourcePath);
        if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Only one regular file can be cut, never a folder or link.');
        if (assertCurrent(owner, sourcePath, null) !== claim) throw new Error('The current file changed. Try Cut again.');
        if (current) await finish(current, 'canceled');
        session = { owner, path: sourcePath, stat, checking: false, finishing: false };
        current = session;
        session.task = await transport(sourcePath, value => event(session, value).catch(() => {}));
        if (current !== session) { session.task.stop(); throw new Error('Clipboard cut was canceled during startup.'); }
        await onState({ owner, path: sourcePath, phase: 'pending' });
        session.timer = setInterval(() => check(session).catch(() => {}), intervalMs);
        session.timer.unref?.();
        return { ok: true, pending: true, path: sourcePath };
      } catch (error) {
        if (session && current === session) await finish(session, 'error', error);
        throw error;
      } finally { starting = false; }
    },
    async cancel(owner, file) {
      if (!current || current.owner !== owner || key(current.path) !== key(file)) {
        throw new Error('Only this file’s pending cut can be canceled.');
      }
      if (current.removing) throw new Error('Paste has completed and the move is finishing; it cannot be canceled now.');
      await finish(current, 'canceled'); return { ok: true, canceled: true };
    },
    poll: () => current ? check(current) : Promise.resolve(),
    async dispose() { if (current) await finish(current, 'canceled'); },
  };
}
module.exports = { createFileClipboard };
