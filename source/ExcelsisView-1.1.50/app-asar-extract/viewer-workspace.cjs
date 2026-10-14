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
function metadataFilename(status, section) {
  const value = status?.metadataFilename;
  return section === 'dxf' && typeof value === 'string' && value.length <= 4096 && value.trim() &&
    !/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(value) ? value : null;
}
function folderLabel(filePath, count = 3) {
  const folder = path.dirname(filePath);
  return folder.split(/[\\/]/).filter(Boolean).slice(-count).join(' › ') || folder;
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
    metadataFilename: doc.metadataFilename || null,
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
        if (!folders.has(folder)) folders.set(folder, { id: folder, path: path.dirname(doc.path), label: folderLabel(doc.path, 5),
          parts: path.dirname(doc.path).split(/[\\/]/).filter(Boolean).slice(-5), files: [] });
        folders.get(folder).files.push(expose(doc));
      }
      return { section, mode, activeId, count: documents.size,
        folders: [...folders.values()], tiles: visible.map(id => documents.get(id)).filter(Boolean)
          .map(doc => ({ ...expose(doc), preview: doc.preview || doc.previousPreview || null })) };
    },
  };
}

function createViewerWorkspaces({ WebContentsView, dialog, entryUrl, preferences, register, release,
  showFolderContextMenu, openFolder, isBusy = () => false }) {
  const workspaces = new Map(), owners = new Map();
  function owner(webContents) { return owners.get(typeof webContents === 'number' ? webContents : webContents.id)?.handle || null; }
  function record(webContents) { return owners.get(typeof webContents === 'number' ? webContents : webContents.id) || null; }
  function state(ws) { return { ...ws.model.snapshot(), closing: !!ws.closing }; }
  function menuState(ws) {
    if (!ws.menuOpen) return null;
    const folder = state(ws).folders.find(item => item.id === ws.menuFolderId);
    if (!folder || ws.menuMode !== ws.model.mode || ws.menuDocumentId !== ws.model.activeId) {
      ws.menuOpen = false; return null;
    }
    return { folder, left: ws.menuLeft, documentId: ws.menuDocumentId, mode: ws.menuMode };
  }
  function sendMenu(ws, menu) {
    // Draw the dropdown in the selected editor's own renderer. Root HTML
    // cannot overlay a native WebContentsView; hiding that view blanks it.
    for (const doc of ws.model.documents.values()) {
      if (!doc.view || doc.loading || doc.handle.isDestroyed()) continue;
      const value = menu?.mode === 'single' && menu.documentId === doc.id ? menu : null;
      const signature = JSON.stringify(value);
      if (signature === doc.sentMenu) continue;
      doc.sentMenu = signature;
      doc.handle.webContents.send('workspace:menu-changed', value);
    }
  }
  function send(ws) {
    if (ws.window.isDestroyed() || ws.window.webContents.isDestroyed()) return;
    const menu = menuState(ws);
    sendMenu(ws, menu);
    const snapshot = { ...state(ws), menuOpen: !!menu, menu };
    // PNGs are large. Send each changed preview once, not on every status,
    // selection or resize. The renderer retains unchanged image elements.
    const changed = snapshot.tiles.filter(tile => ws.sentPreviews.get(tile.id) !== tile.preview);
    const metadata = { ...snapshot, tiles: snapshot.tiles.map(({ preview, ...tile }) => tile) };
    const signature = JSON.stringify(metadata);
    if (signature === ws.sentState && !changed.length) return;
    const previews = new Map(changed.map(tile => [tile.id, tile.preview]));
    metadata.tiles = metadata.tiles.map(tile => previews.has(tile.id) ? { ...tile, preview: previews.get(tile.id) } : tile);
    ws.sentState = signature;
    for (const tile of changed) ws.sentPreviews.set(tile.id, tile.preview);
    const visibleIds = new Set(snapshot.tiles.map(tile => tile.id));
    for (const id of ws.sentPreviews.keys()) if (!visibleIds.has(id)) ws.sentPreviews.delete(id);
    ws.window.webContents.send('workspace:changed', metadata);
  }
  function layout(ws) {
    if (ws.window.isDestroyed()) return;
    const [width, height] = ws.window.getContentSize();
    for (const doc of ws.model.documents.values()) {
      if (!doc.view) continue;
      const shown = ws.model.mode === 'single' && ws.model.activeId === doc.id;
      const activated = shown && !doc.shown;
      // Only the selected native view belongs to the window hierarchy. Hidden
      // preview editors must not cover the overview or another editor.
      if (!shown && doc.attached) {
        doc.view.setVisible(false); ws.window.contentView.removeChildView(doc.view); doc.attached = false;
      }
      if (shown && !doc.attached) { ws.window.contentView.addChildView(doc.view); doc.attached = true; }
      doc.view.setBounds({ x: 0, y: TITLE_HEIGHT, width, height: Math.max(1, height - TITLE_HEIGHT) });
      if (doc.shown !== shown) doc.view.setVisible(shown);
      doc.shown = shown;
      const throttled = !shown && !doc.previewRunning && !doc.loading;
      if (doc.view.webContents.getBackgroundThrottling() !== throttled) doc.view.webContents.setBackgroundThrottling(throttled);
      if (activated) call(doc, 'activate').catch(() => {});
    }
    send(ws);
  }
  function requestSelection(ws, doc) {
    if (ws.closing) return;
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
    doc.view = view; doc.handle = handleFor(ws, doc, view); doc.attached = false; doc.shown = false; doc.loading = true;
    owners.set(view.webContents.id, { ws, doc, handle: doc.handle, root: false });
    register(doc.handle, doc.fileSet);
    view.setVisible(false);
    view.webContents.once('did-finish-load', () => { doc.loading = false; layout(ws); });
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
      discard: 'globalThis.excelsisDocumentSession?.discard()',
      clear: 'globalThis.excelsisDocumentSession?.clear()',
      pause: 'globalThis.excelsisDocumentSession?.setClosing?.(true)',
      resume: 'globalThis.excelsisDocumentSession?.setClosing?.(false)',
      activate: "globalThis.dispatchEvent(new Event('resize'))",
    };
    const pending = doc.handle.webContents.executeJavaScript(expressions[method]);
    let timer, value;
    try {
      value = method === 'status' ? await Promise.race([pending, new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('The editor is still preparing this file. Try again shortly.')), 10000);
      })]) : await pending;
    } finally { clearTimeout(timer); }
    if (method === 'status' && value) {
      const status = { ...value, busy: !!value.busy || isBusy(doc.handle.webContents.id) };
      doc.status = { dirty: !!status.dirty, busy: !!status.busy };
      doc.metadataFilename = metadataFilename(status, sectionForPath(doc.path));
      return status;
    }
    return value;
  }
  function queuePreview(ws, doc) {
    if (!ws.model.documents.has(doc.id)) return;
    if (doc.preview) return;
    if (doc.previewQueued) { if (!doc.preview) doc.previewAgain = true; return; }
    doc.previewQueued = true;
    ws.previewQueue = ws.previewQueue.catch(() => {}).then(async () => {
      if (!ws.model.documents.has(doc.id) || ws.window.isDestroyed()) return;
      try {
        ensureView(ws, doc); doc.previewRunning = true; layout(ws);
        const deadline = Date.now() + 10 * 60 * 1000;
        let status;
        do {
          status = await call(doc, 'status');
          if (status?.ready && !status.busy) break;
          if (status?.error) throw new Error(status.error);
          if (!ws.model.documents.has(doc.id) || doc.handle.isDestroyed()) return;
          await new Promise(resolve => setTimeout(resolve, 60));
        } while (Date.now() < deadline);
        if (!status?.ready || status.busy) throw new Error('Preview preparation timed out. Open the file to see its status.');
        const previewPath = doc.path;
        const preview = await call(doc, 'preview');
        if (typeof preview !== 'string' || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(preview) || preview.length > MAX_PREVIEW_BYTES) {
          throw new Error('The file did not produce a bounded PNG preview.');
        }
        if (ws.model.documents.has(doc.id)) {
          if (key(doc.path) !== key(previewPath)) doc.previewAgain = true;
          else { doc.preview = preview; doc.previousPreview = null; doc.error = null; }
        }
      } catch (error) { doc.error = error.message; }
      finally {
        doc.previewQueued = false; doc.previewRunning = false; layout(ws);
        if (doc.previewAgain) { doc.previewAgain = false; queuePreview(ws, doc); }
        evictCleanOverflow(ws);
      }
    });
  }
  function evictCleanOverflow(ws) {
    for (const doc of ws.model.documents.values()) {
      if (doc.root || !doc.view || doc.previewQueued || ws.model.visibleIds.includes(doc.id) || ws.model.activeId === doc.id || doc.status?.dirty || doc.status?.busy) continue;
      if (doc.attached) ws.window.contentView.removeChildView(doc.view);
      doc.view.webContents.close(); doc.view = null; doc.handle = null; doc.preview = null; doc.previousPreview = null;
    }
  }
  async function canLeave(ws) {
    if (ws.dialogActive || ws.closing) return false;
    if (ws.model.mode === 'tiles') return true;
    const active = ws.model.documents.get(ws.model.activeId);
    if (!active) return true;
    // An unresponsive editor must not leave the title-bar action pending
    // forever. Timeout refuses the switch; it never bypasses busy/write guards.
    let timer;
    try {
      const status = await Promise.race([call(active, 'status'), new Promise(resolve => { timer = setTimeout(() => resolve({ busy: true }), 1500); })]);
      return !status?.busy;
    } finally { clearTimeout(timer); }
  }
  async function closeDocument(ws, doc) {
    if (ws.closing || ws.dialogActive) return { ok: false, error: 'Finish the current confirmation first.' };
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
    if (!status && (doc.status?.dirty || doc.status?.busy)) return { ok: false, error: 'This editor is unavailable. Its unsaved changes were kept open.' };
    if (status?.busy) return { ok: false, error: 'Finish the current operation before closing this file.' };
    if (status?.dirty) {
      if (ws.dialogActive) return { ok: false, error: 'Finish the current confirmation before closing another file.' };
      ws.dialogActive = true;
      let result;
      try {
        result = await dialog.showMessageBox(ws.window, { type: 'warning', title: 'Unsaved changes',
          message: `Save changes to ${path.basename(doc.path)} before closing?`,
          ...(doc.metadataFilename ? { detail: `Metadata filename: ${doc.metadataFilename}` } : {}),
          buttons: ['Save', 'Discard changes', 'Cancel'], defaultId: 0, cancelId: 2, noLink: true });
      } finally { ws.dialogActive = false; }
      if (result.response === 2) return { ok: false, canceled: true };
      if (result.response === 0) {
        await call(doc, 'save');
        const saved = await call(doc, 'status');
        if (!saved || saved.dirty || saved.busy) return { ok: false, error: 'The file was not saved. All tabs were kept open.' };
      }
    }
    return { ok: true };
  }
  async function closeAllDocuments(ws, folderId = null) {
    if (ws.closing || ws.dialogActive || [...ws.model.documents.values()].some(doc => doc.closing)) {
      return { ok: false, error: 'Finish the current confirmation before closing all tabs.' };
    }
    ws.closing = true; ws.menuOpen = false; ws.pendingSelection = null; ws.pendingOverview = false;
    const folder = folderId === null ? null : state(ws).folders.find(item => item.id === folderId);
    if (folderId !== null && !folder) { ws.closing = false; throw new Error('This folder tab is no longer open.'); }
    const folderFiles = folder && new Set(folder.files.map(file => file.id));
    const documents = [...ws.model.documents.values()].filter(doc => !folderFiles || folderFiles.has(doc.id));
    layout(ws);
    try {
      for (const doc of documents) await call(doc, 'pause');
      // Two-phase close: cancel/save failure retains even clean/discarded tabs.
      // Successful saves stay saved, but no document is removed until all agree.
      for (const doc of documents) {
        const result = await confirmDocumentClose(ws, doc);
        if (!result.ok) return result;
      }
      for (const doc of documents) await removeDocument(ws, doc, { deferLayout: true });
      return { ok: true, closed: documents.length };
    } finally {
      // webContents.close() is asynchronous. Never execute JS in a removed
      // child while Chromium is tearing it down; that promise can hang.
      for (const doc of documents) {
        if (doc.root || ws.model.documents.has(doc.id)) await call(doc, 'resume').catch(() => {});
      }
      ws.closing = false; layout(ws);
    }
  }
  function removeDocument(ws, doc, { clear = true, deferLayout = false } = {}) {
    let clearing = null;
    ws.model.remove(doc.id);
    if (doc.root) {
      release(doc.handle.webContents.id); if (clear) clearing = call(doc, 'clear').catch(() => {});
      doc.path = null; doc.status = {}; doc.preview = null; doc.previousPreview = null; doc.fileSet = null;
      doc.metadataFilename = null;
    }
    else if (doc.view && !doc.handle.isDestroyed()) {
      if (doc.attached) ws.window.contentView.removeChildView(doc.view); doc.view.webContents.close();
    }
    if (!deferLayout) {
      const active = ws.model.documents.get(ws.model.activeId);
      if (active) ensureView(ws, active);
      layout(ws);
    }
    return clearing;
  }
  function add(ws, fileSet, { overview = true } = {}) {
    if (!fileSet?.path) return ws.window;
    if (ws.closing || ws.dialogActive) throw new Error('Finish the close confirmation before opening another file.');
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
    const ws = { window: win, moduleName, section, model, previewQueue: Promise.resolve(), menuOpen: false,
      sentPreviews: new Map(), sentState: null };
    // The title bar stays interactive even when a native editor covers most
    // of the root renderer. Hidden child editors are throttled independently.
    win.webContents.setBackgroundThrottling(false);
    workspaces.set(section, ws); win.excelsisWorkspace = ws;
    const doc = fileSet?.path ? model.add(fileSet.path) : { id: crypto.randomUUID(), path: null, status: {} };
    doc.root = true; doc.handle = win; doc.fileSet = fileSet; ws.root = doc;
    owners.set(win.webContents.id, { ws, doc, handle: win, root: true });
    win.on('resize', () => layout(ws)); win.on('maximize', () => layout(ws)); win.on('unmaximize', () => layout(ws));
    win.webContents.on('did-finish-load', () => { ws.sentPreviews.clear(); ws.sentState = null; send(ws); });
    win.on('close', event => {
      if (ws.closeApproved) return;
      if (ws.closing || ws.dialogActive) { event.preventDefault(); return; }
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
    getState(sender) {
      const item = record(sender); if (!item) throw new Error('No viewer workspace.');
      const menu = menuState(item.ws);
      return { ...state(item.ws), menuOpen: !!menu, menu, root: item.root, documentId: item.doc.id };
    },
    async cutFile(sender, filePath, beginCut) {
      const item = record(sender);
      if (!item || !item.doc.path || key(item.doc.path) !== key(filePath)) throw new Error('Only the current document can be cut.');
      const { ws, doc } = item;
      if (ws.closing || ws.dialogActive || doc.closing) throw new Error('Finish the current confirmation first.');
      const initial = await call(doc, 'status');
      if (!initial?.ready || initial.busy) throw new Error('Finish loading or editing this file before cutting it.');
      ws.dialogActive = true; ws.menuOpen = false;
      try {
        await call(doc, 'pause');
        const status = await call(doc, 'status');
        if (!status || status.busy || key(status.path || '') !== key(filePath)) throw new Error('The current file changed; Cut was not started.');
        if (status.dirty) {
          const result = await dialog.showMessageBox(ws.window, { type: 'warning', title: 'Save before Cut',
            message: `Save changes to ${path.basename(filePath)} before cutting?`,
            detail: 'The file will be put on the Windows clipboard for a move. Its view stays read-only until pasted or Cut is canceled.',
            buttons: ['Save and Cut', 'Discard changes and Cut', 'Cancel'], defaultId: 0, cancelId: 2, noLink: true });
          if (result.response !== 0 && result.response !== 1) return { ok: false, canceled: true };
          await call(doc, result.response === 0 ? 'save' : 'discard');
          const saved = await call(doc, 'status');
          if (!saved || saved.dirty || saved.busy || key(saved.path || '') !== key(filePath)) {
            return { ok: false, error: 'The file was not saved/discarded. Cut was not started; your file stays open.' };
          }
        }
        return await beginCut();
      } finally {
        ws.dialogActive = false;
        if (doc.root || ws.model.documents.has(doc.id)) await call(doc, 'resume').catch(() => {});
        layout(ws);
      }
    },
    async moved(filePath) {
      // Resolve by original path, never a reused owner/root ID.
      for (const ws of workspaces.values()) {
        const doc = ws.model.find(filePath);
        if (doc) await removeDocument(ws, doc);
      }
    },
    async action(sender, action, id) {
      const item = record(sender);
      if (!item) throw new Error('Only the workspace title bar can control its documents.');
      const { ws } = item;
      let menuGeneration = null;
      if (!item.root) {
        // A document can act only on the visible, main-process-owned menu,
        // never issue arbitrary workspace commands or target another folder.
        const menu = menuState(ws);
        if (!menu || menu.mode !== 'single' || menu.documentId !== item.doc.id || !item.doc.shown) {
          throw new Error('Only the workspace title bar can control its documents.');
        }
        if (action === 'menu-dismiss') { action = 'menu'; id = false; }
        else if (['menu-select', 'menu-close'].includes(action) && menu.folder.files.some(file => file.id === id)) {
          menuGeneration = ws.menuGeneration;
          action = action === 'menu-select' ? 'select' : 'close';
        } else throw new Error('Only the workspace title bar can control its documents.');
      }
      if (ws.closing) return { ok: false, error: 'Finish the close-all confirmation first.' };
      if (action === 'close-all') return closeAllDocuments(ws);
      if (action === 'close-folder') return closeAllDocuments(ws, id);
      if (action === 'folder-context') {
        // Only the root tab bar can request this native menu. Resolve an
        // already-open folder identity, never a renderer-supplied shell path.
        const folder = state(ws).folders.find(folder => folder.id === id?.folderId);
        if (!folder || !Number.isFinite(id?.x) || !Number.isFinite(id?.y)) throw new Error('Unknown folder context menu.');
        if (!showFolderContextMenu || !openFolder) throw new Error('Folder opening is unavailable.');
        const [width, height] = ws.window.getContentSize();
        const point = { x: Math.max(0, Math.min(Math.round(id.x), width - 1)),
          y: Math.max(0, Math.min(Math.round(id.y), height - 1)) };
        ws.menuGeneration = (ws.menuGeneration || 0) + 1; ws.menuOpen = false; layout(ws);
        showFolderContextMenu(ws.window, point, async () => {
          const current = state(ws).folders.find(entry => entry.id === folder.id);
          if (ws.window.isDestroyed() || !current) throw new Error('This folder tab is no longer open.');
          await openFolder(current.path);
        });
        return { ok: true };
      }
      if (action === 'menu') {
        ws.menuGeneration = (ws.menuGeneration || 0) + 1;
        if (!id) ws.menuOpen = false;
        else {
          const folder = state(ws).folders.find(folder => folder.id === id.folderId);
          if (!folder || !Number.isFinite(id.left)) throw new Error('Unknown folder menu.');
          ws.menuOpen = true; ws.menuFolderId = folder.id;
          ws.menuLeft = Math.max(8, Math.min(Math.round(id.left), ws.window.getContentSize()[0] - 410));
          ws.menuDocumentId = ws.model.activeId; ws.menuMode = ws.model.mode;
        }
        layout(ws);
        if (ws.menuOpen && ws.model.mode === 'single') ws.model.documents.get(ws.model.activeId)?.handle?.webContents.focus();
        return { ok: true };
      }
      if (action === 'close') {
        const doc = ws.model.documents.get(id); if (!doc) throw new Error('This document is not in this workspace.');
        if (ws.menuOpen) { ws.menuOpen = false; layout(ws); }
        return closeDocument(ws, doc);
      }
      if (!(await canLeave(ws))) return { ok: false, error: 'Finish the current operation before switching files.' };
      if (menuGeneration !== null && (!ws.menuOpen || ws.menuGeneration !== menuGeneration)) return { ok: false, canceled: true };
      ws.menuOpen = false;
      if (action === 'select') { const doc = ws.model.select(id); ensureView(ws, doc); layout(ws); doc.handle.webContents.focus(); }
      else if (action === 'overview') {
        // Navigation cannot change other documents. Refresh only the editor
        // being left; keep the previous PNG visible until replacement is ready.
        const active = ws.model.documents.get(ws.model.activeId);
        if (ws.model.mode === 'single' && active) { active.previousPreview = active.preview; active.preview = null; }
        ws.model.overview();
        for (const visible of ws.model.visibleIds) queuePreview(ws, ws.model.documents.get(visible)); layout(ws); ws.window.webContents.focus(); }
      else throw new Error('Unknown workspace action.');
      return { ok: true };
    },
    report(sender, status) {
      const item = record(sender); if (!item) throw new Error('No viewer document.');
      item.doc.status = { dirty: !!status?.dirty, busy: !!status?.busy || isBusy(typeof sender === 'number' ? sender : sender.id) };
      item.doc.metadataFilename = metadataFilename(status, item.ws.section);
      if (!item.ws.closing && item.ws.pendingSelection && !item.doc.status.busy && item.ws.model.activeId === item.doc.id) {
        const pending = item.ws.model.documents.get(item.ws.pendingSelection);
        item.ws.pendingSelection = null; item.ws.pendingOverview = false;
        if (pending) { item.ws.model.select(pending.id); ensureView(item.ws, pending); layout(item.ws); pending.handle.webContents.focus(); }
      }
      if (!item.ws.closing && item.ws.pendingOverview && !item.doc.status.busy && item.ws.model.activeId === item.doc.id) {
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
      if (changed) { item.doc.preview = null; item.doc.previousPreview = null; }
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
