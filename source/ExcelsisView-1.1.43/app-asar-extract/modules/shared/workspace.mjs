import { fitFolderPath } from './path-label.mjs';
const api = globalThis.excelsisWorkspace;
let currentState = null, chrome = null, lastReport = '';
const pathLabels = new Map();
const folderNodes = new Map(), tileNodes = new Map(), previewCache = new Map();
const labelCanvas = document.createElement('canvas');
const labelContext = labelCanvas.getContext('2d');
const pathObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const node = entry.target, parts = pathLabels.get(node);
    if (!parts) continue;
    labelContext.font = getComputedStyle(node).font;
    node.textContent = fitFolderPath(parts, Math.max(0, node.clientWidth - 5), text => labelContext.measureText(text).width);
  }
});
function pathLabel(node, parts, fullPath) {
  pathLabels.set(node, parts); node.title = fullPath; pathObserver.observe(node); return node;
}
function sizeFolderTabs() {
  // Keep the preferred width independent of ResizeObserver's shortened text,
  // so a narrow window cannot gradually shrink the tab's intrinsic width.
  const sizes = [...chrome.tabs.children].map(tab => {
    const label = tab.querySelector('.workspace-tab-label'), style = getComputedStyle(label);
    labelContext.font = style.font;
    const textWidth = labelContext.measureText(pathLabels.get(label).join(' › ')).width;
    const controlsWidth = tab.getBoundingClientRect().width - label.clientWidth +
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    return { tab, width: Math.ceil(textWidth + controlsWidth + 5) };
  });
  for (const { tab, width } of sizes) tab.style.flexBasis = `${width}px`;
}
export function bindDocumentSession(handlers) {
  globalThis.excelsisDocumentSession = handlers; publishDocumentState();
  new MutationObserver(publishDocumentState).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
}
export function publishDocumentState() {
  if (!api || !globalThis.excelsisDocumentSession) return;
  const state = globalThis.excelsisDocumentSession.status();
  const signature = JSON.stringify({ dirty: !!state.dirty, busy: !!state.busy });
  if (signature === lastReport) return;
  lastReport = signature;
  api.report({ dirty: !!state.dirty, busy: !!state.busy }).catch(() => {});
}
export function openWorkspaceFiles(paths) { return api?.openFiles(paths); }
function element(tag, className, text) {
  const node = document.createElement(tag); if (className) node.className = className;
  if (text !== undefined) node.textContent = text; return node;
}
function iconButton(label, text, handler) {
  const button = element('button', 'workspace-icon', text);
  button.type = 'button'; button.title = label; button.setAttribute('aria-label', label);
  button.addEventListener('click', handler); return button;
}
async function act(action, id) {
  chrome.message.textContent = '';
  try { const result = await api.action(action, id);
    if (result?.error) chrome.message.textContent = result.error; return result;
  } catch (error) { chrome.message.textContent = error.message || String(error); return { ok: false }; }
}
async function closeMenu() {
  if (!chrome || !currentState?.menuOpen) return;
  chrome.menu.hidden = true; await act('menu', false);
  [...chrome.tabs.querySelectorAll('.workspace-tab-menu')].find(button => button.dataset.folderId === chrome.lastMenuFolder)?.focus();
}
async function showFolderMenu(folder, button) {
  if (currentState.menuOpen && currentState.menu?.folder.id === folder.id) { await closeMenu(); return; }
  const rect = button.getBoundingClientRect();
  chrome.lastMenuFolder = folder.id;
  await act('menu', { folderId: folder.id, left: rect.left });
}
function createFolderMenu({ inEditor = false, action, dismiss, isOpen, isHeader = () => false }) {
  const menu = element('div', `workspace-folder-menu${inEditor ? ' workspace-menu-in-editor' : ''}`);
  menu.hidden = true; menu.setAttribute('role', 'menu');
  let previous = null, signature = '';
  function render(data) {
    const wasHidden = menu.hidden, changedFolder = previous?.folder.id !== data?.folder.id;
    previous = data; menu.hidden = !data;
    if (!data) return;
    const nextSignature = JSON.stringify(data);
    if (signature !== nextSignature) {
      const focusedId = menu.contains(document.activeElement) ? document.activeElement.dataset.documentId : null;
      const focusedClose = document.activeElement?.classList.contains('workspace-icon');
      menu.replaceChildren(element('div', 'workspace-menu-title', data.folder.path));
      for (const file of data.folder.files) {
        const row = element('div', 'workspace-file-row'); row.classList.toggle('active', file.id === data.documentId);
        const select = element('button', 'workspace-file-select', `${file.dirty ? '● ' : ''}${file.name}`);
        select.type = 'button'; select.title = file.path; select.dataset.documentId = file.id;
        if (file.id === data.documentId) select.setAttribute('aria-current', 'true');
        select.addEventListener('click', () => action('select', file.id));
        const close = iconButton(`Close ${file.name}`, '×', () => action('close', file.id)); close.dataset.documentId = file.id;
        row.append(select, close); menu.append(row);
      }
      if (focusedId) [...menu.querySelectorAll('button')].find(button => button.dataset.documentId === focusedId && button.classList.contains('workspace-icon') === focusedClose)?.focus();
      signature = nextSignature;
    }
    menu.style.left = `${Math.max(8, Math.min(data.left, innerWidth - 410))}px`;
    if (wasHidden || changedFolder) menu.querySelector('button')?.focus();
  }
  window.addEventListener('pointerdown', event => {
    if (!isOpen() || menu.contains(event.target) || isHeader(event.target)) return;
    // The dismissal click is not a CAD edit/PDF annotation underneath it.
    event.preventDefault(); event.stopImmediatePropagation(); dismiss();
  }, { capture: true });
  window.addEventListener('keydown', event => {
    if (!isOpen()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (event.key === 'Escape') { dismiss(); return; }
    const buttons = [...menu.querySelectorAll('button')], focused = buttons.indexOf(document.activeElement);
    if (event.key === 'Tab' && buttons.length) buttons[(focused + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      const rows = [...menu.querySelectorAll('.workspace-file-select')];
      const row = document.activeElement?.closest('.workspace-file-row')?.querySelector('.workspace-file-select');
      const index = rows.indexOf(row), next = event.key === 'Home' ? 0 : event.key === 'End' ? rows.length - 1
        : (index + (event.key === 'ArrowUp' ? -1 : 1) + rows.length) % rows.length;
      rows[next]?.focus();
    } else if (['Enter', ' '].includes(event.key) && document.activeElement?.tagName === 'BUTTON') document.activeElement.click();
  }, { capture: true });
  window.addEventListener('wheel', event => {
    if (isOpen() && !menu.contains(event.target)) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, { passive: false, capture: true });
  window.addEventListener('resize', () => { if (previous) menu.style.left = `${Math.max(8, Math.min(previous.left, innerWidth - 410))}px`; });
  return { menu, render };
}
function initializeEditorMenu(state) {
  let data = state.mode === 'single' && state.activeId === state.documentId ? state.menu : null;
  const message = element('div', 'workspace-message'); message.setAttribute('role', 'status');
  const action = async (kind, id) => {
    message.textContent = '';
    try { const result = await api.action(`menu-${kind}`, id); if (result?.error) message.textContent = result.error; }
    catch (error) { message.textContent = error.message || String(error); }
  };
  const controller = createFolderMenu({ inEditor: true, action, isOpen: () => !!data,
    dismiss: () => action('dismiss') });
  document.body.append(controller.menu, message);
  api.onMenuChanged(next => { data = next; controller.render(data); }); controller.render(data);
}
function forgetNode(node) {
  for (const label of pathLabels.keys()) if (node.contains(label)) { pathObserver.unobserve(label); pathLabels.delete(label); }
  node.remove();
}
function orderNodes(parent, nodes) {
  nodes.forEach((node, index) => { if (parent.children[index] !== node) parent.insertBefore(node, parent.children[index] || null); });
}
function update(next) {
  if (!chrome) return;
  currentState = { ...currentState, ...next }; const state = currentState;
  chrome.badge.textContent = state.section.toUpperCase(); chrome.overview.disabled = state.count < 2;
  chrome.overview.setAttribute('aria-pressed', String(state.mode === 'tiles'));
  const folderIds = new Set(state.folders.map(folder => folder.id));
  let sizesChanged = false;
  for (const [id, nodes] of folderNodes) if (!folderIds.has(id)) { forgetNode(nodes.tab); folderNodes.delete(id); sizesChanged = true; }
  for (const folder of state.folders) {
    let nodes = folderNodes.get(folder.id);
    if (!nodes) {
      const tab = element('div', 'workspace-tab'); tab.title = folder.path;
      const label = pathLabel(element('button', 'workspace-tab-label', folder.label), folder.parts, folder.path);
      label.type = 'button'; label.setAttribute('role', 'tab');
      const latest = () => currentState.folders.find(item => item.id === folder.id);
      label.addEventListener('click', async () => { await closeMenu();
        const files = latest()?.files || [], file = files.find(item => item.id === currentState.activeId) || files.at(-1);
        if (file) await act('select', file.id);
      });
      const drop = iconButton(`Opened files in ${folder.label}`, '▾', () => { const item = latest(); if (item) showFolderMenu(item, drop); });
      drop.classList.add('workspace-tab-menu'); drop.setAttribute('aria-haspopup', 'menu'); drop.dataset.folderId = folder.id;
      const count = element('span', 'workspace-tab-count'); tab.append(label, count, drop);
      nodes = { tab, label, count, drop }; folderNodes.set(folder.id, nodes); sizesChanged = true;
    }
    if (nodes.count.textContent !== String(folder.files.length)) { nodes.count.textContent = String(folder.files.length); sizesChanged = true; }
    const selected = folder.files.some(file => file.id === state.activeId);
    nodes.tab.classList.toggle('active', selected); nodes.label.setAttribute('aria-selected', String(selected));
    nodes.drop.setAttribute('aria-expanded', String(!!state.menuOpen && state.menu?.folder.id === folder.id));
  }
  orderNodes(chrome.tabs, state.folders.map(folder => folderNodes.get(folder.id).tab));
  chrome.tabs.classList.toggle('compact', state.folders.length > 5);
  if (sizesChanged) sizeFolderTabs();
  const wasCovered = chrome.content.classList.contains('workspace-content-covered');
  const covered = state.mode === 'tiles' || (state.count > 0 && state.activeId !== state.documentId);
  chrome.content.inert = covered || !!state.menuOpen;
  chrome.content.classList.toggle('workspace-content-covered', covered);
  if (wasCovered && !covered) dispatchEvent(new Event('resize'));
  chrome.folderMenu.render(state.menuOpen && (state.mode === 'tiles' || state.activeId === state.documentId) ? state.menu : null);
  chrome.tiles.hidden = state.mode !== 'tiles'; chrome.tiles.dataset.count = String(state.tiles.length); chrome.tiles.dataset.section = state.section;
  const tileIds = new Set(state.tiles.map(file => file.id));
  for (const [id, nodes] of tileNodes) if (!tileIds.has(id)) { forgetNode(nodes.tile); tileNodes.delete(id); previewCache.delete(id); }
  for (const file of state.tiles) {
    if (Object.hasOwn(file, 'preview')) previewCache.set(file.id, file.preview);
    let nodes = tileNodes.get(file.id);
    if (!nodes) {
      const tile = element('article', 'workspace-tile'); tile.dataset.documentId = file.id;
      const preview = element('button', 'workspace-preview'); preview.type = 'button';
      preview.addEventListener('click', () => act('select', file.id));
      const caption = element('div', 'workspace-tile-caption'), name = element('strong');
      const label = pathLabel(element('span', '', file.folderLabel), file.folderParts, file.folder); caption.append(name, label);
      const controls = element('div', 'workspace-tile-controls');
      controls.append(iconButton(`Open ${file.name}`, '↗', () => act('select', file.id)), iconButton(`Close ${file.name}`, '×', () => act('close', file.id)));
      tile.append(preview, caption, controls); nodes = { tile, preview, name, label, controls, image: null, path: file.path }; tileNodes.set(file.id, nodes);
    }
    nodes.tile.setAttribute('aria-label', `${file.name}, ${file.folderLabel}`);
    nodes.preview.title = `Open ${file.name}\n${file.path}`; nodes.preview.setAttribute('aria-label', `Open ${file.name}`);
    for (const [index, button] of [...nodes.controls.children].entries()) {
      const title = `${index ? 'Close' : 'Open'} ${file.name}`; button.title = title; button.setAttribute('aria-label', title);
    }
    const title = `${file.dirty ? '● ' : ''}${file.name}`; if (nodes.name.textContent !== title) nodes.name.textContent = title;
    if (nodes.path !== file.path) { nodes.path = file.path; nodes.label.title = file.folder; pathLabels.set(nodes.label, file.folderParts); nodes.label.textContent = file.folderLabel; }
    const png = previewCache.get(file.id) || null;
    if (png && nodes.png !== png) {
      const img = element('img'); img.src = png; img.alt = `Fitted preview of ${file.name}`; img.draggable = false;
      nodes.preview.replaceChildren(img); nodes.image = img;
    } else if (!png) {
      const text = file.error || 'Preparing full-quality preview…';
      if (nodes.preview.textContent !== text || nodes.image) nodes.preview.replaceChildren(element('span', 'workspace-preview-status', text));
      nodes.image = null;
    }
    nodes.png = png;
  }
  orderNodes(chrome.tiles, state.tiles.map(file => tileNodes.get(file.id).tile));
}
async function initializeChrome() {
  if (!api) return;
  try {
    const state = await api.getState(); if (!state.root) { initializeEditorMenu(state); return; } currentState = state;
    document.body.classList.add('workspace-host');
    const content = element('div'); content.id = 'moduleContent';
    while (document.body.firstChild) content.append(document.body.firstChild);
    const bar = element('div', 'workspace-titlebar'); bar.id = 'workspaceTitlebar';
    const badge = element('span', 'workspace-module-badge');
    const overview = iconButton('Show open-file tiles', '▦', async () => { await closeMenu(); await act('overview'); }); overview.id = 'workspaceOverview';
    const tabs = element('div', 'workspace-tabs'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Open folders');
    bar.append(badge, overview, tabs, element('div', 'workspace-titlebar-drag'));
    const folderMenu = createFolderMenu({
      action: async (kind, id) => { await closeMenu(); await act(kind, id); },
      dismiss: closeMenu, isOpen: () => !!currentState?.menuOpen, isHeader: target => bar.contains(target),
    });
    const menu = folderMenu.menu;
    const tiles = element('section', 'workspace-tiles'); tiles.id = 'workspaceTiles'; tiles.hidden = true;
    const message = element('div', 'workspace-message'); message.setAttribute('role', 'status');
    document.body.append(bar, content, tiles, menu, message);
    chrome = { bar, badge, overview, tabs, content, menu, folderMenu, tiles, message };
    api.onChanged(update); update(state);
    dispatchEvent(new Event('resize'));
    window.addEventListener('keydown', event => {
      if (currentState.mode === 'tiles' && !bar.contains(event.target) && !tiles.contains(event.target)) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, { capture: true });
    window.addEventListener('wheel', event => {
      if (tabs.contains(event.target) && tabs.scrollWidth > tabs.clientWidth) { tabs.scrollLeft += event.deltaY || event.deltaX; event.preventDefault(); return; }
      if (currentState.mode === 'tiles' && !bar.contains(event.target) && !menu.contains(event.target)) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, { passive: false, capture: true });
  } catch (error) { console.error('Could not prepare the viewer workspace', error); }
}
initializeChrome();
