// Terminal-driven integration test. Hidden, isolated Electron windows; no
// Computer Use, real user documents/profile, OS Recycle Bin, or GUI automation.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const project = path.resolve(__dirname, "..");

if (!process.versions.electron) {
  const childEnvironment = { ...process.env };
  delete childEnvironment.ELECTRON_RUN_AS_NODE;
  delete childEnvironment.NODE_OPTIONS;
  const child = require("node:child_process").spawn(require("electron"), [__filename], {
    cwd: project, windowsHide: true, stdio: "inherit", env: childEnvironment,
  });
  child.on("exit", code => { process.exitCode = code ?? 1; });
} else {
  run().catch(error => { console.error(error); require("electron").app.exit(1); });
}

async function run() {
  const { app, BrowserWindow, shell, dialog } = require("electron");
  const fsSync = require("node:fs");
  const root = fsSync.mkdtempSync(path.join(require("node:os").tmpdir(), "excelsis-file-ui-"));
  const profile = path.join(app.getPath("appData"), path.basename(root));
  app.setPath("appData", profile);
  app.setAppPath(project);
  const drawing = path.join(root, "Original.dxf");
  const dwg = path.join(root, "Original.dwg");
  const pdf = path.join(root, "Original.pdf");
  const text = "0\nSECTION\n2\nENTITIES\n0\nLINE\n8\nTEST\n10\n0\n20\n0\n11\n40\n21\n20\n0\nCIRCLE\n8\nTEST\n10\n10\n20\n10\n40\n2\n0\nENDSEC\n0\nEOF\n";
  fsSync.writeFileSync(drawing, text);
  fsSync.writeFileSync(dwg, "synthetic DWG file-action bytes");
  // Decoder behavior is not under test: DWG UI gets the synthetic DXF while
  // file mutations must still operate on the original .dwg, never a cache.
  require("../dwg-converter.cjs").convertedDxfPath = async source => {
    assert.equal(path.dirname(source), root);
    return drawing;
  };
  let recycleCount = 0;
  let permanentCount = 0;
  const recycleBlocked = new Set(), permanentBlocked = new Set();
  const permanentReplies = [], permanentWarnings = [];
  shell.trashItem = async file => {
    assert.equal(path.dirname(file), root);
    if (recycleBlocked.has(file)) throw new Error("Synthetic network Recycle Bin unavailable");
    await fs.rename(file, path.join(root, `recycled-${++recycleCount}-${path.basename(file)}`));
  };
  // The real single-file boundary is intercepted; even approved synthetic
  // deletions are recoverable. No real unlink/Recycle Bin operation is run.
  fs.unlink = async (...args) => {
    assert.equal(args.length, 1);
    const [file] = args;
    assert.equal(path.dirname(file), root);
    assert(recycleBlocked.has(file), "Only the registered synthetic failed-recycle file can reach unlink");
    if (permanentBlocked.has(file)) throw new Error("Synthetic locked file: permanent deletion denied");
    await fs.rename(file, path.join(root, `permanent-recovery-${++permanentCount}-${path.basename(file)}`));
  };
  dialog.showMessageBox = async (win, options) => {
    assert(win instanceof BrowserWindow, "A tile's WebContentsView handle is not a native dialog parent");
    assert(win && !win.isDestroyed());
    assert.equal(options.title, "Recycle Bin unavailable");
    assert.equal(options.type, "warning");
    assert.deepEqual(options.buttons, ["Cancel", "Permanently delete file"]);
    assert.equal(options.defaultId, 0); assert.equal(options.cancelId, 0);
    assert.match(options.detail, /cannot be undone/);
    assert.match(options.detail, /Only this exact file.*never its folder or other files/);
    assert.match(options.detail, /If deletion fails, Viewer stops/);
    assert(permanentReplies.length, "No unexpected or automatic destructive confirmation");
    permanentWarnings.push(options);
    return { response: permanentReplies.shift() };
  };
  const Module = require("node:module");
  const main = new Module(path.join(project, "main.cjs"), module);
  main.filename = path.join(project, "main.cjs");
  main.paths = module.paths;
  const source = fsSync.readFileSync(main.filename, "utf8")
    .replaceAll("new BrowserWindow({", "new BrowserWindow({ show: false,")
    + "\nmodule.exports.__test = { createDxfWindow, create3dPdfWindow, fileSetForFile, viewerWorkspaces };\n";
  main._compile(source, main.filename);
  const doc = await require("pdf-lib").PDFDocument.create();
  doc.addPage([300, 400]).drawText("Synthetic file action test", { x: 20, y: 300, size: 14 });
  await fs.writeFile(pdf, await doc.save());
  const api = main.exports.__test;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function wait(check, label) {
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) { if (await check()) return; await delay(80); }
    throw new Error(`Timed out: ${label}`);
  }
  await app.whenReady();
  await wait(() => BrowserWindow.getAllWindows().length, "launcher");
  for (const window of BrowserWindow.getAllWindows()) window.hide();
  async function open(file, moduleName) {
    const set = await api.fileSetForFile(file, moduleName);
    const win = moduleName === "dxf" ? api.createDxfWindow(set) : api.create3dPdfWindow(set);
    win.webContents.setBackgroundThrottling(false);
    await new Promise(resolve => win.webContents.once("did-finish-load", resolve));
    await wait(() => win.webContents.executeJavaScript(moduleName === "dxf"
      ? "!!document.getElementById('fileName') && !document.getElementById('renameFileBtn').disabled"
      : "!document.getElementById('pdfRenameFile').disabled"), "document loaded");
    return win;
  }
  const evaluate = (win, code) => win.webContents.executeJavaScript(code);
  const click = (win, id) => evaluate(win, `document.getElementById(${JSON.stringify(id)}).click();true`);
  const confirm = win => evaluate(win, "document.querySelector('#fileActionDialog form').requestSubmit();true");
  const isOpen = win => evaluate(win, "document.getElementById('fileActionDialog').open");
  const setName = (win, name) => evaluate(win, `document.getElementById('fileActionName').value=${JSON.stringify(name)};true`);
  async function checkRecents(win, section) {
    await wait(() => evaluate(win, "!document.getElementById('recentsButton').hidden"), "toolbar Recents ready");
    const placement = await evaluate(win, `(() => {
      const b=document.getElementById('recentsButton');
      return {first:[...document.querySelector('header').querySelectorAll('button')][0]?.id,
        position:getComputedStyle(b).position,writing:getComputedStyle(b).writingMode};
    })()`);
    assert.equal(placement.first, "recentsButton");
    assert.notEqual(placement.position, "fixed");
    assert.equal(placement.writing, "horizontal-tb");
    await click(win, "recentsButton");
    await wait(() => evaluate(win, `document.getElementById('recentsTitle').textContent==='Recent ${section} files'`), "section-specific Recents");
    await evaluate(win, "window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));true");
    assert.equal(await evaluate(win, "document.getElementById('recentsDialog').open"), false);
    await wait(() => evaluate(win, "document.activeElement.id==='recentsButton'"), "Recents close returns focus");
  }
  const dxf = await open(drawing, "dxf");
  await checkRecents(dxf, "DXF");
  for (const width of [900, 1000, 1050, 1051, 1240, 1400, 1600, 1800, 1920, 2400]) {
    dxf.setContentSize(width, 780);
    await delay(100);
    const layout = await evaluate(dxf, `(() => {
      const buttons=[...document.querySelectorAll('.toolbar button')].filter(b=>!b.closest('[hidden]')&&b.getBoundingClientRect().width);
      const rects=buttons.map(b=>({id:b.id||b.dataset.mode,x:b.getBoundingClientRect().x,y:b.getBoundingClientRect().y,right:b.getBoundingClientRect().right,bottom:b.getBoundingClientRect().bottom}));
      return {width:innerWidth,rects};
    })()`);
    assert(layout.rects.every(r => r.x >= 0 && r.right <= layout.width), `Overflow at ${width}: ${JSON.stringify(layout)}`);
    for (let i = 0; i < layout.rects.length; i++) for (let j = i + 1; j < layout.rects.length; j++) {
      const a = layout.rects[i], b = layout.rects[j];
      assert(!(Math.min(a.right, b.right) - Math.max(a.x, b.x) > 0.5 && Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 0.5), `Overlap at ${width}: ${a.id}/${b.id}`);
    }
    const rows = [...new Set(layout.rects.map(r => r.y))].sort((a, b) => a - b);
    assert(rows.length <= 2, `Unexpected toolbar rows at ${width}`);
    if (rows.length === 2) assert.equal(layout.rects.filter(r => r.y === rows[1]).sort((a, b) => a.x - b.x)[0].id, "dissolveBtn");
    const ids = layout.rects.filter(r => r.id).map(r => r.id);
    assert.equal(ids[0], "recentsButton");
    assert.equal(ids[1], "saveBtn");
    assert.equal(ids[ids.indexOf("discardBtn") + 1], "renameFileBtn");
    assert.equal(ids[ids.indexOf("renameFileBtn") + 1], "deleteFileBtn");
    assert.equal(ids[ids.indexOf("addChamferFilletBtn") + 1], "racetrackBtn");
    assert.equal(ids[ids.indexOf("rotateMenuBtn") + 1], "fitBtn");
  }
  // Make a real dirty geometry edit, then cancel/rename without losing it.
  await click(dxf, "rotateBtn");
  await wait(() => evaluate(dxf, "document.getElementById('dirtyState').textContent==='Unsaved changes'"), "dirty edit");
  await click(dxf, "renameFileBtn");
  assert.equal(await evaluate(dxf, "document.getElementById('fileActionName').value"), "Original.dxf");
  assert.deepEqual(await evaluate(dxf, "[document.getElementById('fileActionName').selectionStart,document.getElementById('fileActionName').selectionEnd]"), [0,8]);
  await click(dxf, "fileActionCancelBtn");
  assert.equal(await fs.readFile(drawing, "utf8"), text);
  const duplicate = path.join(root, "Exists.dxf");
  await fs.writeFile(duplicate, text);
  await click(dxf, "renameFileBtn");
  await setName(dxf, "Exists.dxf"); await confirm(dxf);
  await wait(() => evaluate(dxf, "document.getElementById('fileActionError').textContent.includes('already exists')"), "collision rejected");
  assert(await isOpen(dxf));
  await setName(dxf, "Renamed.dxf"); await confirm(dxf);
  await wait(async () => !(await isOpen(dxf)), "rename complete");
  assert.equal(await evaluate(dxf, "document.getElementById('dirtyState').textContent"), "Unsaved changes");
  assert.equal(await fs.readFile(path.join(root, "Renamed.dxf"), "utf8"), text);
  await click(dxf, "saveBtn");
  await wait(() => evaluate(dxf, "document.getElementById('dirtyState').textContent==='Clean'"), "save renamed drawing");
  assert.notEqual(await fs.readFile(path.join(root, "Renamed.dxf"), "utf8"), text);
  // Wrong current-file requests are rejected even for granted folder neighbors.
  await evaluate(dxf, `window.dxfApp.listDxfFolder(${JSON.stringify(path.join(root, "Renamed.dxf"))})`);
  assert.match(await evaluate(dxf, `window.dxfApp.deleteFile(${JSON.stringify(duplicate)}).then(()=>'',e=>e.message)`), /current file/);
  await click(dxf, "deleteFileBtn"); await click(dxf, "fileActionCancelBtn");
  assert.equal(recycleCount, 0);
  await click(dxf, "deleteFileBtn"); await confirm(dxf);
  await wait(async () => !(await isOpen(dxf)), "delete complete");
  assert.equal(await evaluate(dxf, "document.getElementById('fileName').textContent"), "No file open");
  assert.equal(await evaluate(dxf, "document.getElementById('nextBtn').disabled"), false);
  const history = await evaluate(dxf, "window.excelsisRecents.list()");
  assert(!history.entries.some(entry => /(?:Original|Renamed)\.dxf$/i.test(entry.name)));
  assert.equal(permanentWarnings.length, 0, "Successful recycling must not offer permanent deletion");
  // DXF: canceling the second warning and an unlink failure both preserve
  // file identity, original bytes, unsaved geometry and current claims.
  await click(dxf, "nextBtn");
  await wait(() => evaluate(dxf, "document.getElementById('fileName').textContent==='Exists.dxf'"), "open synthetic NAS DXF");
  await click(dxf, "rotateBtn");
  await wait(() => evaluate(dxf, "document.getElementById('dirtyState').textContent==='Unsaved changes'"), "dirty NAS DXF");
  recycleBlocked.add(duplicate);
  permanentReplies.push(0);
  await click(dxf, "deleteFileBtn"); await confirm(dxf);
  await wait(async () => !(await isOpen(dxf)), "cancel native permanent warning");
  assert.equal(await fs.readFile(duplicate, "utf8"), text);
  assert.equal(await evaluate(dxf, "document.getElementById('fileName').textContent"), "Exists.dxf");
  assert.equal(await evaluate(dxf, "document.getElementById('dirtyState').textContent"), "Unsaved changes");
  assert.equal(await evaluate(dxf, "document.getElementById('renameFileBtn').disabled"), false);
  assert((await evaluate(dxf, "window.excelsisRecents.list()")).entries.some(entry => entry.name === "Exists.dxf"));
  permanentBlocked.add(duplicate); permanentReplies.push(1);
  await click(dxf, "deleteFileBtn"); await confirm(dxf);
  await wait(() => evaluate(dxf, "document.getElementById('fileActionError').textContent.includes('permanent deletion denied')"), "report failed one-file deletion");
  assert(await isOpen(dxf));
  assert.equal(await fs.readFile(duplicate, "utf8"), text);
  assert.equal(await evaluate(dxf, "document.getElementById('dirtyState').textContent"), "Unsaved changes");
  assert.equal(permanentCount, 0);
  permanentBlocked.delete(duplicate); permanentReplies.push(1);
  await confirm(dxf);
  await wait(async () => !(await isOpen(dxf)), "explicit retry with fresh permanent warning");
  assert.equal(permanentCount, 1);
  assert.equal(await fs.readFile(path.join(root, "permanent-recovery-1-Exists.dxf"), "utf8"), text);
  // DWG gets the file actions, but none of the DXF-only creation/repair tools.
  await fs.writeFile(drawing, text); // retained synthetic conversion fixture
  const dwgWindow = await open(dwg, "dxf");
  await checkRecents(dwgWindow, "DWG");
  assert.deepEqual(await evaluate(dwgWindow, "['racetrackBtn','fixOuterContourBtn','addChamferFilletBtn','removeChamferFilletBtn'].map(id=>document.getElementById(id).hidden)"), [true,true,true,true]);
  await click(dwgWindow, "renameFileBtn"); await setName(dwgWindow, "Renamed.dwg"); await confirm(dwgWindow);
  await wait(async () => !(await isOpen(dwgWindow)), "DWG rename");
  assert.equal(await fs.readFile(path.join(root, "Renamed.dwg"), "utf8"), "synthetic DWG file-action bytes");
  const renamedDwg = path.join(root, "Renamed.dwg");
  recycleBlocked.add(renamedDwg); permanentReplies.push(0);
  await click(dwgWindow, "deleteFileBtn"); await confirm(dwgWindow);
  await wait(async () => !(await isOpen(dwgWindow)), "DWG permanent cancel");
  assert.equal(await fs.readFile(renamedDwg, "utf8"), "synthetic DWG file-action bytes");
  permanentReplies.push(1);
  await click(dwgWindow, "deleteFileBtn"); await confirm(dwgWindow);
  await wait(async () => !(await isOpen(dwgWindow)), "DWG confirmed one-file deletion");
  assert.equal(await fs.readFile(path.join(root, "permanent-recovery-2-Renamed.dwg"), "utf8"), "synthetic DWG file-action bytes");
  assert.equal(await fs.readFile(drawing, "utf8"), text, "The converted drawing/cache must not be deleted with the source DWG");
  const pdfWindow = await open(pdf, "3dpdf");
  await checkRecents(pdfWindow, "PDF");
  for (const width of [900, 1050, 1240, 1920]) {
    pdfWindow.setContentSize(width, 780);
    await delay(100);
    const pager = await evaluate(pdfWindow, `(() => {
      const prev=document.getElementById('pdfPrevFile'), next=document.getElementById('pdfNextFile');
      const rect=document.getElementById('pdfFilePager').getBoundingClientRect();
      return {previousFooter:prev.closest('footer')?.id,nextFooter:next.closest('footer')?.id,
        bottom:rect.bottom,height:innerHeight,top:rect.top,workspace:document.getElementById('workspace').getBoundingClientRect().bottom,
        center:(prev.getBoundingClientRect().x+next.getBoundingClientRect().right)/2,width:innerWidth,
        counter:document.getElementById('pdfFileCounter').textContent};
    })()`);
    assert.equal(pager.previousFooter, "pdfFilePager");
    assert.equal(pager.nextFooter, "pdfFilePager");
    assert(Math.abs(pager.bottom - pager.height) <= 1);
    assert(pager.top >= pager.workspace - 1);
    assert(Math.abs(pager.center - pager.width / 2) <= 1);
    assert.equal(pager.counter, "1 / 1");
    await fs.writeFile(path.join(root, `pdf-layout-${width}.png`), (await pdfWindow.webContents.capturePage()).toPNG());
  }
  await click(pdfWindow, "pdfRenameFile");
  assert.equal(await evaluate(pdfWindow, "document.getElementById('fileActionName').value"), "Original.pdf");
  await setName(pdfWindow, "Renamed.pdf"); await confirm(pdfWindow);
  await wait(async () => !(await isOpen(pdfWindow)), "PDF rename");
  await click(pdfWindow, "pdfSave");
  await wait(() => evaluate(pdfWindow, "document.getElementById('stats').textContent.includes('saved.')"), "PDF save on renamed path");
  await assert.rejects(fs.stat(pdf), { code: "ENOENT" });
  await click(pdfWindow, "pdfDiscard"); await confirm(pdfWindow);
  await wait(async () => !(await isOpen(pdfWindow)), "PDF discard");
  const renamedPdf = path.join(root, "Renamed.pdf");
  const savedPdf = await fs.readFile(renamedPdf);
  recycleBlocked.add(renamedPdf); permanentReplies.push(0);
  await click(pdfWindow, "pdfDeleteFile"); await confirm(pdfWindow);
  await wait(async () => !(await isOpen(pdfWindow)), "PDF permanent cancel");
  assert.deepEqual(await fs.readFile(renamedPdf), savedPdf);
  assert.equal(await evaluate(pdfWindow, "document.getElementById('pdfRenameFile').disabled"), false);
  permanentReplies.push(1);
  await click(pdfWindow, "pdfDeleteFile"); await confirm(pdfWindow);
  await wait(async () => !(await isOpen(pdfWindow)), "PDF delete");
  assert.equal(await evaluate(pdfWindow, "document.getElementById('pdfRenameFile').disabled"), true);
  assert.equal(recycleCount, 1);
  assert.equal(permanentCount, 3);
  assert.deepEqual(await fs.readFile(path.join(root, "permanent-recovery-3-Renamed.pdf")), savedPdf);
  assert.equal(permanentWarnings.length, 7);
  assert.equal(permanentReplies.length, 0);
  // The selected tile's native child editor is not a BrowserWindow. Its
  // fallback warning must attach to the containing root window, not the handle.
  const reopened = api.createDxfWindow(await api.fileSetForFile(drawing, "dxf"));
  reopened.webContents.setBackgroundThrottling(false);
  await wait(() => evaluate(reopened, "document.getElementById('fileName').textContent==='Original.dxf' && !document.getElementById('renameFileBtn').disabled"), "reopen root for child warning");
  const childDrawing = path.join(root, "Child.dxf");
  await fs.writeFile(childDrawing, text);
  const child = api.createDxfWindow(await api.fileSetForFile(childDrawing, "dxf"));
  assert(child.nativeWindow instanceof BrowserWindow);
  assert.notEqual(child, child.nativeWindow);
  child.webContents.setBackgroundThrottling(false);
  const childDoc = api.viewerWorkspaces.getState(dxf.webContents).folders.flatMap(folder => folder.files).find(entry => entry.path === childDrawing);
  assert(childDoc);
  await api.viewerWorkspaces.action(dxf.webContents, "select", childDoc.id);
  await wait(() => evaluate(child, "document.getElementById('fileName').textContent==='Child.dxf' && !document.getElementById('renameFileBtn').disabled"), "selected child editor");
  recycleBlocked.add(childDrawing); permanentReplies.push(0);
  await click(child, "deleteFileBtn"); await confirm(child);
  await wait(async () => !(await isOpen(child)), "child native warning cancel");
  assert.equal(await fs.readFile(childDrawing, "utf8"), text);
  assert.equal(api.viewerWorkspaces.getState(dxf.webContents).count, 2);
  permanentReplies.push(1);
  await click(child, "deleteFileBtn"); await confirm(child);
  await wait(async () => !(await isOpen(child)), "child native warning confirmed");
  await wait(() => api.viewerWorkspaces.getState(dxf.webContents).count === 1, "only deleted child removed from tabs");
  assert.equal(await fs.readFile(drawing, "utf8"), text);
  assert.equal(await fs.readFile(path.join(root, "permanent-recovery-4-Child.dxf"), "utf8"), text);
  assert.equal(permanentWarnings.length, 9);
  assert.equal(permanentReplies.length, 0);
  const report = { toolbarWidths: [900,1000,1050,1051,1240,1400,1600,1800,1920,2400], modalCancel: true, prefilledName: true, basenameSelected: true, noOverwrite: true, renamePreservesDirty: true, saveUsesRenamedPath: true, wrongCurrentRejected: true, recentsUpdated: true, recoverableDeleteAdapter: true, dwgFileActions: true, dxfOnlyToolsHiddenForDwg: true, pdfFileActions: true, pdfDiscard: true, evidence: root, isolatedProfile: profile };
  report.topRecentsAllFormats = true;
  report.pdfBottomFolderNavigation = true;
  report.pdfPagerWidths = [900, 1050, 1240, 1920];
  report.permanentDelete = { nativeWarningAllFormats: true, defaultCancel: true, cancelPreservesIdentityAndDirty: true,
    unlinkFailurePreservesDirty: true, explicitRetryRequiresNewWarning: true, exactlyOneSyntheticFile: true,
    dwgConvertedCacheUntouched: true, childNativeParent: true, onlyDeletedChildTabRemoved: true,
    realDeletionNeverRun: true, warnings: permanentWarnings.length };
  await fs.writeFile(path.join(root, "result.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  app.exit(0);
}
