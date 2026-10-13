// Hidden Electron integration test: synthetic DXF and isolated profile only.
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
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "excelsis-selection-sizing-"));
  app.setPath("appData", path.join(root, "profile"));
  app.setAppPath(project);
  const { parseSelectionNumber, stepSelectionNumber, commonSelectionSizing } = await import("../modules/dxf/selection-sizing.mjs");
  assert.equal(parseSelectionNumber("2,75"), 2.75);
  assert.equal(parseSelectionNumber("2.75"), 2.75);
  assert(Number.isNaN(parseSelectionNumber("2,7.5")));
  assert(Number.isNaN(parseSelectionNumber("2x")));
  assert.equal(stepSelectionNumber(2.75, 1), 2.85);
  assert(commonSelectionSizing([
    { shape: "hole", values: { diameter: 4 } }, { shape: "hole", values: { diameter: 4 } },
  ]));
  assert.equal(commonSelectionSizing([
    { shape: "hole", values: { diameter: 4 } }, { shape: "hole", values: { diameter: 6 } },
  ]), null);
  assert.equal(commonSelectionSizing([
    { shape: "racetrack", values: { length: 24, radius: 2 } },
    { shape: "racetrack", values: { length: 24, radius: 3 } },
  ]), null);

  const line = (x1, y1, x2, y2) => `0\nLINE\n8\nOUTER\n10\n${x1}\n20\n${y1}\n11\n${x2}\n21\n${y2}\n`;
  const circle = (x, y, r) => `0\nCIRCLE\n8\nHOLES\n10\n${x}\n20\n${y}\n40\n${r}\n`;
  const slot = (x1, x2, y) => `0\nLWPOLYLINE\n8\nSLOTS\n90\n4\n70\n1\n`
    + [[x1, y - 2, 0], [x2, y - 2, 1], [x2, y + 2, 0], [x1, y + 2, 1]]
      .map(([x, yy, bulge]) => `10\n${x}\n20\n${yy}\n42\n${bulge}\n`).join("");
  const drawing = path.join(root, "same-size.dxf");
  fs.writeFileSync(drawing, `0\nSECTION\n2\nENTITIES\n${line(0, 0, 200, 0)}${line(200, 0, 200, 100)}`
    + `${line(200, 100, 0, 100)}${line(0, 100, 0, 0)}`
    + `${circle(20, 20, 2)}${circle(60, 20, 2)}${circle(100, 20, 3)}`
    + `${slot(20, 40, 60)}${slot(80, 100, 60)}0\nENDSEC\n0\nEOF\n`);

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
  const set = await main.exports.__test.fileSetForFile(drawing, "dxf");
  const win = main.exports.__test.createDxfWindow(set);
  win.webContents.setBackgroundThrottling(false);
  await new Promise(resolve => win.webContents.once("did-finish-load", resolve));
  const evaluate = code => win.webContents.executeJavaScript(code);
  await wait(() => evaluate("document.querySelectorAll('.feature-item.internal').length === 5"), "five internal features");
  const select = (kind, first, second) => evaluate(`(() => {
    const items=[...document.querySelectorAll('.feature-item.internal')]
      .filter(item=>item.querySelector('.feature-title').textContent===${JSON.stringify(kind)});
    items[${first}].click();
    items[${second}].dispatchEvent(new MouseEvent('click',{bubbles:true,ctrlKey:true}));
    return items.length;
  })()`);
  const row = label => `(() => [...document.querySelectorAll('.selection-row')]
    .find(row=>row.firstElementChild?.textContent===${JSON.stringify(label + ":")})`;
  assert.equal(await select("Hole", 0, 1), 3);
  assert.equal(await evaluate(`${row("Diameter")}
    ?.querySelector('input')?.value || null)()`), "4");
  await evaluate(`${row("Diameter")}
    ?.querySelector('input').focus())()`);
  await evaluate("document.activeElement.select(); true");
  await win.webContents.insertText("5,5");
  assert.equal(await evaluate("document.activeElement.value"), "5,5");
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{key:'f',bubbles:true})); true");
  assert.equal(await evaluate("document.activeElement.value"), "5,5");
  await evaluate("window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); true");
  assert.equal(await evaluate("document.querySelectorAll('.feature-item.selected').length"), 2);
  await evaluate(`${row("Diameter")}
    ?.querySelector(':scope > button').click())()`);
  await wait(() => evaluate("document.querySelector('#dirtyState').textContent === 'Unsaved changes'"), "hole edit dirty");
  assert.equal(await evaluate(`${row("Diameter")}
    ?.querySelector('input')?.value || null)()`), "5.5");
  const radii = () => [...fs.readFileSync(drawing, "utf8").replaceAll("\r", "").matchAll(/\n0\nCIRCLE\n(?:[^]*?)\n40\n([-+0-9.eE]+)/g)]
    .map(match => Number(match[1]));
  await evaluate("document.getElementById('saveBtn').click(); true");
  await wait(() => radii().filter(radius => Math.abs(radius - 2.75) < 1e-8).length === 2, "both holes saved");
  assert.deepEqual(radii().sort((a, b) => a - b), [2.75, 2.75, 3]);
  assert.equal(await select("Hole", 0, 2), 3);
  assert.equal(await evaluate(`${row("Diameter")}
    ?.querySelector('input')?.value || null)()`), null, "unequal holes must not get a shared target");

  assert.equal(await select("Racetrack", 0, 1), 2);
  assert.equal(await evaluate(`${row("Radius")}
    ?.querySelector('input')?.value || null)()`), "2");
  await evaluate(`${row("Radius")}
    ?.querySelector('input').focus())()`);
  await evaluate("document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true})); true");
  assert.equal(await evaluate("document.activeElement.value"), "2.1");
  await evaluate(`${row("Radius")}
    ?.querySelector(':scope > button').click())()`);
  await wait(() => evaluate(`${row("Radius")}
    ?.querySelector('input')?.value === '2.1')()`), "both racetracks resized");
  assert.equal(await evaluate("document.querySelectorAll('.feature-item.selected').length"), 2);
  await evaluate("document.getElementById('saveBtn').click(); true");
  await wait(() => evaluate("document.querySelector('#dirtyState').textContent === 'Clean'"), "racetracks saved");
  const saved = fs.readFileSync(drawing, "utf8").replaceAll("\r", "");
  assert.equal((saved.match(/\n0\nLWPOLYLINE\n/g) || []).length, 2);
  assert.equal((saved.match(/\n42\n1(?:\.0+)?\n/g) || []).length, 4, "semicircle bulges preserved");
  console.log(JSON.stringify({ typedComma: true, arrowIncrement: true, sameSizeHoles: true,
    unequalSizeHidden: true, polylineRacetracks: true, saved: true, root }));
  app.exit(0);
}
