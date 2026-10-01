// Exercise the real, sandboxed editors and title-bar input, not only the model.
// Synthetic local fixtures and a separate profile; never controls the user's UI.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const project = path.resolve(__dirname, '..');
if (!process.versions.electron) {
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE; delete env.NODE_OPTIONS;
  const child = require('node:child_process').spawn(require('electron'), [__filename, ...process.argv.slice(2)],
    { cwd: project, windowsHide: true, stdio: 'inherit', env });
  child.on('exit', code => { process.exitCode = code ?? 1; });
} else {
  process.on('uncaughtException', error => { console.error(error); require('electron').app.exit(1); });
  run().catch(error => { console.error(error); require('electron').app.exit(1); });
}
async function run() {
  const { app, BrowserWindow, dialog } = require('electron');
  const responses = [], prompts = [];
  dialog.showMessageBox = async (_owner, options) => {
    assert.equal(options.title, 'Unsaved changes'); assert(responses.length, 'Unexpected native dialog');
    prompts.push(options); return { response: responses.shift() };
  };
  const offscreen = !process.argv.includes('--native');
  const nativeShown = process.argv.includes('--native-shown');
  const localIndex = process.argv.indexOf('--local-dxf');
  const localDxfs = localIndex < 0 ? null : process.argv.slice(localIndex + 1, localIndex + 5).map(file => path.resolve(file));
  if (localDxfs) assert(localDxfs.length === 4 && localDxfs.every(file => path.extname(file).toLowerCase() === '.dxf' && fs.statSync(file).isFile()), 'Four existing DXFs are required');
  const originalLocalBytes = localDxfs?.map(file => fs.readFileSync(file));
  const sections = localDxfs ? ['dxf'] : ['dxf', 'dwg', 'pdf'];
  if (nativeShown) app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
  const root = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'excelsis-switching-'));
  app.setPath('appData', path.join(app.getPath('appData'), path.basename(root))); app.setAppPath(project);
  const watchdog = setTimeout(() => { console.error('Editor switching gate timed out'); app.exit(2); }, 180000);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const bounded = (promise, label, ms = 6000) => {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Stalled: ' + label)), ms); })])
      .finally(() => clearTimeout(timer));
  };
  async function wait(check, label, ms = 20000) {
    for (const until = Date.now() + ms; Date.now() < until;) {
      if (await bounded(Promise.resolve().then(check), label)) return; await delay(40);
    }
    throw new Error('Timed out: ' + label);
  }
  const files = {}, drawings = new Map(), { PDFDocument, rgb } = require('pdf-lib');
  for (const section of ['dxf', 'dwg', 'pdf']) {
    const folder = path.join(root, section, 'Production', 'Drawings'); fs.mkdirSync(folder, { recursive: true });
    files[section] = [];
    for (let i = 0; i < 4; i++) {
      const file = path.join(folder, `Part ${i + 1}.${section}`); files[section].push(file);
      let text = '0\nSECTION\n2\nENTITIES\n';
      for (let j = 0; j < 80; j++) text += `0\nCIRCLE\n8\nHOLES\n10\n${(j % 10) * 15}\n20\n${Math.floor(j / 10) * 15}\n40\n${2 + i}\n`;
      text += '0\nENDSEC\n0\nEOF\n';
      if (section === 'pdf') {
        const pdf = await PDFDocument.create(), page = pdf.addPage([300, 400]);
        page.drawText(`SWITCH TEST ${i + 1}`, { x: 25, y: 340, size: 18 });
        page.drawRectangle({ x: 30, y: 50, width: 150, height: 150, color: rgb(.2, .4, .8) });
        fs.writeFileSync(file, await pdf.save());
      } else if (section === 'dwg') {
        const decoded = path.join(folder, `converted-${i}.dxf`); fs.writeFileSync(decoded, text);
        drawings.set(file, decoded); fs.writeFileSync(file, 'synthetic DWG fixture');
      } else fs.writeFileSync(file, text);
    }
  }
  require('../dwg-converter.cjs').convertedDxfPath = async file => {
    assert(drawings.has(file)); return drawings.get(file);
  };
  if (localDxfs) files.dxf = localDxfs;
  const Module = require('node:module'), main = new Module(path.join(project, 'main.cjs'), module);
  main.filename = path.join(project, 'main.cjs'); main.paths = Module._nodeModulePaths(project);
  const footer = `\nglobalThis.__switchTest={view:()=>JSON.stringify(state.view),state,canvas,
    fit:()=>{const box=fitBoxForEntities(state.doc.entities.filter(e=>e.supported&&!e.deleted&&!e.isAnnotation)),{w,h}=screenSize();
      return {w,h,x:(box.minX+box.maxX)/2*state.view.scale+state.view.ox,
        y:-(box.minY+box.maxY)/2*state.view.scale+state.view.oy,
        scale:state.view.scale,expectedScale:Math.min(w*.88/Math.max(1,box.maxX-box.minX),h*.88/Math.max(1,box.maxY-box.minY))};}};`;
  const pdfFooter = '\nglobalThis.__switchThree={ready:()=>!!modelRoot&&!!renderer,view:()=>JSON.stringify({pivot:pivot?.position.toArray(),rotation:viewQuaternion.toArray(),dist})};';
  let source = fs.readFileSync(main.filename, 'utf8').replaceAll('new BrowserWindow({', 'new BrowserWindow({ show: false, skipTaskbar: true, x: -16000, y: -16000,')
    .replaceAll('webPreferences: {', offscreen ? 'webPreferences: { offscreen: true,' : 'webPreferences: {')
    .replace('secureWebContents(handle, moduleEntryUrl(handle.excelsisModuleName));',
      'secureWebContents(handle, moduleEntryUrl(handle.excelsisModuleName)); if(handle.webContents.getLastWebPreferences().offscreen){handle.webContents.on("paint",()=>{});handle.webContents.setFrameRate(60);}')
    .replace('const body = await fs.readFile(requestedPath);', `let body = await fs.readFile(requestedPath);
      if(requestedPath===${JSON.stringify(path.join(project, 'modules/dxf/app.js'))}) body=Buffer.concat([body,Buffer.from(${JSON.stringify(footer)})]);
      if(requestedPath===${JSON.stringify(path.join(project, 'modules/3dpdf/app.mjs'))}) body=Buffer.concat([body,Buffer.from(${JSON.stringify(pdfFooter)})]);`)
    .replace('"Content-Length": String(stat.size)', '"Content-Length": String(body.length)');
  main._compile(source + '\nmodule.exports.__test={createDxfWindow,create3dPdfWindow,fileSetForFile,viewerWorkspaces};', main.filename);
  const api = main.exports.__test;
  await app.whenReady(); await wait(() => BrowserWindow.getAllWindows().length, 'launcher');
  BrowserWindow.getAllWindows().forEach(win => { win.hide(); win.show = () => {}; win.focus = () => {}; });
  // Batch-file startup has no launcher. Keep a hidden test-only window alive
  // until the final original-byte assertions, rather than quitting on close.
  if (localDxfs) new BrowserWindow({ show: false, skipTaskbar: true, width: 1, height: 1,
    webPreferences: { sandbox: true, nodeIntegration: false, contextIsolation: true } });
  const evaluate = (handle, code) => bounded(handle.webContents.executeJavaScript(code), 'renderer evaluation');
  async function click(handle, selector) {
    const point = await evaluate(handle, `(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();
      return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2),disabled:e.disabled,width:r.width,height:r.height}})()`);
    assert(point.width > 0 && point.height > 0 && !point.disabled, 'Input target is visible and enabled: ' + selector);
    handle.webContents.focus();
    handle.webContents.sendInputEvent({ type: 'mouseMove', x: point.x, y: point.y });
    handle.webContents.sendInputEvent({ type: 'mouseDown', button: 'left', clickCount: 1, x: point.x, y: point.y });
    handle.webContents.sendInputEvent({ type: 'mouseUp', button: 'left', clickCount: 1, x: point.x, y: point.y });
  }
  async function rendered(handle, section, label) {
    await wait(() => evaluate(handle, `(()=>{const c=document.querySelector(${JSON.stringify(section === 'pdf' ? '#pdfPages canvas' : '#canvas')});
      if(!c||c.width<100||c.height<100)return false;const r=c.getBoundingClientRect();
      if(r.width<100||r.height<100||getComputedStyle(c).visibility==='hidden')return false;
      const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      let marks=0;for(let i=0;i<d.length;i+=16)if(d[i+3]>0&&${section === 'pdf' ? 'd[i]<230&&d[i+1]<230' : 'd[i]>100||d[i+1]>100||d[i+2]>100'})marks++;
      return marks>200;})()`), label + ' canvas paints actual geometry');
    const frame = await bounded(handle.webContents.capturePage(undefined, { stayHidden: true }), label + ' compositor capture');
    assert(!frame.isEmpty());
    const region = await evaluate(handle, `(()=>{const r=document.querySelector(${JSON.stringify(section === 'pdf' ? '#pdfPages canvas' : '#canvas')}).getBoundingClientRect();
      return {x:Math.ceil(r.left),y:Math.ceil(r.top),width:Math.floor(Math.min(r.width,innerWidth-r.left)),height:Math.floor(Math.min(r.height,innerHeight-r.top))}})()`);
    const bitmap = frame.crop(region).toBitmap(); let marks = 0;
    for (let i = 0; i < bitmap.length; i += 16) if (bitmap[i + 3] && (section === 'pdf'
      ? bitmap[i + 1] < 230 && bitmap[i + 2] < 230 : bitmap[i] > 100 || bitmap[i + 1] > 100 || bitmap[i + 2] > 100)) marks++;
    assert(marks > 100, 'Native compositor shows the drawing, not just a populated offscreen canvas');
    fs.writeFileSync(path.join(root, `${section}-${label}.png`), frame.toPNG());
  }
  const report = {};
  async function cadFit(handle) {
    await wait(() => evaluate(handle, `(()=>{const f=__switchTest.fit();return Math.abs(f.x-f.w/2)<1&&
      Math.abs(f.y-f.h/2)<1&&Math.abs(f.scale-f.expectedScale)<1e-7;})()`), 'CAD fit settles in final viewport');
    return evaluate(handle, '__switchTest.fit()');
  }
  for (const section of sections) {
    console.log('Real editor switching:', section, offscreen ? 'offscreen' : nativeShown ? 'native shown outside desktop' : 'native hidden');
    const handles = [];
    if (localDxfs) {
      // Main consumes these real file arguments exactly as an Explorer batch
      // launch. Do not open them a second time and accidentally change modes.
      await wait(() => api.viewerWorkspaces.find('dxf')?.model.documents.size === 4, 'Explorer batch creates four documents');
      const workspace = api.viewerWorkspaces.find('dxf'), native = workspace.window;
      native.focus = () => {}; native.show = () => native.showInactive(); native.showInactive();
      localDxfs.forEach(file => handles.push(api.viewerWorkspaces.findFile(file)));
      await wait(() => workspace.model.snapshot().tiles.every(tile => tile.preview), 'Explorer batch previews');
      const first = workspace.model.find(localDxfs[0]);
      await click(native, `.workspace-tile[data-document-id="${first.id}"] .workspace-preview`);
      await wait(() => workspace.model.mode === 'single' && workspace.model.activeId === first.id, 'Explorer first tile opens');
      await rendered(first.handle, section, 'initial');
      await cadFit(first.handle);
      await click(native, '#workspaceOverview'); await wait(() => workspace.model.mode === 'tiles', 'Explorer grid return');
    } else for (let i = 0; i < 4; i++) {
      const set = await api.fileSetForFile(files[section][i], section === 'pdf' ? '3dpdf' : 'dxf');
      const handle = section === 'pdf' ? api.create3dPdfWindow(set) : api.createDxfWindow(set);
      const native = handle.nativeWindow || handle; native.focus = () => {};
      if (nativeShown) { native.show = () => native.showInactive(); native.showInactive(); }
      else { native.hide(); native.show = () => {}; }
      // A hidden test host needs a compositor for its title bar. Child views
      // keep the production throttling/visibility policy (no test override).
      if (!i && !nativeShown) native.webContents.setBackgroundThrottling(false);
      if (offscreen) { handle.webContents.on('paint', () => {}); handle.webContents.setFrameRate(60); }
      handles.push(handle);
      if (!i) {
        await wait(() => evaluate(handle, '!!globalThis.excelsisDocumentSession?.status().ready&&!globalThis.excelsisDocumentSession?.status().busy'), section + ' ready');
        try { await rendered(handle, section, 'initial'); if (section !== 'pdf') await cadFit(handle); }
        catch (error) {
          console.error(JSON.stringify({ evidence: root, debug: await evaluate(handle, `({status:excelsisDocumentSession.status(),view:globalThis.__switchTest?.view(),
            entities:globalThis.__switchTest?.state.doc?.entities.length,canvas:globalThis.__switchTest?{width:__switchTest.canvas.width,height:__switchTest.canvas.height,rect:__switchTest.canvas.getBoundingClientRect().toJSON()}:null,
            hidden:document.hidden,covered:document.getElementById('moduleContent')?.inert})`) }));
          const frame = await bounded(handle.webContents.capturePage(undefined, { stayHidden: true }), 'failed initial capture');
          fs.writeFileSync(path.join(root, 'failed-initial.png'), frame.toPNG()); throw error;
        }
      }
    }
    const native = handles[0], ws = api.viewerWorkspaces.find(section);
    const state = () => api.viewerWorkspaces.getState(native.webContents);
    await wait(() => state().mode === 'tiles' && state().tiles.every(tile => tile.preview), 'four previews');
    await wait(() => [...ws.model.documents.values()].every(doc => !doc.previewQueued), 'initial preview jobs finish');
    await evaluate(native, 'globalThis.__originalTileImages=new Map([...document.querySelectorAll(".workspace-tile")].map(tile=>[tile.dataset.documentId,tile.querySelector("img")]));true');
    for (const doc of ws.model.documents.values()) await evaluate(doc.handle,
      'globalThis.__previewCalls=0;const preview=excelsisDocumentSession.preview;excelsisDocumentSession.preview=()=>{__previewCalls++;return preview()};true');
    for (let pass = 0; pass < 4; pass++) {
      const index = [3, 1, 0, 1][pass], doc = ws.model.find(files[section][index]);
      const [width, height] = [[1680, 900], [900, 700], [1240, 820], [1680, 900]][pass];
      const previousSize = await evaluate(native, '({w:innerWidth,h:innerHeight})');
      native.setContentSize(width, height);
      // Windows/offscreen caption frames report different content-size
      // offsets. Assert the real renderer changes, then measure its canvas.
      await wait(() => evaluate(native, `innerWidth!==${previousSize.w}||innerHeight!==${previousSize.h}`), 'overview receives resize');
      await delay(120);
      const started = Date.now();
      await click(native, `.workspace-tile[data-document-id="${doc.id}"] .workspace-preview`);
      await wait(() => state().mode === 'single' && state().activeId === doc.id, 'tile opens editor');
      assert.deepEqual(native.contentView.children.filter(view => view !== native.webContentsView), doc.view ? [doc.view] : [], 'Only the selected editor is attached');
      console.log(JSON.stringify({ section, pass, bounds: doc.view?.getBounds(), visible: doc.view?.getVisible(),
        throttling: doc.handle.webContents.getBackgroundThrottling(),
        editor: await evaluate(doc.handle, '({width:innerWidth,height:innerHeight,visibility:document.visibilityState,status:excelsisDocumentSession.status(),view:globalThis.__switchTest?.view(),canvasSize:globalThis.__switchTest?{width:__switchTest.canvas.width,height:__switchTest.canvas.height}:null})') }));
      await rendered(doc.handle, section, 'selected-' + pass);
      if (section !== 'pdf') {
        const fit = await cadFit(doc.handle);
        console.log(JSON.stringify({ section, pass, fit }));
        assert(Math.abs(fit.x - fit.w / 2) < 1 && Math.abs(fit.y - fit.h / 2) < 1,
          'Tile opens centered in the final viewport after overview resize');
        assert(Math.abs(fit.scale - fit.expectedScale) < 1e-7, 'Tile opens fitted to its actual viewport');
      }
      if (section === 'pdf') {
        // The previous full-quality bitmap stays visible while resize lays
        // out a narrower PDF. Its backing width is not the current zoom size.
        await wait(() => evaluate(doc.handle, `document.getElementById('pdfZoom').value!=='fit-width'||
          Math.abs(document.querySelector('#pdfPages canvas').clientWidth-(document.getElementById('pdfScroller').clientWidth-56))<2`), 'PDF fit-width layout settles');
        const before = await evaluate(doc.handle, `(()=>{globalThis.__pdfBeforeCanvas=document.querySelector('#pdfPages canvas');
          return {width:__pdfBeforeCanvas.clientWidth,mode:document.getElementById('pdfZoom').value};})()`);
        await click(doc.handle, '#pdfZoomIn');
        await wait(() => evaluate(doc.handle, `document.getElementById('pdfZoom').value!==${JSON.stringify(before.mode)}&&
          document.querySelector('#pdfPages canvas')!==__pdfBeforeCanvas&&document.querySelector('#pdfPages canvas').clientWidth>${before.width}`), 'PDF editor accepts zoom input and completes its new bitmap');
      } else {
        const before = await evaluate(doc.handle, '__switchTest.view()');
        const point = await evaluate(doc.handle, '(()=>{const r=__switchTest.canvas.getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)}})()');
        doc.handle.webContents.sendInputEvent({ type: 'mouseWheel', ...point, deltaY: 100, deltaX: 0, canScroll: true });
        await wait(() => evaluate(doc.handle, `__switchTest.view()!==${JSON.stringify(before)}`), 'CAD editor accepts wheel input');
        await click(doc.handle, '#fitBtn');
        await wait(() => evaluate(doc.handle, `__switchTest.view()===${JSON.stringify(before)}`), 'CAD editor accepts Fit input');
      }
      if (pass === 0 || pass === 2) {
        const retained = await evaluate(doc.handle, section === 'pdf'
          ? "JSON.stringify({zoom:document.getElementById('pdfZoom').value,top:document.getElementById('pdfScroller').scrollTop,left:document.getElementById('pdfScroller').scrollLeft})"
          : '__switchTest.view()');
        await click(native, '.workspace-tab-menu');
        await wait(() => ws.menuOpen, 'folder menu opens');
        assert.equal(ws.model.mode, 'single'); assert.equal(ws.model.activeId, doc.id);
        if (doc.view) assert(doc.view.getVisible() && doc.attached && !doc.handle.webContents.getBackgroundThrottling(), 'Folder menu does not hide, detach or throttle the current editor');
        assert(await evaluate(doc.handle, `getComputedStyle(document.querySelector(${JSON.stringify(section === 'pdf' ? '#pdfPages canvas' : '#canvas')})).visibility!=='hidden'`), 'Current file remains visible under its folder menu');
        await wait(() => evaluate(doc.handle, "!!document.querySelector('.workspace-folder-menu:not([hidden])')"), 'menu overlays the actual editor');
        await rendered(doc.handle, section, 'menu-' + pass);
        await click(native, '.workspace-tab-menu');
        await wait(() => !ws.menuOpen, 'same dropdown arrow closes the menu');
        assert.equal(ws.model.activeId, doc.id);
        await click(native, '.workspace-tab-menu'); await wait(() => ws.menuOpen, 'reopen folder menu for Escape');
        doc.handle.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Escape' });
        doc.handle.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Escape' });
        await wait(() => !ws.menuOpen, 'Escape closes folder menu');
        await click(native, '.workspace-tab-menu'); await wait(() => ws.menuOpen, 'reopen folder menu for outside click');
        const outside = await evaluate(doc.handle, '({x:Math.round(innerWidth*.75),y:Math.round(innerHeight*.8)})');
        doc.handle.webContents.sendInputEvent({ type: 'mouseDown', button: 'left', clickCount: 1, ...outside });
        doc.handle.webContents.sendInputEvent({ type: 'mouseUp', button: 'left', clickCount: 1, ...outside });
        await wait(() => !ws.menuOpen, 'outside click dismisses folder menu');
        assert.equal(ws.model.activeId, doc.id);
        assert.equal(await evaluate(doc.handle, section === 'pdf'
          ? "JSON.stringify({zoom:document.getElementById('pdfZoom').value,top:document.getElementById('pdfScroller').scrollTop,left:document.getElementById('pdfScroller').scrollLeft})"
          : '__switchTest.view()'), retained, 'Opening/dismissing menus does not change the current view');
        const other = ws.model.find(files[section][1]);
        await click(native, '.workspace-tab-menu');
        await wait(() => evaluate(doc.handle, "!!document.querySelector('.workspace-folder-menu:not([hidden])')"), 'menu before actual file click');
        await click(doc.handle, `.workspace-file-select[data-document-id="${other.id}"]`);
        await wait(() => ws.model.activeId === other.id && !ws.menuOpen, 'only an actual file click switches documents');
        await rendered(other.handle, section, 'menu-selected-' + pass);
        await click(native, '.workspace-tab-menu');
        await wait(() => evaluate(other.handle, "!!document.querySelector('.workspace-folder-menu:not([hidden])')"), 'menu follows the newly selected editor');
        await click(other.handle, `.workspace-file-select[data-document-id="${doc.id}"]`);
        await wait(() => ws.model.activeId === doc.id && !ws.menuOpen, 'menu can select the original file again');
        await click(native, '.workspace-tab-menu');
        await wait(() => evaluate(doc.handle, "!!document.querySelector('.workspace-folder-menu:not([hidden])')"), 'menu for keyboard selection');
        const keyboardRows = await evaluate(doc.handle, "[...document.querySelectorAll('.workspace-folder-menu .workspace-file-select')].map(button=>button.dataset.documentId)");
        const keyboardOther = keyboardRows[1];
        await evaluate(doc.handle, "globalThis.__menuKeys=[];addEventListener('keyup',event=>__menuKeys.push({key:event.key,code:event.code,focused:document.activeElement.dataset.documentId}),{capture:true});true");
        doc.handle.webContents.focus();
        for (const keyCode of ['Home', 'Down']) {
          doc.handle.webContents.sendInputEvent({ type: 'keyDown', keyCode }); doc.handle.webContents.sendInputEvent({ type: 'keyUp', keyCode });
        }
        try { await wait(() => evaluate(doc.handle, `document.activeElement.dataset.documentId===${JSON.stringify(keyboardOther)}`), 'menu keyboard focus moves to the second file', 2000); }
        catch (error) { console.error(JSON.stringify({ menuKeys: await evaluate(doc.handle, '__menuKeys'), keyboardRows, keyboardOther })); throw error; }
        doc.handle.webContents.sendInputEvent({ type: 'keyDown', keyCode: 'Enter' }); doc.handle.webContents.sendInputEvent({ type: 'keyUp', keyCode: 'Enter' });
        await wait(() => ws.model.activeId === keyboardOther && !ws.menuOpen, 'Enter selects the focused menu file');
        const keyboardHandle = ws.model.documents.get(keyboardOther).handle;
        await click(native, '.workspace-tab-menu');
        await wait(() => evaluate(keyboardHandle, "!!document.querySelector('.workspace-folder-menu:not([hidden])')"), 'keyboard menu returns to original file');
        keyboardHandle.webContents.focus();
        for (const keyCode of ['Home', ...Array(keyboardRows.indexOf(doc.id)).fill('Down'), 'Enter']) {
          keyboardHandle.webContents.sendInputEvent({ type: 'keyDown', keyCode }); keyboardHandle.webContents.sendInputEvent({ type: 'keyUp', keyCode });
        }
        await wait(() => ws.model.activeId === doc.id && !ws.menuOpen, 'keyboard menu reselects original document');
      }
      await click(native, '#workspaceOverview');
      await wait(() => state().mode === 'tiles', 'grid button restores grid');
      await wait(() => evaluate(native, `!document.getElementById('workspaceTiles').hidden&&document.querySelectorAll('.workspace-preview img').length===4`), 'four painted tiles restored');
      assert.equal(native.contentView.children.filter(view => view !== native.webContentsView).length, 0, 'No native editor can cover the grid');
      await wait(() => [...ws.model.documents.values()].every(item => !item.previewQueued), 'single refreshed preview finishes');
      for (const item of ws.model.documents.values()) if (item.view) {
        assert(item.handle.webContents.getBackgroundThrottling(), 'Hidden editor is throttled after preview');
        if (item.id !== doc.id && !report[section]?.length) assert.equal(await evaluate(item.handle, '__previewCalls'), 0, 'Other file previews are reused');
      }
      assert(await evaluate(native, '[...document.querySelectorAll(".workspace-tile")].every(tile=>__originalTileImages.get(tile.dataset.documentId)===tile.querySelector("img"))'), 'Unchanged PNG image elements survive status changes and grid return');
      report[section] ??= []; report[section].push(Date.now() - started);
    }
    if (section !== 'pdf') for (const index of [3, 0]) {
      // Resizing fitted documents should refit; resizing an intentionally
      // panned/zoomed document should preserve its zoom and center-world point.
      const doc = ws.model.find(files[section][index]);
      await click(native, `.workspace-tile[data-document-id="${doc.id}"] .workspace-preview`);
      await wait(() => state().mode === 'single' && state().activeId === doc.id, 'select CAD for view retention');
      await cadFit(doc.handle);
      const point = await evaluate(doc.handle, '(()=>{const r=__switchTest.canvas.getBoundingClientRect();return {x:Math.round(r.left+r.width*.3),y:Math.round(r.top+r.height*.4)}})()');
      const originalView = await evaluate(doc.handle, '__switchTest.view()');
      doc.handle.webContents.sendInputEvent({ type: 'mouseWheel', ...point, deltaY: 200, deltaX: 0, canScroll: true });
      await wait(() => evaluate(doc.handle, `__switchTest.view()!==${JSON.stringify(originalView)}`), 'off-center CAD wheel input');
      doc.handle.webContents.sendInputEvent({ type: 'mouseDown', button: 'middle', clickCount: 1, ...point });
      doc.handle.webContents.sendInputEvent({ type: 'mouseMove', x: point.x + 67, y: point.y - 35 });
      doc.handle.webContents.sendInputEvent({ type: 'mouseUp', button: 'middle', clickCount: 1, x: point.x + 67, y: point.y - 35 });
      await delay(60);
      const inspect = `(()=>{const p=__switchTest,s=p.state,{w,h}=p.fit();return {
        scale:s.view.scale,x:(w/2-s.view.ox)/s.view.scale,y:-(h/2-s.view.oy)/s.view.scale,
        geometry:JSON.stringify(s.doc),undo:JSON.stringify(s.undoStack),dirty:s.dirty};})()`;
      const retained = await evaluate(doc.handle, inspect);
      await click(native, '#workspaceOverview'); await wait(() => state().mode === 'tiles', 'grid preserves custom CAD view');
      native.setContentSize(index ? 1100 : 1540, index ? 780 : 940);
      await delay(120);
      await click(native, `.workspace-tile[data-document-id="${doc.id}"] .workspace-preview`);
      await wait(() => state().mode === 'single' && state().activeId === doc.id, 'custom CAD view revealed after resize');
      await rendered(doc.handle, section, 'retained-' + index);
      const restored = await evaluate(doc.handle, inspect);
      assert.equal(restored.scale, retained.scale, 'Resize does not overwrite deliberate zoom');
      assert(Math.abs(restored.x - retained.x) < 1e-7 && Math.abs(restored.y - retained.y) < 1e-7,
        'Resize preserves the deliberately panned center-world point');
      assert.equal(restored.geometry, retained.geometry); assert.equal(restored.undo, retained.undo); assert.equal(restored.dirty, retained.dirty);
      await click(doc.handle, '#fitBtn'); await cadFit(doc.handle);
      await click(native, '#workspaceOverview'); await wait(() => state().mode === 'tiles', 'grid after retained navigation');
    }
    if (!localDxfs && section === 'dxf') {
      const edited = ws.model.find(files[section][3]), original = fs.readFileSync(edited.path);
      await click(native, `.workspace-tile[data-document-id="${edited.id}"] .workspace-preview`);
      await wait(() => state().mode === 'single' && state().activeId === edited.id, 'secondary editor for dirty menu close');
      await click(edited.handle, '#rotateBtn');
      await wait(() => evaluate(edited.handle, 'excelsisDocumentSession.status().dirty&&!excelsisDocumentSession.status().busy'), 'secondary CAD edit is dirty');
      const retained = await evaluate(edited.handle, 'JSON.stringify({doc:__switchTest.state.doc,undo:__switchTest.state.undoStack,view:__switchTest.state.view})');
      responses.push(2); await click(native, '.workspace-tab-menu');
      await wait(() => evaluate(edited.handle, "!!document.querySelector('.workspace-folder-menu:not([hidden])')"), 'dirty secondary menu is visible');
      await click(edited.handle, `.workspace-icon[data-document-id="${edited.id}"]`);
      await wait(() => responses.length === 0 && !ws.dialogActive && !ws.menuOpen, 'dirty secondary close Cancel finishes');
      assert.equal(state().count, 4); assert.equal(state().activeId, edited.id);
      assert.equal(await evaluate(edited.handle, 'JSON.stringify({doc:__switchTest.state.doc,undo:__switchTest.state.undoStack,view:__switchTest.state.view})'), retained, 'Cancel preserves dirty secondary geometry/history/view');
      responses.push(1); await click(native, '.workspace-tab-menu');
      await wait(() => evaluate(edited.handle, "!!document.querySelector('.workspace-folder-menu:not([hidden])')"), 'dirty menu reopens for Discard');
      await click(edited.handle, `.workspace-icon[data-document-id="${edited.id}"]`);
      await wait(() => state().count === 3 && !ws.model.documents.has(edited.id), 'Discard closes only the selected session');
      assert.deepEqual(fs.readFileSync(files[section][3]), original, 'Discard/session X never deletes or overwrites the file');
      assert.equal(native.contentView.children.filter(view => view !== native.webContentsView).length, 0, 'Closing secondary file returns to the root editor');
      await click(native, '#workspaceOverview'); await wait(() => state().mode === 'tiles', 'grid after dirty menu close');
    }
    // A renderer status promise that never settles must not hang header IPC.
    const stalled = ws.model.find(files[section][1]);
    await click(native, `.workspace-tile[data-document-id="${stalled.id}"] .workspace-preview`);
    await wait(() => state().mode === 'single', 'select editor before status timeout');
    await evaluate(stalled.handle, 'globalThis.__realStatus=excelsisDocumentSession.status;excelsisDocumentSession.status=()=>new Promise(()=>{});true');
    const started = Date.now();
    const refused = await evaluate(native, "excelsisWorkspace.action('overview')");
    assert.equal(refused.ok, false); assert.match(refused.error, /Finish/);
    assert(Date.now() - started < 2500, 'Unresponsive status has a bounded refusal, not a permanently pending grid action');
    await evaluate(stalled.handle, 'excelsisDocumentSession.status=__realStatus;true');
    await click(native, '#workspaceOverview'); await wait(() => state().mode === 'tiles', 'grid recovers after stalled status');
    await wait(() => [...ws.model.documents.values()].every(item => !item.previewQueued), 'last refresh finishes');
    if (section === 'pdf') {
      const folder = path.join(root, '3D PDF'); fs.mkdirSync(folder);
      const teapot = path.join(folder, 'Synthetic teapot.pdf');
      require('node:child_process').execFileSync(path.resolve(project, '../../prc/nanoprc/build/nano_prc_teapot_write.exe'),
        [path.join(folder, 'Synthetic teapot.prc'), teapot], { windowsHide: true, cwd: folder, stdio: 'pipe' });
      const three = api.create3dPdfWindow(await api.fileSetForFile(teapot, '3dpdf'));
      await wait(() => evaluate(three, '__switchThree.ready()&&excelsisDocumentSession.status().ready&&!excelsisDocumentSession.status().busy'), 'hidden native PRC loads');
      const doc = ws.model.find(teapot);
      await wait(() => state().tiles.find(tile => tile.id === doc.id)?.preview, '3D PDF preview');
      await click(native, `.workspace-tile[data-document-id="${doc.id}"] .workspace-preview`);
      await wait(() => state().mode === 'single' && state().activeId === doc.id, '3D PDF editor revealed');
      await wait(() => evaluate(three, '!document.getElementById("cv").hidden&&document.getElementById("cv").clientHeight>100'), '3D viewport sized');
      await delay(150); // Initial fit settles over two visible animation frames.
      const frame = await bounded(three.webContents.capturePage(undefined, { stayHidden: true }), '3D native compositor');
      assert(!frame.isEmpty()); fs.writeFileSync(path.join(root, '3d-editor.png'), frame.toPNG());
      const point = await evaluate(three, '(()=>{const r=document.getElementById("cv").getBoundingClientRect();return {x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)}})()');
      const before = await evaluate(three, '__switchThree.view()');
      const arrow = '.workspace-tab:last-child .workspace-tab-menu';
      await click(native, arrow); await wait(() => ws.menuOpen, '3D PDF folder menu opens');
      assert(doc.attached && doc.view.getVisible(), '3D PDF stays attached and visible under its menu');
      await wait(() => evaluate(three, "!!document.querySelector('.workspace-folder-menu:not([hidden])')"), '3D PDF menu overlays WebGL');
      const menuFrame = await bounded(three.webContents.capturePage(undefined, { stayHidden: true }), '3D PDF menu compositor');
      fs.writeFileSync(path.join(root, '3d-menu.png'), menuFrame.toPNG());
      await click(native, arrow); await wait(() => !ws.menuOpen, '3D PDF menu arrow toggles closed');
      assert.equal(await evaluate(three, '__switchThree.view()'), before, '3D PDF menu does not change the camera or pivot');
      three.webContents.sendInputEvent({ type: 'mouseWheel', ...point, deltaY: 100, deltaX: 0, canScroll: true });
      await wait(() => evaluate(three, `__switchThree.view()!==${JSON.stringify(before)}`), '3D editor accepts existing navigation');
      await click(native, '#workspaceOverview'); await wait(() => state().mode === 'tiles', '3D PDF grid return');
      await wait(() => !doc.previewQueued, '3D PDF refreshed');
    }
    native.close(); await wait(() => native.isDestroyed(), 'module closes');
  }
  clearTimeout(watchdog);
  if (localDxfs) localDxfs.forEach((file, index) => assert.deepEqual(fs.readFileSync(file), originalLocalBytes[index], 'Local fixtures remain byte-for-byte unchanged'));
  assert.equal(responses.length, 0);
  const result = { passed: true, offscreen, timingsMs: report, menuOverlays: true, dirtyMenuPrompts: prompts.length, evidence: root };
  fs.writeFileSync(path.join(root, 'result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  app.exit(0);
}
