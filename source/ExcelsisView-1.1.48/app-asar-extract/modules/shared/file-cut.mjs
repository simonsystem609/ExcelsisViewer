export function bindFileCut({ button, api, getPath, showMessage, sync }) {
  if (!api?.cutFile) { button.hidden = true; return; }
  let busy = false, lastPath = null;
  const same = (a,b) => !!a && !!b && a.toLowerCase() === b.toLowerCase();
  button.addEventListener('click', async () => {
    const file = getPath(); if (!file || busy) return;
    busy = true; lastPath = file; button.dataset.cutBusy = 'true'; button.disabled = true;
    try {
      const result = await api.cutFile(file);
      if (result?.error) throw new Error(result.error);
    } catch (error) {
      showMessage(String(error.message || error).replace(/^Error invoking remote method '[^']+': (Error: )?/, ''));
    } finally { busy = false; button.dataset.cutBusy = ''; sync(); }
  });
  api.onCutState(state => {
    if (!same(getPath(), state.path) && !(same(lastPath,state.path) && !getPath())) return;
    if (state.phase === 'pending') showMessage('Cut to clipboard — read-only. Paste in Explorer to move this file, or click Cancel Cut.');
    else if (state.phase === 'moved') showMessage(state.error || 'File moved. Reopen it from the pasted location.');
    else if (state.phase === 'error') showMessage(state.error || 'Cut failed. The original file was kept open.');
    else if (state.phase === 'canceled') showMessage('Cut canceled. The file stays here.');
    sync();
  });
}
