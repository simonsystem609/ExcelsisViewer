// Local, per-module document workspaces. Tile close never touches the filesystem.
const crypto = require('node:crypto');
const path = require('node:path');

const TITLE_HEIGHT = 42;
const TILE_LIMIT = 6;
const MAX_OPEN_DOCUMENTS = 512;
const MAX_PREVIEW_BYTES = 8 * 1024 * 1024;
const key = value => path.resolve(value).toLowerCase();
function allowsEntryNavigation(allowedUrl, targetUrl) {
  try { return new URL(targetUrl).href === allowedUrl; } catch { return false; }
}
function folderLabel(filePath) {
  const folder = path.dirname(filePath);
  return folder.split(/[\\/]/).filter(Boolean).slice(-3).join(' › ') || folder;
}
function sectionForPath(filePath) {
  const ext = path.extname(filePath || '').toLowerCase();
  return ext === '.pdf' ? 'pdf' : ext === '.dwg' ? 'dwg' : 'dxf';
}

function createWorkspaceModel(section) {
  const documents = new Map();
  let visible = [], activeId = null, mode = 'single';
  const find = filePath => [...documents.values()].find(doc => doc.path && key(doc.path) === key(filePath));
  const expose = doc => ({ id: doc.id, path: doc.path, name: path.basename(doc.path),
    folder: path.dirname(doc.path), folderLabel: folderLabel(doc.path), dirty: !!doc.status?.dirty,
    folderParts: path.dirname(doc.path).split(/[\\/]/).filter(Boolean).slice(-3),
    busy: !!doc.status?.busy, error: doc.error || null });
  function showInTiles(id) {
    if (visible.includes(id)) return;
    if (visible.length < TILE_LIMIT) visible.push(id);
    else visible[TILE_LIMIT - 1] = id;
  }
  return {
    section, documents, find,
    get activeId() { return activeId; }, get mode() { return mode; },
    get visibleIds() { return [...visible]; },
    add(filePath, { id = crypto.randomUUID(), overview = true } = {}) {
      const existing = find(filePath);
      if (existing) { this.select(existing.id); return existing; }
      if (documents.size >= MAX_OPEN_DOCUMENTS) throw new Error('Close some documents before opening more (512-document safety limit).');
      const doc = { id, path: path.resolve(filePath), status: {}, preview: null };
      documents.set(id, doc); showInTiles(id); activeId = id;
      mode = overview && documents.size > 1 ? 'tiles' : 'single';
      return doc;
    },
    select(id) {
      if (!documents.has(id)) throw new Error('This document is no longer open.');
      activeId = id; showInTiles(id); mode = 'single'; return documents.get(id);
    },
    overview() { if (documents.size > 1) mode = 'tiles'; },
    remove(id) {
      documents.delete(id); visible = visible.filter(value => value !== id);
      if (activeId === id) activeId = visible[0] || [...documents.keys()][0] || null;
      if (!visible.length && activeId) showInTiles(activeId);
      if (documents.size <= 1) mode = 'single';
    },
    rename(id, filePath) {
      const doc = documents.get(id);
      if (doc) doc.path = path.resolve(filePath);
    },
    snapshot() {
      const folders = new Map();
      for (const doc of documents.values()) {
        const folder = key(path.dirname(doc.path));
        if (!folders.has(folder)) folders.set(folder, { id: folder, path: path.dirname(doc.path), label: folderLabel(doc.path),
          parts: path.dirname(doc.path).split(/[\\/]/).filter(Boolean).slice(-3), files: [] });
        folders.get(folder).files.push(expose(doc));
      }
      return { section, mode, activeId, count: documents.size,
        folders: [...folders.values()], tiles: visible.map(id => documents.get(id)).filter(Boolean)
          .map(doc => ({ ...expose(doc), preview: doc.preview })) };
    },
  };
}

