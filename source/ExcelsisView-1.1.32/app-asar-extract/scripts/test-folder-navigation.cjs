const assert = require("node:assert/strict");
const fs = require("node:fs/promises"), syncFs = require("node:fs"), path = require("node:path");
const project = path.resolve(__dirname, "..");
if (!process.versions.electron) {
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE; delete env.NODE_OPTIONS;
  const child = require("node:child_process").spawn(require("electron"), [__filename], { cwd: project, windowsHide: true, stdio: "inherit", env });
  child.on("exit", code => { process.exitCode = code ?? 1; });
} else {
  run().catch(error => { console.error(error); require("electron").app.exit(1); });
}
async function run() {
  const { app, BrowserWindow } = require("electron");
  const root = syncFs.mkdtempSync(path.join(require("node:os").tmpdir(), "excelsis-folder-keys-"));
  app.setPath("appData", path.join(app.getPath("appData"), path.basename(root)));
  app.setAppPath(project);
  const text = "0\nSECTION\n2\nENTITIES\n0\nLINE\n8\nTEST\n10\n0\n20\n0\n11\n40\n21\n20\n0\nENDSEC\n0\nEOF\n";
  const drawing = path.join(root, "conversion-fixture.dxf");
  syncFs.writeFileSync(drawing, text);
  require("../dwg-converter.cjs").convertedDxfPath = async source => {
    assert.equal(path.dirname(source), path.join(root, "dwg"));
    return drawing;
  };
  const Module = require("node:module"), main = new Module(path.join(project,"main.cjs"), module);
  main.filename=path.join(project,"main.cjs"); main.paths=module.paths;
  main._compile(syncFs.readFileSync(main.filename,"utf8").replaceAll("new BrowserWindow({","new BrowserWindow({ show: false,")+"\nmodule.exports.__test={createDxfWindow,create3dPdfWindow,fileSetForFile};",main.filename);
  const { PDFDocument } = require("pdf-lib");
  const doc = await PDFDocument.create(); doc.addPage([300,400]).drawText("SYNTHETIC", {x:30,y:350,size:20});
  const pdf = Buffer.from(await doc.save());
  for (const extension of ["dxf","dwg","pdf"]) {
    await fs.mkdir(path.join(root, extension));
    for (const label of ["First","Second","Third"]) await fs.writeFile(path.join(root, extension, label+"."+extension), extension==="pdf"?pdf:extension==="dxf"?text:"synthetic DWG");
  }
  await app.whenReady();
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const evaluate=(win,code)=>win.webContents.executeJavaScript(code);
  async function wait(check,label) {
    const deadline=Date.now()+20000;
    while(Date.now()<deadline){if(await check())return;await delay(50);}
    throw new Error("Timed out: "+label);
  }
  await wait(()=>BrowserWindow.getAllWindows().length,"launcher");
  const api=main.exports.__test;
  const click=(win,id)=>evaluate(win,`document.getElementById(${JSON.stringify(id)}).click();true`);
  const right=win=>evaluate(win,"window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));true");
  const left=win=>evaluate(win,"window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));true");
  const report={};
  for(const extension of ["dxf","dwg","pdf"]) {
    const isPdf=extension==="pdf", moduleName=isPdf?"3dpdf":"dxf";
    const first=path.join(root,extension,"First."+extension);
    const set=await api.fileSetForFile(first,moduleName);
    const win=isPdf?api.create3dPdfWindow(set):api.createDxfWindow(set);
    win.webContents.setBackgroundThrottling(false);
    await new Promise(resolve=>win.webContents.once("did-finish-load",resolve));
    const current=()=>evaluate(win,isPdf?"document.getElementById('stats').textContent":"document.getElementById('fileName').textContent");
    const ready=label=>wait(async()=> (await current()).includes(label+"."+extension) &&
      await evaluate(win,isPdf?"!document.getElementById('pdfRenameFile').disabled":"!document.getElementById('renameFileBtn').disabled"),extension+" "+label);
    await ready("First");
    await evaluate(win,"document.activeElement?.blur();true");
    await right(win); await ready("Second");
    await left(win); await ready("First");
    await left(win); await delay(100); assert((await current()).includes("First."+extension),"Lower boundary");
    for(const options of ["ctrlKey:true","altKey:true","shiftKey:true","metaKey:true","repeat:true","isComposing:true"]) {
      await evaluate(win,`window.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,${options}}));true`);
      await delay(40); assert((await current()).includes("First."+extension),"Modified/repeated key ignored");
    }
    for(const tag of ["input","textarea","select","div"]) {
      await evaluate(win,`(()=>{const e=document.createElement(${JSON.stringify(tag)});e.id='keyboardEditingFixture';if(e.tagName==='DIV')e.contentEditable='true';document.body.append(e);e.focus();return true})()`);
      await right(win); await delay(50); assert((await current()).includes("First."+extension),"Editing keeps arrows");
      await evaluate(win,"document.getElementById('keyboardEditingFixture').remove();true");
    }
    await click(win,isPdf?"pdfRenameFile":"renameFileBtn");
    await right(win); await delay(50); assert((await current()).includes("First."+extension),"Modal blocks navigation");
    await click(win,"fileActionCancelBtn"); await evaluate(win,"document.activeElement?.blur();true");
    if(extension!=="dwg") {
      if(isPdf) {
        await click(win,"pdfAddText");
        await evaluate(win,"(()=>{const e=document.querySelector('.pdf-editor-layer'),r=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,clientX:r.left+80,clientY:r.top+160,pointerId:1}));const t=document.getElementById('pdfObjectText');t.value='UNSAVED NAVIGATION';t.dispatchEvent(new Event('input',{bubbles:true}));t.blur();return true})()");
        await wait(()=>evaluate(win,"!document.getElementById('pdfUndo').disabled"),"PDF dirty");
      } else { await click(win,"rotateBtn"); }
      await evaluate(win,"window.confirm=()=>false;document.activeElement?.blur();true");
      await right(win); await delay(200); assert((await current()).includes("First."+extension),"Cancel preserves current");
      assert.deepEqual(await fs.readFile(first),isPdf?pdf:Buffer.from(text),"Cancel does not save");
      await evaluate(win,"window.confirm=()=>true;true");
      await right(win); await ready("Second");
      assert.notDeepEqual(await fs.readFile(first),isPdf?pdf:Buffer.from(text),"Accepted navigation saves edits");
    } else { await right(win); await ready("Second"); }
    await right(win); await ready("Third");
    await right(win); await delay(100); assert((await current()).includes("Third."+extension),"Upper boundary");
    await left(win); await ready("Second"); await left(win); await ready("First");
    // Another window's claimed file is skipped just as it is by CAD buttons.
    const otherSet=await api.fileSetForFile(path.join(root,extension,"Second."+extension),moduleName);
    const other=isPdf?api.create3dPdfWindow(otherSet):api.createDxfWindow(otherSet);
    await new Promise(resolve=>other.webContents.once("did-finish-load",resolve));
    await wait(()=>evaluate(other,isPdf?"!document.getElementById('pdfRenameFile').disabled":"!document.getElementById('renameFileBtn').disabled"),"Other window ready");
    await evaluate(win,"document.activeElement?.blur();true"); await right(win); await ready("Third");
    report[extension]={bothDirections:true,boundaries:true,editingAndModalGuards:true,modifierAndRepeatGuards:true,skipOtherWindow:true,saveCancelProtection:!isPdf?extension==="dxf":true};
    other.destroy(); win.destroy();
  }
  await fs.writeFile(path.join(root,"result.json"),JSON.stringify({passed:true,formats:report,evidence:root},null,2));
  console.log(JSON.stringify({passed:true,formats:report,evidence:root}));
  app.exit(0);
}
