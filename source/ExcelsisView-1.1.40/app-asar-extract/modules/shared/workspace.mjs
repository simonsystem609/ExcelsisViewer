import { fitFolderPath } from './path-label.mjs';
const api = globalThis.excelsisWorkspace;
let currentState = null, chrome = null, lastReport = '';
const pathLabels = new Map();
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
  try { const result = await api.action(action, id);
    if (result?.error) chrome.message.textContent = result.error; return result;
  } catch (error) { chrome.message.textContent = error.message || String(error); return { ok: false }; }
}
async function closeMenu() {
  if (!chrome || chrome.menu.hidden) return;
  chrome.menu.hidden = true; await act('menu', false);
  [...chrome.tabs.querySelectorAll('.workspace-tab-menu')].find(button => button.dataset.folderId === chrome.lastMenuFolder)?.focus();
}
async function showFolderMenu(folder, button) {
  const rect = button.getBoundingClientRect();
  await closeMenu(); await act('menu', true); chrome.lastMenuFolder = folder.id;
  chrome.menu.replaceChildren(element('div', 'workspace-menu-title', folder.path));
  for (const file of folder.files) {
    const row = element('div', 'workspace-file-row');
    const select = element('button', 'workspace-file-select', `${file.dirty ? '● ' : ''}${file.name}`);
    select.type = 'button'; select.title = file.path;
    select.addEventListener('click', async () => { await closeMenu(); await act('select', file.id); });
    row.append(select, iconButton(`Close ${file.name}`, '×', async () => { await closeMenu(); await act('close', file.id); }));
    chrome.menu.append(row);
  }
  chrome.menu.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - 410))}px`;
  chrome.menu.hidden = false; chrome.menu.querySelector('button')?.focus();
}
function update(next) {
  if (!chrome) return;
  currentState = { ...currentState, ...next }; const state = currentState;
  chrome.badge.textContent = state.section.toUpperCase(); chrome.overview.disabled = state.count < 2;
  chrome.overview.setAttribute('aria-pressed', String(state.mode === 'tiles'));
  chrome.tabs.replaceChildren();
  pathObserver.disconnect(); pathLabels.clear();
  for (const folder of state.folders) {
    const tab = element('div', 'workspace-tab'); tab.title = folder.path;
    const selected = folder.files.some(file => file.id === state.activeId); tab.classList.toggle('active', selected);
    const label = pathLabel(element('button', 'workspace-tab-label', folder.label), folder.parts, folder.path);
    label.type = 'button'; label.title = folder.path; label.setAttribute('role', 'tab'); label.setAttribute('aria-selected', String(selected));
    label.addEventListener('click', async () => { await closeMenu();
      const file = folder.files.find(item => item.id === state.activeId) || folder.files.at(-1);
      if (file) await act('select', file.id);
    });
    const drop = iconButton(`Opened files in ${folder.label}`, '▾', () => showFolderMenu(folder, drop));
    drop.classList.add('workspace-tab-menu'); drop.setAttribute('aria-haspopup', 'menu');
    drop.dataset.folderId = folder.id;
    tab.append(label, element('span', 'workspace-tab-count', String(folder.files.length)), drop); chrome.tabs.append(tab);
  }
  chrome.tabs.classList.toggle('compact', state.folders.length > 5);
  sizeFolderTabs();
  chrome.content.inert = state.mode === 'tiles' || !chrome.menu.hidden || (state.count > 0 && state.activeId !== state.documentId);
  chrome.content.classList.toggle('workspace-content-covered', chrome.content.inert);
  chrome.tiles.hidden = state.mode !== 'tiles'; chrome.tiles.dataset.count = String(state.tiles.length); chrome.tiles.dataset.section = state.section;
  chrome.tiles.replaceChildren();
  for (const file of state.tiles) {
    const tile = element('article', 'workspace-tile'); tile.dataset.documentId = file.id;
    tile.setAttribute('aria-label', `${file.name}, ${file.folderLabel}`);
    const preview = element('button', 'workspace-preview'); preview.type = 'button';
    preview.title = `Open ${file.name}\n${file.path}`; preview.setAttribute('aria-label', `Open ${file.name}`);
    if (file.preview) { const img = element('img'); img.src = file.preview; img.alt = `Fitted preview of ${file.name}`; img.draggable = false; preview.append(img); }
    else preview.append(element('span', 'workspace-preview-status', file.error || 'Preparing full-quality preview…'));
    preview.addEventListener('click', () => act('select', file.id));
    const caption = element('div', 'workspace-tile-caption');
    caption.append(element('strong', '', `${file.dirty ? '● ' : ''}${file.name}`),
      pathLabel(element('span', '', file.folderLabel), file.folderParts, file.folder));
    const controls = element('div', 'workspace-tile-controls');
    controls.append(iconButton(`Open ${file.name}`, '↗', () => act('select', file.id)), iconButton(`Close ${file.name}`, '×', () => act('close', file.id)));
    tile.append(preview, caption, controls); chrome.tiles.append(tile);
  }
}
async function initializeChrome() {
  if (!api) return;
  try {
    const state = await api.getState(); if (!state.root) return; currentState = state;
    document.body.classList.add('workspace-host');
    const content = element('div'); content.id = 'moduleContent';
    while (document.body.firstChild) content.append(document.body.firstChild);
    const bar = element('div', 'workspace-titlebar'); bar.id = 'workspaceTitlebar';
    const badge = element('span', 'workspace-module-badge');
    const overview = iconButton('Show open-file tiles', '▦', () => act('overview')); overview.id = 'workspaceOverview';
    const tabs = element('div', 'workspace-tabs'); tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Open folders');
    bar.append(badge, overview, tabs, element('div', 'workspace-titlebar-drag'));
    const menu = element('div', 'workspace-folder-menu'); menu.hidden = true; menu.setAttribute('role', 'menu');
    const tiles = element('section', 'workspace-tiles'); tiles.id = 'workspaceTiles'; tiles.hidden = true;
    const message = element('div', 'workspace-message'); message.setAttribute('role', 'status');
    document.body.append(bar, content, tiles, menu, message);
    chrome = { bar, badge, overview, tabs, content, menu, tiles, message };
    api.onChanged(update); update(state);
    dispatchEvent(new Event('resize'));
    document.addEventListener('pointerdown', event => { if (!menu.hidden && !menu.contains(event.target) && !tabs.contains(event.target)) closeMenu(); });
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) { event.preventDefault(); event.stopImmediatePropagation(); closeMenu(); return; }
      if (currentState.mode === 'tiles' && !bar.contains(event.target) && !tiles.contains(event.target)) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, { capture: true });
    window.addEventListener('wheel', event => {
      if (tabs.contains(event.target) && tabs.scrollWidth > tabs.clientWidth) { tabs.scrollLeft += event.deltaY || event.deltaX; event.preventDefault(); return; }
      if (currentState.mode === 'tiles' && !bar.contains(event.target) && !menu.contains(event.target)) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, { passive: false, capture: true });
  } catch (error) { console.error('Could not prepare the viewer workspace', error); }
}
initializeChrome();