function createViewerWorkspaces({ WebContentsView, dialog, entryUrl, preferences, register, release, isBusy = () => false }) {
  const workspaces = new Map(), owners = new Map();
  function owner(webContents) { return owners.get(typeof webContents === 'number' ? webContents : webContents.id)?.handle || null; }
  function record(webContents) { return owners.get(typeof webContents === 'number' ? webContents : webContents.id) || null; }
  function state(ws) { return ws.model.snapshot(); }
  function send(ws) {
    if (!ws.window.isDestroyed() && !ws.window.webContents.isDestroyed()) ws.window.webContents.send('workspace:changed', state(ws));
  }
  function layout(ws) {
    if (ws.window.isDestroyed()) return;
    const [width, height] = ws.window.getContentSize();
    for (const doc of ws.model.documents.values()) {
      if (!doc.view) continue;
      const shown = ws.model.mode === 'single' && ws.model.activeId === doc.id && !ws.menuOpen;
      doc.view.setBounds({ x: 0, y: TITLE_HEIGHT, width, height: Math.max(1, height - TITLE_HEIGHT) });
      doc.view.setVisible(shown);
      doc.view.webContents.setBackgroundThrottling(!shown && !doc.previewQueued);
    }
    send(ws);
  }
  function requestSelection(ws, doc) {
    canLeave(ws).then(allowed => {
      if (allowed) { ws.model.select(doc.id); layout(ws); doc.handle.webContents.focus(); }
      else ws.pendingSelection = doc.id;
    }).catch(() => {});
  }
  function handleFor(ws, doc, view) {
    const wc = view.webContents;
    return {
      webContents: wc, nativeWindow: ws.window, excelsisModuleName: ws.moduleName,
      excelsisIconKind: ws.section, excelsisEntryUrl: entryUrl(ws.moduleName),
      isDestroyed: () => wc.isDestroyed() || ws.window.isDestroyed(),
      getTitle: () => path.basename(doc.path), setTitle: title => { doc.title = title; },
      setIcon() {}, setAppDetails() {}, setMenu() {},
      show: () => { requestSelection(ws, doc); ws.window.show(); },
      focus: () => { requestSelection(ws, doc); ws.window.focus(); },
      isMinimized: () => ws.window.isMinimized(), restore: () => ws.window.restore(),
      hide: () => ws.window.hide(),
      setContentSize: (...args) => ws.window.setContentSize(...args),
      getContentSize: () => ws.window.getContentSize(),
      getBounds: () => ws.window.getBounds(),
      close: () => closeDocument(ws, doc), destroy: () => removeDocument(ws, doc),
      on: (event, listener) => event === 'closed' ? wc.on('destroyed', listener) : ws.window.on(event, listener),
    };
  }
  function ensureView(ws, doc) {
    if (doc.handle && !doc.handle.isDestroyed()) return doc.handle;
    const offscreen = !!ws.window.webContents.getLastWebPreferences().offscreen;
    const view = new WebContentsView({ webPreferences: { ...preferences(), offscreen, backgroundThrottling: false } });
    const webContentsId = view.webContents.id;
    doc.view = view; doc.handle = handleFor(ws, doc, view);
    owners.set(view.webContents.id, { ws, doc, handle: doc.handle, root: false });
    register(doc.handle, doc.fileSet);
    ws.window.contentView.addChildView(view); view.setVisible(false);
    view.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    const allowedUrl = new URL(entryUrl(ws.moduleName)).href;
    view.webContents.on('will-navigate', (event, targetUrl) => {
      if (!allowsEntryNavigation(allowedUrl, targetUrl)) event.preventDefault();
    });
    view.webContents.on('will-attach-webview', event => event.preventDefault());
    view.webContents.on('destroyed', () => {
      owners.delete(webContentsId); release(webContentsId);
    });
    view.webContents.loadURL(allowedUrl).catch(error => { doc.error = error.message; send(ws); });
    layout(ws);
    return doc.handle;
  }
  async function call(doc, method) {
    if (!doc?.handle || doc.handle.isDestroyed()) return null;
    // Fixed internal API only, never arbitrary renderer-provided JavaScript.
    const expressions = {
      status: 'globalThis.excelsisDocumentSession?.status()',
      preview: 'globalThis.excelsisDocumentSession?.preview()',
      save: 'globalThis.excelsisDocumentSession?.save()',
      clear: 'globalThis.excelsisDocumentSession?.clear()',
    };
    const value = await doc.handle.webContents.executeJavaScript(expressions[method]);
    if (method === 'status' && value) {
      const status = { ...value, busy: !!value.busy || isBusy(doc.handle.webContents.id) };
      doc.status = { dirty: !!status.dirty, busy: !!status.busy };
      return status;
    }
    return value;
  }
  function queuePreview(ws, doc) {
    if (!ws.model.documents.has(doc.id)) return;
    if (doc.previewQueued) { if (!doc.preview) doc.previewAgain = true; return; }
    doc.previewQueued = true;
    ws.previewQueue = ws.previewQueue.catch(() => {}).then(async () => {
      if (!ws.model.documents.has(doc.id) || ws.window.isDestroyed()) return;
      ensureView(ws, doc);
      try {
        const deadline = Date.now() + 10 * 60 * 1000;
        let status;
        do {
          status = await call(doc, 'status');
          if (status?.ready && !status.busy) break;
          if (status?.error) throw new Error(status.error);
          if (!ws.model.documents.has(doc.id) || doc.handle.isDestroyed()) return;
          await new Promise(resolve => setTimeout(resolve, 60));
        } while (Date.now() < deadline);
        if (!status?.ready) throw new Error('Preview preparation timed out. Open the file to see its status.');
        const previewPath = doc.path;
        const preview = await call(doc, 'preview');
        if (typeof preview !== 'string' || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(preview) || preview.length > MAX_PREVIEW_BYTES) {
          throw new Error('The file did not produce a bounded PNG preview.');
        }
        if (ws.model.documents.has(doc.id)) {
          if (key(doc.path) !== key(previewPath)) doc.previewAgain = true;
          else { doc.preview = preview; doc.error = null; }
        }
      } catch (error) { doc.error = error.message; }
      finally {
        doc.previewQueued = false; send(ws);
        if (doc.previewAgain) { doc.previewAgain = false; queuePreview(ws, doc); }
        evictCleanOverflow(ws);
      }
    });
  }
  function evictCleanOverflow(ws) {
    for (const doc of ws.model.documents.values()) {
      if (doc.root || !doc.view || doc.previewQueued || ws.model.visibleIds.includes(doc.id) || ws.model.activeId === doc.id || doc.status?.dirty || doc.status?.busy) continue;
      ws.window.contentView.removeChildView(doc.view);
      doc.view.webContents.close(); doc.view = null; doc.handle = null; doc.preview = null;
    }
  }
  async function canLeave(ws) {
    if (ws.dialogActive || ws.closing) return false;
    if (ws.model.mode === 'tiles') return true;
    const active = ws.model.documents.get(ws.model.activeId);
    if (!active) return true;
    const status = await call(active, 'status');
    return !status?.busy;
  }
  async function closeDocument(ws, doc) {
    if (doc.closing) return doc.closing;
    doc.closing = checkAndCloseDocument(ws, doc).finally(() => { doc.closing = null; });
    return doc.closing;
  }
  async function checkAndCloseDocument(ws, doc) {
    const result = await confirmDocumentClose(ws, doc);
    if (result.ok) removeDocument(ws, doc);
    return result;
  }
  async function confirmDocumentClose(ws, doc) {
    if (!ws.model.documents.has(doc.id)) return { ok: true };
    const status = await call(doc, 'status');
    if (status?.busy) return { ok: false, error: 'Finish the current operation before closing this file.' };
    if (status?.dirty) {
      if (ws.dialogActive) return { ok: false, error: 'Finish the current confirmation before closing another file.' };
      ws.dialogActive = true;
      let result;
      try {
        result = await dialog.showMessageBox(ws.window, { type: 'warning', title: 'Unsaved changes',
          message: `Save changes to ${path.basename(doc.path)} before closing?`,
          buttons: ['Save', 'Discard changes', 'Cancel'], defaultId: 0, cancelId: 2, noLink: true });
      } finally { ws.dialogActive = false; }
      if (result.response === 2) return { ok: false, canceled: true };
      if (result.response === 0) {
        await call(doc, 'save');
        if ((await call(doc, 'status'))?.dirty) return { ok: false, canceled: true };
      }
    }
    return { ok: true };
  }
  function removeDocument(ws, doc, { clear = true } = {}) {
    ws.model.remove(doc.id);
    if (doc.root) {
      release(doc.handle.webContents.id); if (clear) call(doc, 'clear').catch(() => {});
      doc.path = null; doc.status = {}; doc.preview = null; doc.fileSet = null;
    }
    else if (doc.view && !doc.handle.isDestroyed()) {
      ws.window.contentView.removeChildView(doc.view); doc.view.webContents.close();
    }
    const active = ws.model.documents.get(ws.model.activeId);
    if (active) ensureView(ws, active);
    layout(ws);
  }
  function add(ws, fileSet, { overview = true } = {}) {
    if (!fileSet?.path) return ws.window;
    const existing = ws.model.find(fileSet.path);
    if (existing) {
      const handle = ensureView(ws, existing);
      requestSelection(ws, existing);
      if (ws.window.isMinimized()) ws.window.restore(); ws.window.show(); ws.window.focus();
      return handle;
    }
    const previous = ws.model.documents.get(ws.model.activeId);
    const doc = ws.model.add(fileSet.path, { overview: false }); doc.fileSet = fileSet;
    if (overview && previous) ws.model.select(previous.id);
    const handle = ensureView(ws, doc);
    if (overview && ws.model.documents.size > 1) {
      call(previous, 'status').then(status => {
        if (status?.busy) ws.pendingOverview = true;
        else {
          ws.model.overview();
          for (const id of ws.model.visibleIds) queuePreview(ws, ws.model.documents.get(id));
        }
        layout(ws);
      }).catch(() => {});
    }
    layout(ws); if (ws.window.isMinimized()) ws.window.restore(); ws.window.show(); ws.window.focus();
    return handle;
  }
  function attach(win, moduleName, section, fileSet) {
    const model = createWorkspaceModel(section);
    const rootWebContentsId = win.webContents.id;
    const ws = { window: win, moduleName, section, model, previewQueue: Promise.resolve(), menuOpen: false };
    workspaces.set(section, ws); win.excelsisWorkspace = ws;
    const doc = fileSet?.path ? model.add(fileSet.path) : { id: crypto.randomUUID(), path: null, status: {} };
    doc.root = true; doc.handle = win; doc.fileSet = fileSet; ws.root = doc;
    owners.set(win.webContents.id, { ws, doc, handle: win, root: true });
    win.on('resize', () => layout(ws)); win.on('maximize', () => layout(ws)); win.on('unmaximize', () => layout(ws));
    win.webContents.on('did-finish-load', () => send(ws));
    win.on('close', event => {
      if (ws.closeApproved || !model.documents.size) return;
      if (![...model.documents.values()].some(entry => entry.status?.dirty || entry.status?.busy || (entry.handle && isBusy(entry.handle.webContents.id)))) return;
      event.preventDefault();
      if (ws.closing) return;
      ws.closing = true;
      (async () => {
        // Confirm every document before removing any. Canceling the module
        // close keeps even the clean tabs open (successful saves stay saved).
        for (const entry of model.documents.values()) {
          const result = await confirmDocumentClose(ws, entry);
          if (!result.ok) return;
        }
        for (const entry of [...model.documents.values()]) removeDocument(ws, entry);
        ws.closeApproved = true; win.close();
      })().catch(() => {}).finally(() => { ws.closing = false; });
    });
    win.on('closed', () => {
      workspaces.delete(section);
      for (const entry of model.documents.values()) {
        if (entry.view && !entry.view.webContents.isDestroyed()) entry.view.webContents.close();
      }
      // BrowserWindow.webContents is no longer accessible inside "closed".
      // Use the captured identity; throwing here can strand application exit.
      owners.delete(rootWebContentsId);
    });
    return ws;
  }
  return {
    find: section => workspaces.get(section), attach, add, owner, record,
    documents: () => [...owners.values()].map(value => value.handle).filter(handle => !handle.isDestroyed()),
    findFile(filePath) {
      for (const ws of workspaces.values()) { const doc = ws.model.find(filePath); if (doc) return ensureView(ws, doc); }
      return null;
    },
    isOpenElsewhere(filePath, sender) {
      const source = record(sender);
      for (const ws of workspaces.values()) {
        const doc = ws.model.find(filePath);
        if (doc && doc !== source?.doc) return true;
      }
      return false;
    },
    getState(sender) { const item = record(sender); if (!item) throw new Error('No viewer workspace.'); return { ...state(item.ws), root: item.root, documentId: item.doc.id }; },
    async action(sender, action, id) {
      const item = record(sender);
      if (!item?.root) throw new Error('Only the workspace title bar can control its documents.');
      const { ws } = item;
      if (action === 'menu') { ws.menuOpen = !!id; layout(ws); return { ok: true }; }
      if (action === 'close') {
        const doc = ws.model.documents.get(id); if (!doc) throw new Error('This document is not in this workspace.');
        return closeDocument(ws, doc);
      }
      if (!(await canLeave(ws))) return { ok: false, error: 'Finish the current operation before switching files.' };
      ws.menuOpen = false;
      if (action === 'select') { const doc = ws.model.select(id); ensureView(ws, doc); layout(ws); doc.handle.webContents.focus(); }
      else if (action === 'overview') { ws.model.overview(); for (const doc of ws.model.documents.values()) doc.preview = null;
        for (const visible of ws.model.visibleIds) queuePreview(ws, ws.model.documents.get(visible)); layout(ws); ws.window.webContents.focus(); }
      else throw new Error('Unknown workspace action.');
      return { ok: true };
    },
    report(sender, status) {
      const item = record(sender); if (!item) throw new Error('No viewer document.');
      item.doc.status = { dirty: !!status?.dirty, busy: !!status?.busy || isBusy(typeof sender === 'number' ? sender : sender.id) };
      if (item.ws.pendingSelection && !item.doc.status.busy && item.ws.model.activeId === item.doc.id) {
        const pending = item.ws.model.documents.get(item.ws.pendingSelection);
        item.ws.pendingSelection = null; item.ws.pendingOverview = false;
        if (pending) { item.ws.model.select(pending.id); ensureView(item.ws, pending); layout(item.ws); pending.handle.webContents.focus(); }
      }
      if (item.ws.pendingOverview && !item.doc.status.busy && item.ws.model.activeId === item.doc.id) {
        item.ws.pendingOverview = false; item.ws.model.overview();
        for (const id of item.ws.model.visibleIds) queuePreview(item.ws, item.ws.model.documents.get(id));
        layout(item.ws);
      }
      send(item.ws);
    },
    async finishedWrite(sender) {
      const item = record(sender); if (!item) return;
      const status = await call(item.doc, 'status');
      if (status) this.report(sender, status);
    },
    identity(sender, filePath, fileSet) {
      const item = record(sender); if (!item) return;
      const changed = !item.doc.path || key(item.doc.path) !== key(filePath);
      const oldPath = item.doc.path;
      if (!item.doc.path) { const added = item.ws.model.add(filePath, { id: item.doc.id, overview: false }); Object.assign(added, item.doc, { path: path.resolve(filePath) }); item.doc = added; item.ws.root = added; }
      else item.ws.model.rename(item.doc.id, filePath);
      const resolved = path.resolve(filePath);
      let files = fileSet?.files || item.doc.fileSet?.files || [];
      if (!files.some(file => key(file.path) === key(resolved))) {
        files = files.filter(file => !oldPath || key(file.path) !== key(oldPath));
        files = [...files, { path: resolved, name: path.basename(resolved) }];
      }
      item.doc.fileSet = { ...(fileSet || item.doc.fileSet), path: resolved, files,
        index: Math.max(0, files.findIndex(file => key(file.path) === key(resolved))) };
      if (changed) item.doc.preview = null;
      send(item.ws);
    },
    changed(sender, action, newPath, oldPath) {
      const item = record(sender); if (!item) return;
      if (action === 'delete') {
        if (oldPath && (!item.doc.path || key(item.doc.path) !== key(oldPath))) return;
        // File-action deletion already cleared the editor and retained its
        // normal folder pager. Tile X instead clears the whole session.
        removeDocument(item.ws, item.doc, { clear: false });
      }
      else this.identity(sender, newPath);
    },
  };
}
module.exports = { TITLE_HEIGHT, TILE_LIMIT, MAX_OPEN_DOCUMENTS, MAX_PREVIEW_BYTES,
  folderLabel, sectionForPath, allowsEntryNavigation, createWorkspaceModel, createViewerWorkspaces };
