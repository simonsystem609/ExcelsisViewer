// Hidden/offscreen integration. Synthetic fixtures, isolated profile, real IPC.
// DWG conversion is substituted here; its native decoder has separate gates.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
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
  const offscreen = !process.argv.includes('--native');
  const { app, BrowserWindow, dialog, nativeImage } = require('electron');
  const root = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'excelsis-workspace-'));
  app.setPath('appData', path.join(app.getPath('appData'), path.basename(root))); app.setAppPath(project);
  const watchdog = setTimeout(() => { console.error('Workspace gate timed out'); app.exit(2); }, 180000);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function wait(check, label) {
    for (const until = Date.now() + 35000; Date.now() < until;) {
      if (await check()) return; await delay(40);
    }
    throw new Error('Timed out: ' + label);
  }
  const files = {}, drawings = new Map();
  const { PDFDocument, rgb } = require('pdf-lib');
  for (const section of ['dxf', 'dwg', 'pdf']) {
    files[section] = [];
    for (let index = 0; index < 9; index++) {
      const folder = path.join(root, section, index < 4 ? 'Group A' : index < 7 ? 'Group B' : 'Group C',
        'Mechanical assembly projects', 'Current production drawings', 'Version archive');
      fs.mkdirSync(folder, { recursive: true });
      const file = path.join(folder, `Part ${index + 1}.${section}`); files[section].push(file);
      const text = `0\nSECTION\n2\nENTITIES\n0\nLINE\n8\nOUTLINE\n10\n0\n20\n0\n11\n${40 + index * 5}\n21\n${20 + index * 3}\n0\nCIRCLE\n8\nHOLES\n10\n10\n20\n10\n40\n${2 + index}\n0\nENDSEC\n0\nEOF\n`;
      if (section === 'pdf') {
        const doc = await PDFDocument.create(), page = doc.addPage([300, 400]);
        page.drawText(`SYNTHETIC PART ${index + 1}`, { x: 25, y: 340, size: 18 });
        page.drawRectangle({ x: 30, y: 50, width: 100 + index * 10, height: 90 + index * 8,
          color: rgb(0.1 + index * 0.08, 0.25, 0.5) });
        fs.writeFileSync(file, await doc.save());
      } else if (section === 'dwg') {
        fs.writeFileSync(file, 'synthetic DWG workspace fixture');
        const decoded = path.join(folder, `converted-${index}.dxf`); fs.writeFileSync(decoded, text); drawings.set(file, decoded);
      } else fs.writeFileSync(file, text);
    }
  }
  require('../dwg-converter.cjs').convertedDxfPath = async file => {
    assert(drawings.has(file), 'Only synthetic DWG fixtures may be converted'); return drawings.get(file);
  };
  const responses = [], prompts = [];
  let nextSaveTarget = null;
  dialog.showSaveDialog = async (owner, options) => {
    assert(owner && !owner.nativeWindow, 'Save As uses the owning native module window');
    assert.match(options.title, /Save (DXF|PDF) as/);
    assert(nextSaveTarget, 'Unexpected Save As dialog');
    const filePath = nextSaveTarget; nextSaveTarget = null;
    return { canceled: false, filePath };
  };
  dialog.showMessageBox = async (owner, options) => {
    assert(owner && !owner.nativeWindow, 'Unsaved confirmation belongs to the native module window');
    assert.deepEqual(options.buttons, ['Save', 'Discard changes', 'Cancel']);
    prompts.push(options.message); assert(responses.length, 'Unexpected unsaved confirmation');
    return { response: responses.shift() };
  };
  const Module = require('node:module'), main = new Module(path.join(project, 'main.cjs'), module);
  main.filename = path.join(project, 'main.cjs'); main.paths = Module._nodeModulePaths(project);
  const footer = `globalThis.__workspaceTest={state,canvas,fitView,renderCanvasNow,
    snapshot:()=>JSON.stringify({doc:state.doc,view:state.view,undo:state.undoStack,
      selection:[...state.selectedEntityIds],features:[...state.selectedFeatureIds],dirty:state.dirty})};`;
  const pdfFooter = `globalThis.__workspace3D={ready:()=>!!modelRoot&&!!renderer,
    snapshot:()=>JSON.stringify({pivot:pivot?.position.toArray(),rotation:viewQuaternion.toArray(),dist,modelRadius,
      near:cam?.near,far:cam?.far,aspect:cam?.aspect,focus:zoomFocusLocal?.toArray(),sequence:zoomSequence}),
    preview:documentTilePreview,navigate:()=>{pivot.position.x+=modelRadius*.2;dist*=.8;viewQuaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),.3);renderFrame();}};`;
  let source = fs.readFileSync(main.filename, 'utf8').replaceAll('new BrowserWindow({', 'new BrowserWindow({ show: false,')
    .replaceAll('webPreferences: {', offscreen ? 'webPreferences: { offscreen: true,' : 'webPreferences: {')
    // Offscreen Chromium needs a paint consumer even for a clean overflow
    // renderer recreated internally (not returned by this test's open helper).
    .replace('secureWebContents(handle, moduleEntryUrl(handle.excelsisModuleName));',
      'secureWebContents(handle, moduleEntryUrl(handle.excelsisModuleName)); handle.webContents.on("paint",()=>{}); handle.webContents.setFrameRate(60);')
    .replace('const body = await fs.readFile(requestedPath);', `let body = await fs.readFile(requestedPath);
      if(requestedPath===${JSON.stringify(path.join(project, 'modules/dxf/app.js'))})
        body=Buffer.concat([body,Buffer.from(${JSON.stringify(footer)})]);
      if(requestedPath===${JSON.stringify(path.join(project, 'modules/3dpdf/app.mjs'))})
        body=Buffer.concat([body,Buffer.from(${JSON.stringify(pdfFooter)})]);`)
    .replace('"Content-Length": String(stat.size)', '"Content-Length": String(body.length)');
  main._compile(source + '\nmodule.exports.__test={createDxfWindow,create3dPdfWindow,fileSetForFile,viewerWorkspaces,findOpenArgs,assertTrustedSender};', main.filename);
  const api = main.exports.__test;
  await app.whenReady(); await wait(() => BrowserWindow.getAllWindows().length, 'launcher');
  BrowserWindow.getAllWindows().forEach(win => { win.hide(); win.show = () => {}; });
  const roots = {}, handles = {}, ids = {}, report = {};
  const evaluate = (handle, code) => handle.webContents.executeJavaScript(code);
  const state = section => api.viewerWorkspaces.getState(roots[section].webContents);
  const action = async (section, command, id) => {
    const result = await evaluate(roots[section], `excelsisWorkspace.action(${JSON.stringify(command)},${JSON.stringify(id)})`);
    if (['select', 'overview'].includes(command)) assert(result.ok, `${section} ${command}: ${result.error}`);
    return result;
  };
  const click = (handle, id) => evaluate(handle, `document.getElementById(${JSON.stringify(id)}).click();true`);
  const tabLayout = section => evaluate(roots[section], `(()=>{
    const rail=document.querySelector('.workspace-tabs'), tabs=[...rail.children];
    const ctx=document.createElement('canvas').getContext('2d');
    return {available:rail.clientWidth,left:rail.getBoundingClientRect().left,right:rail.getBoundingClientRect().right,
      tabs:tabs.map(tab=>{const label=tab.querySelector('.workspace-tab-label');
        const full=label.title.replaceAll(String.fromCharCode(92),'/').split('/').filter(Boolean).slice(-3).join(' › ');
        ctx.font=getComputedStyle(label).font;
        return {width:tab.getBoundingClientRect().width,right:tab.getBoundingClientRect().right,
          preferred:parseFloat(tab.style.flexBasis),text:label.textContent,full,textWidth:ctx.measureText(full).width};})};
  })()`);
  async function captureEvidence(handle, name) {
    await evaluate(handle, 'new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))))');
    let image;
    if (offscreen) {
      const frame = new Promise(resolve => handle.webContents.once('paint', (_event, _rect, painted) => resolve(painted)));
      handle.webContents.invalidate(); image = await frame;
    } else {
      image = await handle.webContents.capturePage(undefined, { stayHidden: true });
    }
    assert(!image.isEmpty(), 'Screenshot evidence requires a complete rendered frame');
    fs.writeFileSync(path.join(root, name), image.toPNG());
  }
  async function open(section, index) {
    const set = await api.fileSetForFile(files[section][index], section === 'pdf' ? '3dpdf' : 'dxf');
    const handle = section === 'pdf' ? api.create3dPdfWindow(set) : api.createDxfWindow(set);
    const native = handle.nativeWindow || handle; native.hide(); native.show = () => {};
    handle.webContents.setBackgroundThrottling(false); handle.webContents.setFrameRate(60); handle.webContents.on('paint', () => {});
    await wait(async () => {
      try { return await evaluate(handle, '!!excelsisDocumentSession?.status().ready&&!excelsisDocumentSession?.status().busy'); }
      catch { return false; }
    }, `${section} document ${index + 1}`);
    return handle;
  }
  for (const section of ['dxf', 'dwg', 'pdf']) {
    console.log(`Workspace renderer gate: ${section}`);
    handles[section] = [await open(section, 0)]; roots[section] = handles[section][0];
    await wait(() => evaluate(roots[section], "!!document.getElementById('workspaceTitlebar')"), 'root title bar');
    assert.equal(state(section).mode, 'single'); ids[section] = [state(section).documentId];
    roots[section].setContentSize(1240, 850); await delay(120);
    const single = await tabLayout(section);
    assert.equal(single.tabs.length, 1);
    assert.equal(single.tabs[0].text, single.tabs[0].full, 'A single folder tab keeps all three folder names');
    assert(single.tabs[0].width <= single.tabs[0].textWidth + 75, 'A single tab fits its text and controls, not the whole header');
    assert(single.available - single.tabs[0].width > 250, 'Unused header space stays outside the tab');
    roots[section].setContentSize(1920, 850); await delay(120);
    const wideSingle = await tabLayout(section);
    assert(Math.abs(wideSingle.tabs[0].width - single.tabs[0].width) < 2, 'Widening the window must not stretch a lone tab');
    roots[section].setContentSize(1240, 850); await delay(120);
    await captureEvidence(roots[section], `${section}-single-tab.png`);
    const original = fs.readFileSync(files[section][0]);
    if (section === 'dxf') await click(roots[section], 'rotateBtn');
    if (section === 'pdf') {
      await click(roots[section], 'pdfAddText');
      await evaluate(roots[section], `(()=>{const layer=document.querySelector('.pdf-editor-layer'),r=layer.getBoundingClientRect();
        layer.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,clientX:r.left+80,clientY:r.top+160,pointerId:1}));
        const text=document.getElementById('pdfObjectText');text.value='UNSAVED WORKSPACE TEXT';text.dispatchEvent(new Event('input',{bubbles:true}));text.blur();return true})()`);
      await wait(() => evaluate(roots[section], '!document.getElementById("pdfUndo").disabled'), 'PDF dirty');
    }
    const snapshot = section !== 'pdf' ? await evaluate(roots[section], '__workspaceTest.snapshot()') : null;
    for (let index = 1; index < 8; index++) {
      handles[section].push(await open(section, index));
      await wait(() => state(section).mode === 'tiles', 'additional opens show overview');
      ids[section].push(state(section).folders.flatMap(folder => folder.files).find(file => file.path === files[section][index]).id);
      assert.equal(state(section).tiles.length, Math.min(index + 1, 6));
      assert.equal(state(section).count, index + 1);
    }
    assert.deepEqual(state(section).tiles.map(file => file.id), [...ids[section].slice(0, 5), ids[section][7]]);
    assert.deepEqual(state(section).folders.map(folder => folder.files.length), [4, 3, 1]);
    assert(state(section).folders.every(folder => folder.parts.length === 3));
    await wait(() => state(section).tiles.every(file => file.preview), 'all six fitted PNG previews');
    const previewHashes = new Set(state(section).tiles.map(file => crypto.createHash('sha256').update(file.preview).digest('hex')));
    assert.equal(previewHashes.size, 6, 'Tiles show their own drawing, not a reused thumbnail');
    for (const file of state(section).tiles) {
      const size = nativeImage.createFromDataURL(file.preview).getSize();
      assert(size.width >= 800 && size.height >= 1000, `High-quality fitted PNG ${JSON.stringify(size)}`);
    }
    assert.equal(BrowserWindow.getAllWindows().filter(win => win.excelsisWorkspace?.section === section).length, 1);
    const overflow = api.viewerWorkspaces.find(section).model.documents.get(ids[section][6]);
    await wait(() => !overflow.handle && !overflow.view, 'clean overflow renderer released');
    assert(api.viewerWorkspaces.isOpenElsewhere(files[section][6], roots[section].webContents),
      'Unloaded overflow metadata still counts as an open document');
    // The pager may inspect only its own granted folder. Use the still-visible
    // Group B document, not the Group A title-bar renderer, for the IPC query.
    const pager = handles[section][4];
    await evaluate(pager, section === 'pdf'
      ? `pdfApp.listFolder(${JSON.stringify(files[section][4])})`
      : `dxfApp.listDxfFolder(${JSON.stringify(files[section][4])})`);
    assert(await evaluate(pager, `${section === 'pdf' ? 'pdfApp' : 'dxfApp'}.isFileOpenElsewhere(${JSON.stringify(files[section][6])})`),
      'The original pager skips an open overflow document even without a renderer claim');
    if (section !== 'dwg') {
      const targetBytes = fs.readFileSync(files[section][6]); nextSaveTarget = files[section][6];
      const attempt = section === 'pdf'
        ? `pdfApp.readFile(${JSON.stringify(files[section][0])}).then(bytes=>pdfApp.saveAs(${JSON.stringify(files[section][0])},bytes,'Copy.pdf'))`
        : `dxfApp.saveAs(${JSON.stringify(files[section][0])},__workspaceTest.state.savedText)`;
      assert.match(await evaluate(roots[section], `(${attempt}).then(()=>'',e=>e.message)`), /open in another/);
      assert.deepEqual(fs.readFileSync(files[section][6]), targetBytes, 'Save As cannot overwrite an unloaded open tab');
      assert.equal(state(section).count, 8);
      assert.equal(state(section).folders.flatMap(folder => folder.files).find(file => file.id === ids[section][0]).path, files[section][0]);
    }
    const inputBlocked = await evaluate(roots[section], `(()=>{const c=document.getElementById('moduleContent');
      const canvas=document.querySelector('canvas');const wheel=new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:100});
      canvas.dispatchEvent(wheel);return c.inert&&getComputedStyle(c).visibility==='hidden'&&wheel.defaultPrevented})()`);
    assert(inputBlocked, 'Overview disables the editor, including wheel input');
    if (snapshot) assert.equal(await evaluate(roots[section], '__workspaceTest.snapshot()'), snapshot, 'Preview/input never changes geometry, edits, selection or view');
    await action(section, 'select', ids[section][5]);
    assert.equal(state(section).mode, 'single'); assert.equal(state(section).activeId, ids[section][5]);
    assert.deepEqual(state(section).tiles.map(file => file.id), [...ids[section].slice(0, 5), ids[section][5]]);
    const secondary = api.viewerWorkspaces.findFile(files[section][5]);
    await wait(async () => {
      try { return await evaluate(secondary, '!!excelsisDocumentSession?.status().ready&&!excelsisDocumentSession?.status().busy'); }
      catch { return false; }
    }, 'restored overflow editor ready');
    assert.equal(secondary.webContents.getLastWebPreferences().sandbox, true);
    assert.equal(secondary.webContents.getLastWebPreferences().nodeIntegration, false);
    assert.match(await evaluate(secondary, "excelsisWorkspace.action('overview').then(()=>'',e=>e.message)"), /title bar/);
    await action(section, 'menu', { folderId: state(section).folders[1].id, left: 80 });
    for (const command of ['select', 'close', 'overview', 'menu-select', 'menu-close']) {
      assert.match(await evaluate(secondary, `excelsisWorkspace.action(${JSON.stringify(command)},${JSON.stringify(ids[section][0])}).then(()=>'',e=>e.message)`), /title bar/,
        'An editor menu cannot issue general commands or target a file outside its shown folder');
    }
    assert.match(await evaluate(pager, "excelsisWorkspace.action('menu-dismiss').then(()=>'',e=>e.message)"), /title bar/,
      'Hidden editors cannot act on another editor menu');
    await action(section, 'menu', false);
    await action(section, 'select', ids[section][0]);
    if (snapshot) assert.equal(await evaluate(roots[section], '__workspaceTest.snapshot()'), snapshot, 'Selecting restores the exact editor session');
    if (section !== 'dwg') assert(await evaluate(roots[section], 'excelsisDocumentSession.status().dirty'));
    await action(section, 'overview');
    try { await wait(() => state(section).tiles.every(file => file.preview), 'refreshed previews'); }
    catch (error) {
      console.error(JSON.stringify({ section, documents: state(section).tiles.map(({ id, name, busy, dirty, error, preview }) =>
        ({ id, name, busy, dirty, error, preview: !!preview })) }));
      const ws = api.viewerWorkspaces.find(section);
      for (const id of ws.model.visibleIds) {
        const doc = ws.model.documents.get(id);
        console.error(JSON.stringify({ name: path.basename(doc.path), queued: doc.previewQueued,
          live: doc.handle && !doc.handle.isDestroyed() ? await evaluate(doc.handle, '({status:excelsisDocumentSession?.status(),visibility:document.visibilityState,stats:document.getElementById("stats")?.textContent})') : null }));
      }
      throw error;
    }
    for (const width of [900, 1240, 1920, 900, 1920]) {
      roots[section].setContentSize(width, 850); await delay(100);
      const tabSizes = await tabLayout(section);
      assert(tabSizes.tabs.every(tab => tab.width <= tab.preferred + 1), 'Tabs never grow beyond their measured text width');
      const preferredTotal = tabSizes.tabs.reduce((sum, tab) => sum + tab.preferred, 0) + (tabSizes.tabs.length - 1) * 3;
      if (preferredTotal > tabSizes.available) {
        assert(Math.abs(tabSizes.tabs.at(-1).right - tabSizes.right) < 2, 'Crowded tabs use all the available header width');
        assert(tabSizes.tabs.some(tab => tab.text.includes('…')), 'Crowded paths shorten names in the middle');
      } else {
        assert(tabSizes.tabs.every(tab => tab.text === tab.full), 'Widening restores full paths without a shrinking feedback loop');
        assert(tabSizes.tabs.every(tab => Math.abs(tab.width - tab.preferred) < 2));
      }
      const layout = await evaluate(roots[section], `(()=>{const tabs=[...document.querySelectorAll('.workspace-tab')];
        return {width:innerWidth,right:Math.max(...tabs.map(tab=>tab.getBoundingClientRect().right)),
          captions:[...document.querySelectorAll('.workspace-tile-caption')].map(node=>({background:getComputedStyle(node).backgroundColor,text:node.textContent})),
          labels:[...document.querySelectorAll('.workspace-tab-label')].map(node=>({text:node.textContent,title:node.title}))}})()`);
      assert(layout.right <= layout.width - 145, 'Tabs reserve native caption controls');
      assert(layout.captions.every(caption => caption.background === 'rgba(0, 0, 0, 0)'));
      assert(layout.labels.every(label => label.text.split(' › ').length === 3 && label.title));
      await captureEvidence(roots[section], `${section}-tiles-${width}.png`);
    }
    await evaluate(roots[section], "document.querySelector('.workspace-tab-menu').click();true");
    await wait(() => evaluate(roots[section], '!document.querySelector(".workspace-folder-menu").hidden'), 'folder dropdown');
    assert.equal(await evaluate(roots[section], 'document.querySelectorAll(".workspace-file-row").length'), 4);
    await evaluate(roots[section], "window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));true");
    await action(section, 'select', ids[section][0]);
    if (section !== 'dwg') {
      responses.push(2);
      await evaluate(roots[section], "document.querySelector('.workspace-tab-menu').click();true");
      await wait(() => state(section).menuOpen, 'dirty root menu opens without changing documents');
      await evaluate(roots[section], `document.querySelector('.workspace-folder-menu .workspace-icon[data-document-id="${ids[section][0]}"]').click();true`);
      await wait(() => !api.viewerWorkspaces.find(section).dialogActive && responses.length === 0 && !state(section).menuOpen, 'folder menu close Cancel preserves the dirty document');
      assert.equal(state(section).activeId, ids[section][0]); assert.equal(state(section).count, 8);
      assert(await evaluate(roots[section], 'excelsisDocumentSession.status().dirty'));
      responses.push(2); assert.equal((await action(section, 'close', ids[section][0])).canceled, true);
      assert.equal(state(section).count, 8); assert.deepEqual(fs.readFileSync(files[section][0]), original);
      if (section === 'dxf') {
        await evaluate(roots[section], 'globalThis.__realSave=excelsisDocumentSession.save;excelsisDocumentSession.save=async()=>false;true');
        responses.push(0); assert.equal((await action(section, 'close', ids[section][0])).ok, false);
        assert.equal(state(section).count, 8, 'Failed save must not close the document');
        await evaluate(roots[section], 'excelsisDocumentSession.save=__realSave;true');
      }
      responses.push(0); assert.equal((await action(section, 'close', ids[section][0])).ok, true);
      assert.notDeepEqual(fs.readFileSync(files[section][0]), original, 'Save persists the real edit before closing');
    } else assert.equal((await action(section, 'close', ids[section][0])).ok, true);
    assert.equal(state(section).count, 7); assert(!state(section).folders.flatMap(folder => folder.files).some(file => file.id === ids[section][0]));
    assert(await evaluate(roots[section], '!!document.getElementById("workspaceTitlebar")'), 'Closing the root document keeps its title bar alive');
    await action(section, 'select', ids[section][1]);
    assert.equal(state(section).mode, 'single'); assert.equal(state(section).activeId, ids[section][1]);
    if (section === 'dxf') {
      const active = api.viewerWorkspaces.findFile(files[section][1]);
      await click(active, 'renameFileBtn');
      handles[section].push(await open(section, 8));
      assert.equal(state(section).mode, 'single', 'Opening a file must not hide an in-progress modal');
      assert.equal(state(section).activeId, ids[section][1]);
      await click(active, 'fileActionCancelBtn');
      await wait(() => state(section).mode === 'tiles', 'deferred overview after modal');
      const originalSecondaryBytes = fs.readFileSync(files[section][1]);
      await action(section, 'select', ids[section][1]); await click(active, 'rotateBtn');
      const beforeCount = state(section).count;
      responses.push(2); roots[section].close(); await wait(() => !responses.length, 'module close cancel'); await delay(100);
      assert(!roots[section].isDestroyed()); assert.equal(state(section).count, beforeCount, 'Cancel keeps all folder tabs');
      responses.push(1); roots[section].close(); await wait(() => roots[section].isDestroyed(), 'module discard close');
      assert.deepEqual(fs.readFileSync(files[section][1]), originalSecondaryBytes, 'Discard closes without writing the file');
    }
    report[section] = { singleton: true, sixHighQualityTiles: true, firstFiveStable: true, overflowPreserved: true,
      folderDropdown: true, lastThreeFolders: true, transparentCaptions: true, retainedSession: true,
      inertOverview: true, dirtyClose: section !== 'dwg', rootCloseRetainsChrome: true, sandboxedViews: true,
      unloadedOverflowPagerProtected: true, unloadedOverflowSaveAsProtected: section !== 'dwg',
      textFittedTabs: true, crowdedTabsUseAvailableWidth: true, resizeRestoresFullPaths: true };
  }
  const argv = await api.findOpenArgs(['--ignored', ...files.pdf.slice(0, 3), files.pdf[0]]);
  assert.equal(argv.length, 3, 'Explorer batch argv opens all files, deduplicated');
  assert.throws(() => api.assertTrustedSender({ sender: roots.pdf.webContents, senderFrame: {} }, ['3dpdf']), /Untrusted/);
  const teapotFolder = path.join(root, '3D PDF'); fs.mkdirSync(teapotFolder);
  const teapot = path.join(teapotFolder, 'Synthetic teapot.pdf');
  require('node:child_process').execFileSync(path.resolve(project, '../../prc/nanoprc/build/nano_prc_teapot_write.exe'),
    [path.join(teapotFolder, 'Synthetic teapot.prc'), teapot], { windowsHide: true, cwd: teapotFolder, stdio: 'pipe' });
  const teapotHandle = api.create3dPdfWindow(await api.fileSetForFile(teapot, '3dpdf'));
  await wait(async () => { try { return await evaluate(teapotHandle, '__workspace3D.ready()&&excelsisDocumentSession.status().ready&&!excelsisDocumentSession.status().busy'); } catch { return false; } }, 'native PRC 3D PDF');
  await delay(200); // Allow the normal initial fit to settle before navigation.
  await evaluate(teapotHandle, '__workspace3D.navigate();true');
  const threeBefore = await evaluate(teapotHandle, '__workspace3D.snapshot()');
  const threePreview = await evaluate(teapotHandle, '__workspace3D.preview()');
  assert.equal(await evaluate(teapotHandle, '__workspace3D.snapshot()'), threeBefore, '3D previews preserve pivot, rotation, zoom and clipping');
  const teapotImage = nativeImage.createFromDataURL(threePreview);
  assert.deepEqual(teapotImage.getSize(), { width: 1600, height: 1100 });
  fs.writeFileSync(path.join(root, '3d-fitted-teapot.png'), teapotImage.toPNG());
  report.pdf.nativePrcPreview = true; report.pdf.threeNavigationPreserved = true;
  const pdfSecondary = api.viewerWorkspaces.findFile(files.pdf[1]);
  assert.match(await evaluate(pdfSecondary, "pdfApp.readFile('C:\\\\not-granted\\\\private.pdf').then(()=>'',e=>e.message)"), /grant|access|capability/i);
  roots.dwg.close(); roots.pdf.close();
  await wait(() => roots.dwg.isDestroyed() && roots.pdf.isDestroyed(), 'clean native close');
  assert.equal(api.viewerWorkspaces.documents().length, 0, 'Every embedded renderer is explicitly released');
  clearTimeout(watchdog);
  fs.writeFileSync(path.join(root, 'result.json'), JSON.stringify({ passed: true, modules: report, prompts: prompts.length, evidence: root }, null, 2));
  console.log(JSON.stringify({ passed: true, modules: report, prompts: prompts.length, offscreen, evidence: root }));
  app.exit(0);
}
