// Hidden Electron integration test: a selection made in the drawing scrolls the
// right-side feature list to it. Synthetic DXF and isolated profile only.
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
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "excelsis-feature-follow-"));
  app.setPath("appData", path.join(root, "profile"));
  app.setAppPath(project);
  const line = (x1, y1, x2, y2) => `0\nLINE\n8\nOUTER\n10\n${x1}\n20\n${y1}\n11\n${x2}\n21\n${y2}\n`;
  const circle = (x, y, d) => `0\nCIRCLE\n8\nHOLES\n10\n${x}\n20\n${y}\n40\n${d / 2}\n`;
  // Sixty holes of distinct sizes give a feature list far taller than the panel.
  let holes = "";
  for (let index = 0; index < 60; index++) holes += circle(10 + (index % 20) * 14, 10 + Math.floor(index / 20) * 30, 2 + index * 0.05);
  const drawing = path.join(root, "many-holes.dxf");
  fs.writeFileSync(drawing, `0\nSECTION\n2\nENTITIES\n${line(0, 0, 300, 0)}${line(300, 0, 300, 100)}`
    + `${line(300, 100, 0, 100)}${line(0, 100, 0, 0)}${holes}0\nENDSEC\n0\nEOF\n`);

  // Test-only hook appended to the served app.js (module scope), as the
  // workspace renderer test does; production files are unchanged.
  const footer = `\nglobalThis.__followTest={internal:()=>state.features.filter(f=>f.kind==="internal").map(f=>f.id),select:id=>selectFeature(id,false),grow:()=>applySelectionOffset(0.2)};`;
  const Module = require("node:module");
  const main = new Module(path.join(project, "main.cjs"), module);
  main.filename = path.join(project, "main.cjs");
  main.paths = module.paths;
  const source = fs.readFileSync(main.filename, "utf8")
    .replaceAll("new BrowserWindow({", "new BrowserWindow({ show: false,")
    .replace("const body = await fs.readFile(requestedPath);", `let body = await fs.readFile(requestedPath);
      if(requestedPath===${JSON.stringify(path.join(project, "modules/dxf/app.js"))}) body=Buffer.concat([body,Buffer.from(${JSON.stringify(footer)})]);`)
    .replace('"Content-Length": String(stat.size)', '"Content-Length": String(body.length)');
  assert(source.includes("__followTest"), "test hook was not injected");
  main._compile(source + "\nmodule.exports.__test = { createDxfWindow, fileSetForFile };\n", main.filename);
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
  win.setContentSize(1240, 700);
  await new Promise(resolve => win.webContents.once("did-finish-load", resolve));
  const evaluate = code => win.webContents.executeJavaScript(code);
  await wait(() => evaluate("document.querySelectorAll('.feature-item.internal').length === 60"), "sixty holes listed");
  // Visibility of the selected item inside its scrolling ancestor.
  const selectedVisibility = () => evaluate(`(() => {
    const item=document.querySelector('.feature-item.selected'); if(!item) return null;
    let box=item.parentElement; while(box && !(box.scrollHeight>box.clientHeight && /auto|scroll/.test(getComputedStyle(box).overflowY))) box=box.parentElement;
    const r=item.getBoundingClientRect(), c=box.getBoundingClientRect();
    return {visible:r.top>=c.top-1&&r.bottom<=c.bottom+1, scrollTop:box.scrollTop, scrollable:box.scrollHeight>box.clientHeight};
  })()`);
  const scrollListTo = top => evaluate(`(() => { let box=document.getElementById('featureList').parentElement;
    while(box && !(box.scrollHeight>box.clientHeight && /auto|scroll/.test(getComputedStyle(box).overflowY))) box=box.parentElement;
    box.scrollTop=${top}; return box.scrollTop; })()`);
  const ids = await evaluate("__followTest.internal()");
  assert.equal(ids.length, 60);

  // A drawing-side selection far down the list scrolls it into view.
  assert.equal(await scrollListTo(0), 0);
  await evaluate(`__followTest.select(${ids.at(-1)}); true`);
  await wait(async () => (await selectedVisibility())?.visible === true, "list follows a drawing selection");
  const followed = await selectedVisibility();
  assert(followed.scrollable && followed.scrollTop > 0, "the panel scrolled to reach the selected feature");

  // The user scrolls away; a geometry-only change keeps their position.
  await scrollListTo(0);
  await evaluate("__followTest.grow(); true");
  await wait(() => evaluate("document.getElementById('dirtyState').textContent === 'Unsaved changes'"), "geometry edit");
  await delay(300);
  assert.equal((await selectedVisibility()).visible, false, "an unchanged selection does not pull the list back");

  // A new selection follows again (here one near the top after scrolling down).
  await scrollListTo(100000);
  await evaluate(`__followTest.select(${ids[0]}); true`);
  await wait(async () => (await selectedVisibility())?.visible === true, "list follows the next selection");
  console.log(JSON.stringify({ passed: true, followsDrawingSelection: true, respectsUserScroll: true, followsNextSelection: true, root }));
  app.exit(0);
}
