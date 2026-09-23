// Hidden Electron integration using synthetic files and brokered-IPC tests.
// No Computer Use, OS input automation, user documents, or real save dialogs.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const project = path.resolve(__dirname, "..");
if (!process.versions.electron) {
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE; delete env.NODE_OPTIONS;
  const child = require("node:child_process").spawn(require("electron"), [__filename], { cwd:project, windowsHide:true, stdio:"inherit", env });
  child.on("exit", code => { process.exitCode = code ?? 1; });
} else {
  run().catch(error => { console.error(error); require("electron").app.exit(1); });
}
async function run() {
  const { app, BrowserWindow, dialog } = require("electron");
  const fsSync = require("node:fs");
  const root = fsSync.mkdtempSync(path.join(require("node:os").tmpdir(), "excelsis-pdf-transform-"));
  const profile = path.join(app.getPath("appData"), path.basename(root));
  app.setPath("appData", profile); app.setAppPath(project);
  let nextSave = null, saveDialogs = 0;
  dialog.showSaveDialog = async (_owner, options) => {
    saveDialogs++;
    assert.match(options.title, /transformed PDF copy/);
    assert.deepEqual(options.filters[0].extensions, ["pdf"]);
    assert(nextSave, "A save dialog was not expected");
    const result = nextSave; nextSave = null; return result;
  };
  const Module = require("node:module");
  const main = new Module(path.join(project, "main.cjs"), module);
  main.filename = path.join(project, "main.cjs"); main.paths = module.paths;
  main._compile(fsSync.readFileSync(main.filename,"utf8").replaceAll("new BrowserWindow({", "new BrowserWindow({ show: false,") + "\nmodule.exports.__test={create3dPdfWindow,fileSetForFile};", main.filename);
  const { PDFDocument } = require("pdf-lib");
  const doc = await PDFDocument.create();
  doc.addPage([300,400]).drawText("ORIGINAL", { x:30,y:350,size:20 });
  doc.addPage([240,180]).drawText("SECOND", { x:20,y:120,size:18 });
  const originalBytes = Buffer.from(await doc.save());
  const original = path.join(root,"Original.pdf"), existing = path.join(root,"Existing.pdf");
  const scaled = path.join(root,"Scaled.pdf"), mirrored = path.join(root,"Mirrored.pdf");
  await fs.writeFile(original,originalBytes); await fs.writeFile(existing,originalBytes);
  const delay = ms => new Promise(resolve => setTimeout(resolve,ms));
  async function wait(check,label) {
    const deadline=Date.now()+30000;
    while(Date.now()<deadline) { if(await check())return; await delay(80); }
    throw new Error(`Timed out: ${label}`);
  }
  await app.whenReady();
  await wait(()=>BrowserWindow.getAllWindows().length,"launcher");
  for(const win of BrowserWindow.getAllWindows())win.hide();
  const api=main.exports.__test;
  const win=api.create3dPdfWindow(await api.fileSetForFile(original,"3dpdf"));
  win.webContents.setBackgroundThrottling(false);
  await new Promise(resolve=>win.webContents.once("did-finish-load",resolve));
  const evaluate=code=>win.webContents.executeJavaScript(code);
  const click=id=>evaluate(`document.getElementById(${JSON.stringify(id)}).click();true`);
  const value=(id,value)=>evaluate(`document.getElementById(${JSON.stringify(id)}).value=${JSON.stringify(value)};document.getElementById(${JSON.stringify(id)}).dispatchEvent(new Event('input',{bubbles:true}));true`);
  const opened=()=>evaluate("document.getElementById('pdfTransformDialog').open");
  const error=()=>evaluate("document.getElementById('pdfTransformError').textContent");
  const submit=()=>evaluate("document.querySelector('#pdfTransformDialog form').requestSubmit();true");
  await wait(()=>evaluate("!document.getElementById('pdfMirror').disabled && !!document.querySelector('.pdf-native-hit')"),"PDF ready");
  for(const width of [900,1240,1920]) {
    win.setContentSize(width,850); await delay(100);
    assert(await evaluate("[...document.querySelectorAll('#regularControls button,#regularControls input,#regularControls select')].every(e=>e.getBoundingClientRect().right<=innerWidth && e.getBoundingClientRect().left>=0)"),`Toolbar fits ${width}`);
  }
  await click("pdfAddText");
  await evaluate("(()=>{const layer=document.querySelector('.pdf-editor-layer'),r=layer.getBoundingClientRect();layer.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,clientX:r.left+80,clientY:r.top+160,pointerId:1}));return true})()");
  await value("pdfObjectText","UNSAVED TEXT");
  await wait(()=>evaluate("!document.getElementById('pdfUndo').disabled"),"unsaved text edit");
  await click("pdfMirror"); assert(await opened());
  assert.equal(await evaluate("document.getElementById('pdfScaleOptions').hidden"),true);
  assert(await evaluate("document.getElementById('pdfRenameFile').disabled && document.getElementById('pdfSave').disabled"));
  await click("pdfTransformCancel");
  await wait(()=>evaluate("!document.getElementById('pdfUndo').disabled"),"cancel restores editing");
  assert.equal(saveDialogs,0); assert.equal(await evaluate("document.getElementById('pdfUndo').disabled"),false);
  assert.deepEqual(await fs.readFile(original),originalBytes);
  await click("pdfScale");
  await value("pdfScaleX","150");
  assert.equal(await evaluate("document.getElementById('pdfScaleY').value"),"150");
  await click("pdfScaleLinked"); await value("pdfScaleY","75"); await value("pdfTransformScope","current");
  await value("pdfScaleX","0"); await submit(); assert.equal(saveDialogs,0); // native validity stops invalid scale
  await value("pdfScaleX","150");
  nextSave={canceled:true}; await submit();
  await wait(()=>evaluate("!document.getElementById('pdfTransformConfirm').disabled"),"cancel save dialog");
  assert(await opened()); assert.equal(await error(),"");
  nextSave={canceled:false,filePath:original}; await submit();
  await wait(async()=>/original PDF cannot be overwritten/.test(await error()),"original overwrite rejected");
  nextSave={canceled:false,filePath:existing}; await submit();
  await wait(async()=>/already exists/.test(await error()),"existing target rejected");
  assert.deepEqual(await fs.readFile(existing),originalBytes);
  nextSave={canceled:false,filePath:scaled}; await submit();
  await wait(async()=>!(await opened()),"scale saved");
  await wait(()=>evaluate("!document.getElementById('pdfRenameFile').disabled"),"copy loaded and actions restored");
  const scaledDoc=await PDFDocument.load(await fs.readFile(scaled));
  assert.deepEqual(scaledDoc.getPage(0).getSize(),{width:450,height:300});
  assert.deepEqual(scaledDoc.getPage(1).getSize(),{width:240,height:180});
  assert.deepEqual(await fs.readFile(original),originalBytes);
  const exportedText=await evaluate(`(async()=>{const pdf=await import('./vendor/pdfjs/pdf.min.mjs');const task=pdf.getDocument({data:new Uint8Array(await window.pdfApp.readFile(${JSON.stringify(scaled)})),isEvalSupported:false});try{const doc=await task.promise;return(await(await doc.getPage(1)).getTextContent()).items.map(item=>item.str).join(' ')}finally{await task.destroy()}})()`);
  assert.match(exportedText,/UNSAVED TEXT/);
  await click("pdfRenameFile");
  assert.equal(await evaluate("document.getElementById('fileActionName').value"),"Scaled.pdf");
  await click("fileActionCancelBtn");
  await wait(()=>evaluate("!document.getElementById('pdfRenameFile').disabled"),"rename cancel");
  await click("pdfRotate"); await click("pdfMirror"); await value("pdfTransformAxis","vertical");
  nextSave={canceled:false,filePath:mirrored}; await submit();
  await wait(async()=>!(await opened()),"mirror saved");
  const mirroredDoc=await PDFDocument.load(await fs.readFile(mirrored));
  assert.equal(mirroredDoc.getPage(0).getRotation().angle,90);
  assert.equal(mirroredDoc.getPage(1).getRotation().angle,90);
  assert.equal(await evaluate("document.getElementById('pdfUndo').disabled"),true);
  const history=await evaluate("window.excelsisRecents.list()");
  assert(history.entries.some(entry=>entry.name==="Mirrored.pdf"));
  // Old neighbors remain granted for navigation, but are not valid transform sources.
  const denied=await evaluate(`(async()=>{try{await window.pdfApp.saveTransformedCopy(${JSON.stringify(original)},await window.pdfApp.readFile(${JSON.stringify(original)}),'Wrong.pdf');return ''}catch(e){return e.message}})()`);
  assert.match(denied,/current PDF/);
  assert.equal(saveDialogs,5);
  const report={cancelPreservesEdits:true,linkedAndIndependentScale:true,currentPageScope:true,includesUnsavedText:true,originalUnchanged:true,existingTargetUnchanged:true,viewRotationExported:true,currentPathAndRecents:true,currentSourceConfinement:true,toolbarWidths:[900,1240,1920],evidence:root,isolatedProfile:profile};
  await fs.writeFile(path.join(root,"result.json"),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report)); app.exit(0);
}
