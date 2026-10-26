// Hidden Electron integration test: PDF folder Next/Previous file access. Over a
// NAS every read and folder listing is a network round trip, so each step must
// read the file once (no separate 3D scan) and not re-list the folder on the
// critical path. Synthetic PDFs and an isolated profile only.
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
  const { app, BrowserWindow, ipcMain } = require("electron");
  const { PDFDocument } = require("pdf-lib");
  const { embedded3dFormat } = await import("../modules/3dpdf/nano-prc.mjs");
  const bytes = text => new TextEncoder().encode(text);
  assert.equal(embedded3dFormat(bytes("%PDF-1.7 /Type /Page /Contents")), null);
  assert.equal(embedded3dFormat(bytes("x /PRC y /U3D")), "prc", "first marker wins, like the main-process detector");
  assert.equal(embedded3dFormat(bytes("x /U3D y /PRC")), "u3d");
  assert.equal(embedded3dFormat(bytes("/PR")), null);

  const root = fs.mkdtempSync(path.join(os.tmpdir(), "excelsis-pdf-nav-io-"));
  app.setPath("appData", path.join(root, "profile"));
  app.setAppPath(project);
  const files = [];
  for (const name of ["a.pdf", "b.pdf", "c.pdf"]) {
    const doc = await PDFDocument.create();
    doc.addPage([300, 400]).drawText(name, { x: 30, y: 340, size: 24 });
    const file = path.join(root, name); fs.writeFileSync(file, await doc.save()); files.push(file);
  }
  const calls = [];
  const originalHandle = ipcMain.handle.bind(ipcMain);
  ipcMain.handle = (channel, handler) => originalHandle(channel, (...args) => { calls.push(channel); return handler(...args); });
  const Module = require("node:module");
  const main = new Module(path.join(project, "main.cjs"), module);
  main.filename = path.join(project, "main.cjs");
  main.paths = module.paths;
  main._compile(fs.readFileSync(main.filename, "utf8").replaceAll("new BrowserWindow({", "new BrowserWindow({ show: false,")
    + "\nmodule.exports.__test = { create3dPdfWindow, fileSetForFile };\n", main.filename);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function wait(check, label) {
    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) { if (await check()) return; await delay(40); }
    throw new Error(`Timed out: ${label}`);
  }
  await app.whenReady();
  await wait(() => BrowserWindow.getAllWindows().length, "launcher");
  for (const window of BrowserWindow.getAllWindows()) window.hide();
  const win = main.exports.__test.create3dPdfWindow(await main.exports.__test.fileSetForFile(files[0], "3dpdf"));
  win.webContents.setBackgroundThrottling(false);
  const evaluate = code => win.webContents.executeJavaScript(code);
  const readyOn = name => evaluate(`(()=>{const s=window.excelsisDocumentSession?.status?.();return !!s&&s.ready&&!s.busy&&String(s.path).endsWith(${JSON.stringify(name)})})()`).catch(() => false);
  const count = (from, channel) => calls.slice(from).filter(entry => entry === channel).length;

  const opening = calls.length;
  await wait(() => readyOn("a.pdf"), "first PDF");
  assert.equal(count(opening, "3d:detect-file"), 0, "no separate 3D scan read");
  assert.equal(count(opening, "fs:read-binary-file"), 1, "the first PDF is read once");
  assert.equal(count(opening, "fs:list-pdf-folder"), 0, "the opening file set is reused as the folder listing");
  assert.equal(await evaluate("document.getElementById('pdfFileCounter').textContent"), "1 / 3");

  // Two quick steps: one read each, and the fresh listing is reused.
  const stepping = calls.length;
  await evaluate("document.getElementById('pdfNextFile').click(); true");
  await wait(() => readyOn("b.pdf"), "next PDF");
  await evaluate("document.getElementById('pdfNextFile').click(); true");
  await wait(() => readyOn("c.pdf"), "next PDF again");
  assert.equal(count(stepping, "3d:detect-file"), 0);
  assert.equal(count(stepping, "fs:read-binary-file"), 2, "one read per step");
  // Formerly two listings per step (before and after); now at most the one
  // background refresh scheduled after a slow (cold) first load.
  assert(count(stepping, "fs:list-pdf-folder") <= 1, `folder listings during two steps: ${count(stepping, "fs:list-pdf-folder")}`);
  assert.equal(await evaluate("document.getElementById('pdfFileCounter').textContent"), "3 / 3");
  assert.equal(await evaluate("document.getElementById('pdfFileName').textContent"), "c.pdf");

  // A file added to the folder appears once the listing is refreshed (here by
  // window focus, as for the user returning from Explorer).
  const added = path.join(root, "d.pdf"); fs.copyFileSync(files[0], added);
  await evaluate("window.dispatchEvent(new Event('focus')); true");
  await wait(async () => await evaluate("document.getElementById('pdfFileCounter').textContent") === "3 / 4", "listing refreshed on focus");
  await evaluate("document.getElementById('pdfNextFile').click(); true");
  await wait(() => readyOn("d.pdf"), "newly listed PDF");
  console.log(JSON.stringify({ passed: true, oneReadPerStep: true, no3dScanRead: true, listingReused: true, focusRefresh: true, root }));
  app.exit(0);
}
