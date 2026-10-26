// Hidden Electron integration test: "Offset All Thread Holes" and the
// "Change all same size holes" tickbox. Synthetic DXF and isolated profile only.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const project = path.resolve(__dirname, "..");
if (!process.versions.electron) {
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.NODE_OPTIONS;
  const child = require("node:child_process").spawn(require("electron"), [__filename], {
    cwd: project, windowsHide: true, stdio: "inherit", env,
  });
  child.on("exit", code => { process.exitCode = code ?? 1; });
} else {
  run().catch(error => { console.error(error); require("electron").app.exit(1); });
}

async function run() {
  const { app, BrowserWindow } = require("electron");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "excelsis-hole-tools-"));
  app.setPath("appData", path.join(root, "profile"));
  app.setAppPath(project);
  const line = (x1, y1, x2, y2) => `0\nLINE\n8\nOUTER\n10\n${x1}\n20\n${y1}\n11\n${x2}\n21\n${y2}\n`;
  const circle = (x, y, d) => `0\nCIRCLE\n8\nHOLES\n10\n${x}\n20\n${y}\n40\n${d / 2}\n`;
  // M6 tap drill Ø5 x3, M8 Ø6.8 x2, M5 Ø4.2 x1, plain Ø6 x1.
  const drawing = path.join(root, "holes.dxf");
  fs.writeFileSync(drawing, `0\nSECTION\n2\nENTITIES\n${line(0, 0, 300, 0)}${line(300, 0, 300, 100)}`
    + `${line(300, 100, 0, 100)}${line(0, 100, 0, 0)}`
    + `${circle(20, 20, 5)}${circle(60, 20, 5)}${circle(100, 20, 5)}${circle(140, 20, 6.8)}`
    + `${circle(180, 20, 6.8)}${circle(220, 20, 4.2)}${circle(260, 20, 6)}0\nENDSEC\n0\nEOF\n`);
  // Batch neighbours: M10 holes, a plain-hole-only file, and one open elsewhere.
  const plate = holes => `0\nSECTION\n2\nENTITIES\n${line(0, 0, 300, 0)}${line(300, 0, 300, 100)}`
    + `${line(300, 100, 0, 100)}${line(0, 100, 0, 0)}${holes}0\nENDSEC\n0\nEOF\n`;
  const moreDrawing = path.join(root, "b-more.dxf"), plainDrawing = path.join(root, "c-none.dxf"), openDrawing = path.join(root, "d-open.dxf");
  fs.writeFileSync(moreDrawing, plate(`${circle(20, 20, 8.5)}${circle(60, 20, 8.5)}${circle(100, 20, 7)}`));
  fs.writeFileSync(plainDrawing, plate(circle(20, 20, 6)));
  fs.writeFileSync(openDrawing, plate(circle(20, 20, 5)));
  const plainBytes = fs.readFileSync(plainDrawing), openBytes = fs.readFileSync(openDrawing);

  const Module = require("node:module");
  const main = new Module(path.join(project, "main.cjs"), module);
  main.filename = path.join(project, "main.cjs");
  main.paths = module.paths;
  main._compile(fs.readFileSync(main.filename, "utf8")
    .replaceAll("new BrowserWindow({", "new BrowserWindow({ show: false,")
    + "\nmodule.exports.__test = { createDxfWindow, fileSetForFile };\n", main.filename);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function wait(check, label) {
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) { if (await check()) return; await delay(60); }
    throw new Error(`Timed out: ${label}`);
  }
  await app.whenReady();
  await wait(() => BrowserWindow.getAllWindows().length, "launcher");
  for (const window of BrowserWindow.getAllWindows()) window.hide();
  const win = main.exports.__test.createDxfWindow(await main.exports.__test.fileSetForFile(drawing, "dxf"));
  win.webContents.setBackgroundThrottling(false);
  await new Promise(resolve => win.webContents.once("did-finish-load", resolve));
  const evaluate = code => win.webContents.executeJavaScript(code);
  await wait(() => evaluate("document.querySelectorAll('.feature-item.internal').length === 7"), "seven holes");
  const diameters = () => evaluate(`[...document.querySelectorAll('.feature-item.internal')]
    .map(item => Number(item.querySelector('.feature-meta').textContent.match(/ - ([0-9.]+) x/)[1])).sort((a,b)=>a-b)`);
  const pick = size => evaluate(`(() => { const item=[...document.querySelectorAll('.feature-item.internal')]
    .find(item=>item.querySelector('.feature-meta').textContent.includes(' - ${size} x ${size} mm')); item.click(); return true })()`);
  const selectedCount = () => evaluate("document.querySelectorAll('.feature-item.selected').length");
  const row = label => `[...document.querySelectorAll('.selection-row')].find(row=>row.firstElementChild?.textContent===${JSON.stringify(label + ":")})`;

  // Offset All Thread Holes: default -0.5 mm, per-size opt-out, one undo step.
  assert.equal(await evaluate("document.getElementById('offsetThreadHolesBtn').hidden"), false);
  await evaluate("document.getElementById('offsetThreadHolesBtn').click(); true");
  await wait(() => evaluate("document.getElementById('threadHoleDialog').open"), "thread-hole dialog");
  assert.equal(await evaluate("document.getElementById('threadHoleOffsetInput').value"), "-0.5");
  assert.deepEqual(await evaluate("[...document.querySelectorAll('#threadHoleSizes .thread-hole-size span')].map(s=>s.textContent)"),
    ["M5: Ø4.2 → Ø3.2 (1 hole)", "M6: Ø5 → Ø4 (3 holes)", "M8: Ø6.8 → Ø5.8 (2 holes)"], "plain Ø6 is not a thread hole");
  // Comma decimals are accepted, like the selection size fields.
  await evaluate(`(() => { const i=document.getElementById('threadHoleOffsetInput'); i.value='0,5'; i.dispatchEvent(new Event('input',{bubbles:true})); return true })()`);
  await evaluate(`(() => { const box=document.querySelector('#threadHoleSizes input[data-thread="M5"]'); box.click(); return true })()`);
  assert.match(await evaluate("document.getElementById('threadHoleHint').textContent"), /^5 holes will be offset/);
  await evaluate(`(() => { const i=document.getElementById('threadHoleOffsetInput'); i.value='-3'; i.dispatchEvent(new Event('input',{bubbles:true})); return true })()`);
  assert.match(await evaluate("document.getElementById('threadHoleHint').textContent"), /would close/);
  assert.equal(await evaluate("document.getElementById('threadHoleApplyBtn').disabled"), true);
  await evaluate(`(() => { const i=document.getElementById('threadHoleOffsetInput'); i.value='0,5'; i.dispatchEvent(new Event('input',{bubbles:true})); return true })()`);
  await evaluate("document.getElementById('threadHoleApplyBtn').click(); true");
  await wait(async () => !(await evaluate("document.getElementById('threadHoleDialog').open")), "thread-hole apply");
  await wait(async () => JSON.stringify(await diameters()) === JSON.stringify([4.2, 6, 6, 6, 6, 7.8, 7.8]), "M6/M8 offset, M5 and plain hole untouched");
  assert.equal(await selectedCount(), 5, "offset holes stay selected");
  assert.equal(await evaluate("document.getElementById('dirtyState').textContent"), "Unsaved changes");
  const focusAfterApply = await evaluate("`${document.activeElement?.tagName}#${document.activeElement?.id}`");
  assert(!/^(INPUT|TEXTAREA|SELECT)#/.test(focusAfterApply) || !(await evaluate("document.activeElement.closest('dialog')")),
    `Focus must not stay in the closed dialog: ${focusAfterApply}`);
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{key:'z',ctrlKey:true,bubbles:true})); true");
  await wait(async () => JSON.stringify(await diameters()) === JSON.stringify([4.2, 5, 5, 5, 6, 6.8, 6.8]), "one undo restores every hole");
  await evaluate("document.getElementById('offsetThreadHolesBtn').click(); true");
  await wait(() => evaluate("document.getElementById('threadHoleDialog').open"), "thread-hole dialog again");
  await evaluate("document.getElementById('threadHoleCancelBtn').click(); true");
  await wait(async () => !(await evaluate("document.getElementById('threadHoleDialog').open")), "cancel");
  assert.deepEqual(await diameters(), [4.2, 5, 5, 5, 6, 6.8, 6.8], "Cancel changes nothing");

  // Change all same size holes: tick selects every equal hole, Set resizes all.
  await pick(6.8);
  await wait(() => evaluate("!!document.getElementById('sameSizeHolesToggle')"), "tickbox on single hole");
  assert.equal(await evaluate("document.getElementById('sameSizeHolesToggle').parentElement.textContent"), "Change all same size holes (2)");
  await evaluate("document.getElementById('sameSizeHolesToggle').click(); true");
  await wait(async () => await selectedCount() === 2, "both Ø6.8 holes selected");
  assert.equal(await evaluate("document.getElementById('sameSizeHolesToggle').checked"), true);
  assert.equal(await evaluate(`${row("Diameter")}?.querySelector('input')?.value || null`), "6.8");
  await evaluate(`(() => { const i=${row("Diameter")}.querySelector('input'); i.value='8'; ${row("Diameter")}.querySelector(':scope > button').click(); return true })()`);
  await wait(async () => JSON.stringify(await diameters()) === JSON.stringify([4.2, 5, 5, 5, 6, 8, 8]), "both resized together");
  assert.equal(await evaluate("document.getElementById('sameSizeHolesToggle')?.checked"), true, "tickbox stays on its group after Set");
  await evaluate("document.getElementById('sameSizeHolesToggle').click(); true");
  await wait(async () => await selectedCount() === 1, "untick returns to the original hole");
  assert.equal(await evaluate("document.getElementById('sameSizeHolesToggle').checked"), false);
  // Three Ø5 holes; the lone Ø4.2 gets a disabled tickbox.
  await pick(5);
  await wait(() => evaluate("document.getElementById('sameSizeHolesToggle')?.parentElement.textContent === 'Change all same size holes (3)'"), "three Ø5 holes");
  await pick(4.2);
  await wait(() => evaluate("document.getElementById('sameSizeHolesToggle')?.disabled === true"), "single-size hole tickbox disabled");
  await evaluate("document.getElementById('saveBtn').click(); true");
  await wait(() => evaluate("document.querySelector('#dirtyState').textContent === 'Clean'"), "saved");
  const savedDiameters = file => [...fs.readFileSync(file, "utf8").replaceAll("\r", "").matchAll(/\n0\nCIRCLE\n(?:[^]*?)\n40\n([-+0-9.eE]+)/g)]
    .map(match => Math.round(Number(match[1]) * 2 * 1e6) / 1e6).sort((a, b) => a - b);
  assert.deepEqual(savedDiameters(drawing), [4.2, 5, 5, 5, 6, 8, 8]);

  // Batch: every DXF in the folder, all thread holes, each changed file saved.
  const other = main.exports.__test.createDxfWindow(await main.exports.__test.fileSetForFile(openDrawing, "dxf"));
  other.webContents.setBackgroundThrottling(false);
  await wait(() => other.webContents.executeJavaScript("document.getElementById('fileName').textContent==='d-open.dxf'"), "neighbour open elsewhere");
  await evaluate("window.__alerts=[]; window.alert=m=>window.__alerts.push(String(m)); true");
  await evaluate("document.getElementById('offsetThreadHolesBtn').click(); true");
  await wait(() => evaluate("document.getElementById('threadHoleDialog').open"), "dialog for batch");
  assert.equal(await evaluate("document.getElementById('threadHoleBatchToggle').checked"), false, "batch starts off");
  await evaluate("document.getElementById('threadHoleBatchToggle').click(); true");
  assert.equal(await evaluate("document.getElementById('threadHoleSizeList').hidden"), true, "no detected-hole list to accept in batch mode");
  assert.equal(await evaluate("getComputedStyle(document.getElementById('threadHoleSizeList')).display"), "none");
  assert.equal(await evaluate("document.getElementById('threadHoleApplyBtn').textContent"), "Offset and save all");
  assert.match(await evaluate("document.getElementById('threadHoleHint').textContent"), /^4 DXF files in this folder\. .*cannot be undone/);
  await evaluate("document.getElementById('threadHoleApplyBtn').click(); true");
  // Batch uses the default -0.5 mm.
  await wait(() => evaluate("document.getElementById('hud').textContent.includes('Thread-hole batch -0.5 mm: 2 files saved, 6 holes offset')"), "batch summary");
  const hud = await evaluate("document.getElementById('hud').textContent");
  assert.match(hud, /1 without thread holes left unchanged/);
  assert.match(hud, /skipped \(open elsewhere or read-only\): d-open\.dxf/);
  assert.equal((await evaluate("window.__alerts")).length, 1, "skips are reported in a dialog too");
  assert.equal(await evaluate("document.getElementById('fileName').textContent"), "holes.dxf", "ends on the starting file");
  assert.equal(await evaluate("document.getElementById('dirtyState').textContent"), "Clean");
  assert.deepEqual(savedDiameters(drawing), [3.2, 4, 4, 4, 6, 8, 8], "M5/M6 shrunk; plain Ø6 and Ø8 untouched");
  assert.deepEqual(savedDiameters(moreDrawing), [7, 7.5, 7.5], "M10 shrunk; plain Ø7 untouched");
  assert.deepEqual(fs.readFileSync(plainDrawing), plainBytes, "a file without thread holes is not rewritten");
  assert.deepEqual(fs.readFileSync(openDrawing), openBytes, "a file open elsewhere is not touched");
  await wait(async () => JSON.stringify(await diameters()) === JSON.stringify([3.2, 4, 4, 4, 6, 8, 8]), "view shows the saved starting file");
  console.log(JSON.stringify({ passed: true, threadHoleDefaultOffset: -0.5, perSizeOptOut: true, plainHoleIgnored: true,
    commaDecimal: true, closingOffsetRejected: true, oneUndoStep: true, cancelNoChange: true,
    sameSizeTickSelectsAll: true, sameSizeSetResizesAll: true, untickRestoresSingle: true, lonelySizeDisabled: true, saved: true,
    batch: { noHoleList: true, filesSaved: 2, holesOffset: 6, unchangedNotRewritten: true, openElsewhereSkipped: true, returnsToStart: true }, root }));
  app.exit(0);
}
