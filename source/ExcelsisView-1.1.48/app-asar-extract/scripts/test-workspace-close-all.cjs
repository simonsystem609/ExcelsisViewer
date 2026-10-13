// Exact main-process close-all code with synthetic, non-mutating view stubs.
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { createViewerWorkspaces } = require('../viewer-workspace.cjs');
let nextId = 1;
let teardownJavaScriptCalls = 0;
class Contents extends EventEmitter {
  constructor() { super(); this.id = nextId++; this.state = { ready: true, dirty: false, busy: false }; this.paused = false; }
  isDestroyed() { return !!this.destroyed; }
  getLastWebPreferences() { return {}; }
  setBackgroundThrottling() {} getBackgroundThrottling() { return false; }
  send() {} focus() {} setWindowOpenHandler() {}
  async loadURL() { this.emit('did-finish-load'); }
  close() { this.closeRequested = true; setImmediate(() => { this.destroyed = true; this.emit('destroyed'); }); }
  async executeJavaScript(expression) {
    if (this.closeRequested) { teardownJavaScriptCalls++; throw new Error('Never execute JS while this child is closing'); }
    if (expression.includes('.status()')) return { ...this.state };
    if (expression.includes('.setClosing?.(true)')) { this.paused = true; return; }
    if (expression.includes('.setClosing?.(false)')) { this.paused = false; return; }
    if (expression.includes('.save()')) {
      this.saves = (this.saves || 0) + 1;
      if (!this.saveFails) this.state.dirty = false;
      return !this.saveFails;
    }
    if (expression.includes('.clear()')) { this.state = { ready: false, dirty: false, busy: false }; return; }
  }
}
class View { constructor() { this.webContents = new Contents(); } setVisible() {} setBounds() {} }
class Window extends EventEmitter {
  constructor() { super(); this.webContents = new Contents(); this.children = new Set();
    this.contentView = { addChildView: view => this.children.add(view), removeChildView: view => this.children.delete(view) }; }
  isDestroyed() { return false; } getContentSize() { return [1240, 850]; }
  isMinimized() { return false; } show() {} focus() {}
}
async function run() {
  for (const section of ['dxf', 'dwg', 'pdf']) {
    const prompts = [], responses = [];
    let heldDialog = null;
    const manager = createViewerWorkspaces({ WebContentsView: View, entryUrl: () => 'about:blank', preferences: () => ({}),
      register() {}, release() {}, dialog: { async showMessageBox(_owner, options) {
        prompts.push(options); assert.deepEqual(options.buttons, ['Save', 'Discard changes', 'Cancel']);
        if (heldDialog) return heldDialog();
        assert(responses.length, 'Unexpected prompt'); return { response: responses.shift() };
      } } });
    const win = new Window(), ws = manager.attach(win, section === 'pdf' ? '3dpdf' : 'dxf', section, { path: `C:\\Synthetic\\Clean.${section}` });
    const first = manager.add(ws, { path: `C:\\Synthetic\\One.${section}` }, { overview: false });
    const second = manager.add(ws, { path: `C:\\Synthetic\\Two.${section}` }, { overview: false });
    const child = first.webContents, other = second.webContents;
    await assert.rejects(manager.action(child, 'close-all'), /title bar/);
    child.state.dirty = true; other.state.dirty = true;
    const ids = () => manager.getState(win.webContents).folders.flatMap(folder => folder.files).map(file => file.id);
    const originalIds = ids();
    responses.push(0, 2);
    assert.equal((await manager.action(win.webContents, 'close-all')).canceled, true);
    assert.deepEqual(ids(), originalIds, 'A later Cancel retains all tabs, including the earlier successfully saved one');
    assert.equal(child.saves, 1); assert.equal(child.state.dirty, false); assert.equal(other.state.dirty, true);
    assert.equal(win.webContents.paused, false); assert.equal(child.paused, false); assert.equal(other.paused, false);
    assert(prompts[0].message.includes(`One.${section}`)); assert(prompts[1].message.includes(`Two.${section}`));
    other.saveFails = true; responses.push(0);
    assert.equal((await manager.action(win.webContents, 'close-all')).ok, false);
    assert.deepEqual(ids(), originalIds); other.saveFails = false;
    other.state.busy = true;
    assert.equal((await manager.action(win.webContents, 'close-all')).ok, false);
    assert.deepEqual(ids(), originalIds); other.state.busy = false;
    let finishDialog;
    heldDialog = () => new Promise(resolve => { finishDialog = resolve; });
    const pending = manager.action(win.webContents, 'close-all');
    for (let attempt = 0; !finishDialog && attempt < 100; attempt++) await new Promise(resolve => setImmediate(resolve));
    assert(finishDialog); assert.equal(child.paused, true); assert.equal(other.paused, true);
    assert.equal(manager.getState(win.webContents).closing, true);
    assert.equal((await manager.action(win.webContents, 'close-all')).ok, false);
    assert.equal((await manager.action(win.webContents, 'select', originalIds[0])).ok, false);
    assert.throws(() => manager.add(ws, { path: `C:\\Synthetic\\New.${section}` }), /confirmation/);
    finishDialog({ response: 1 }); heldDialog = null;
    assert.equal((await pending).closed, 3);
    assert.equal(manager.getState(win.webContents).count, 0);
    assert.equal(win.children.size, 0); assert.equal(win.webContents.paused, false);
    manager.add(ws, { path: `C:\\Synthetic\\Reopened.${section}` }, { overview: false });
    assert.equal(manager.getState(win.webContents).count, 1);
    assert.equal((await manager.action(win.webContents, 'close-all')).ok, true);
  }
  assert.equal(teardownJavaScriptCalls, 0, 'No resume/status script reaches an asynchronously closing child');
  console.log(JSON.stringify({ passed: true, allModules: true, sequentialPrompts: true, atomicCancel: true,
    savedBeforeCancelStaysSaved: true, saveFailure: true, busyRefusal: true, pausedEditors: true,
    reentrancyGuard: true, childDenied: true, reopenedAfterClose: true }));
}
run().catch(error => { console.error(error); process.exitCode = 1; });
