// Isolated, offscreen Electron regression test. Synthetic data only.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const project = path.resolve(__dirname, "..");
if (!process.versions.electron) {
  const env = { ...process.env };
  env.EXCELSIS_NAV_TEST_DPR = process.argv.includes("--dpr2") ? "2" : "1";
  delete env.ELECTRON_RUN_AS_NODE; delete env.NODE_OPTIONS;
  const child = require("node:child_process").spawn(require("electron"),
    [__filename, ...process.argv.slice(2)], { cwd: project, windowsHide: true, stdio: "inherit", env });
  child.on("exit", code => { process.exitCode = code ?? 1; });
} else {
  run().catch(error => { console.error(error); require("electron").app.exit(1); });
}

async function run() {
  const { app, BrowserWindow } = require("electron");
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "excelsis-nav-render-"));
  app.setPath("appData", path.join(root, "profile"));
  app.setAppPath(project);
  const watchdog = setTimeout(() => { console.error("Navigation test timed out"); app.exit(2); }, 60000);
  const line = (a, b, c, d) => `0\nLINE\n8\nOUTLINE\n10\n${a}\n20\n${b}\n11\n${c}\n21\n${d}\n`;
  const circle = (x, y) => `0\nCIRCLE\n8\nHOLES\n10\n${x}\n20\n${y}\n40\n4\n`;
  const drawing = path.join(root, "navigation.dxf");
  let entities = line(0, 0, 500, 0) + line(500, 0, 500, 350) + line(500, 350, 0, 350) + line(0, 350, 0, 0);
  for (let x = 25; x < 500; x += 25) for (let y = 25; y < 350; y += 25) entities += circle(x, y);
  entities += "0\nARC\n8\nARCS\n10\n250\n20\n175\n40\n80\n50\n20\n51\n270\n";
  entities += "0\nLWPOLYLINE\n8\nSLOTS\n90\n4\n70\n1\n10\n210\n20\n100\n42\n0\n10\n260\n20\n100\n42\n1\n10\n260\n20\n110\n42\n0\n10\n210\n20\n110\n42\n1\n";
  entities += "0\nTEXT\n8\nLABELS\n10\n140\n20\n175\n40\n8\n1\nNavigation test\n";
  fs.writeFileSync(drawing, `0\nSECTION\n2\nENTITIES\n${entities}0\nENDSEC\n0\nEOF\n`);
  const footer = `
    globalThis.__navigationTest = { state, canvas, ctx, renderCanvasNow, buildFeatures,
      fitView, nearestSnap, worldToScreen, activity: navigationActivity,
      layer: () => drawingLayerCache, revision: () => geometryRevision,
      cache: geometryPathsForCurrentRevision,
      reference: () => {
        const cached = drawCachedDrawingLayer;
        drawCachedDrawingLayer = () => false;
        try { renderCanvasNow(); } finally { drawCachedDrawingLayer = cached; }
      }
    };
  `;
  const Module = require("node:module");
  const main = new Module(path.join(project, "main.cjs"), module);
  main.filename = path.join(project, "main.cjs"); main.paths = Module._nodeModulePaths(project);
  let source = fs.readFileSync(main.filename, "utf8");
  assert(source.includes("const body = await fs.readFile(requestedPath);"));
  source = source.replaceAll("new BrowserWindow({", "new BrowserWindow({ show: false,")
    .replaceAll("webPreferences: {", "webPreferences: { offscreen: true,")
    .replace("const body = await fs.readFile(requestedPath);", `let body = await fs.readFile(requestedPath);
      if (requestedPath === ${JSON.stringify(path.join(project, "modules/dxf/app.js"))})
        body = Buffer.concat([body, Buffer.from(${JSON.stringify(footer)})]);`)
    .replace('"Content-Length": String(stat.size)', '"Content-Length": String(body.length)');
  main._compile(source + "\nmodule.exports.__test = { createDxfWindow, fileSetForFile };\n", main.filename);
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const wait = async (predicate, label) => {
    for (const deadline = Date.now() + 20000; Date.now() < deadline;) {
      if (await predicate()) return;
      await delay(30);
    }
    throw new Error(`Timed out: ${label}`);
  };
  await app.whenReady();
  await wait(() => BrowserWindow.getAllWindows().length, "launcher");
  for (const win of BrowserWindow.getAllWindows()) win.hide();
  const win = main.exports.__test.createDxfWindow(await main.exports.__test.fileSetForFile(drawing, "dxf"));
  win.setContentSize(1240, 840);
  win.webContents.setFrameRate(60);
  win.webContents.setBackgroundThrottling(false);
  win.webContents.on("paint", () => {});
  const errors = [];
  const warnings = [];
  win.webContents.on("console-message", (event) => {
    if (event.level === "error") errors.push(event.message);
    if (event.level === "warning") warnings.push(event.message);
  });
  const evaluate = async code => {
    const result = await win.webContents.executeJavaScript(`(async () => {
      try { return { ok: true, value: await (${code}) }; }
      catch (error) { return { ok: false, message: error.message, stack: error.stack }; }
    })()`);
    assert(result.ok, `Renderer evaluation failed: ${result.message}\n${result.stack}\nExpression: ${code}\nEvidence: ${root}`);
    return result.value;
  };
  await wait(() => evaluate("!!globalThis.__navigationTest?.layer()"), "full-resolution drawing");
  // Offscreen windows may ignore the OS device-scale switch. Page zoom
  // exercises the same effective devicePixelRatio without changing Windows.
  const desiredDpr = Number(process.env.EXCELSIS_NAV_TEST_DPR || 1);
  const zoomFactor = desiredDpr / await evaluate("devicePixelRatio");
  win.webContents.setZoomFactor(zoomFactor);
  win.setContentSize(Math.round(1240 * zoomFactor), Math.round(840 * zoomFactor));
  const viewportReady = () => evaluate(`(() => {
    const p=__navigationTest, r=p.canvas.getBoundingClientRect(), layer=p.layer();
    return devicePixelRatio===${desiredDpr}&&innerWidth===1240&&innerHeight===840&&
      layer?.dpr===devicePixelRatio&&!layer.preview&&
      layer.screenWidth===r.width&&layer.screenHeight===r.height&&
      p.canvas.width===Math.floor(r.width*devicePixelRatio)&&
      p.canvas.height===Math.floor(r.height*devicePixelRatio);
  })()`);
  // Zoom can render at the new DPR before the following native-window resize
  // arrives. Both dimensions and backing-store size must be ready before we
  // save the layer whose identity the navigation assertions compare.
  await wait(viewportReady, "effective test DPR and complete viewport resize");
  await evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))))");
  await wait(viewportReady, "settled high-DPI viewport");
  const pan = (type, dx = 0) => evaluate(`(() => {
    const p=globalThis.__navigationTest, r=p.canvas.getBoundingClientRect();
    p.canvas.dispatchEvent(new MouseEvent(${JSON.stringify(type)}, {button:1,buttons:${type === "mouseup" ? 0 : 4},
      clientX:r.left+r.width/2+${dx},clientY:r.top+r.height/2,bubbles:true,cancelable:true}));
    p.renderCanvasNow(); return true;
  })()`);
  const initial = await evaluate(`(() => {
    const p=globalThis.__navigationTest;
    p.beforeDoc=JSON.stringify(p.state.doc); p.firstLayer=p.layer(); p.initialView={...p.state.view};
    return {resolution:p.layer().resolution,dpr:devicePixelRatio,revision:p.revision(),
      viewport:{width:innerWidth,height:innerHeight},
      layer:{width:p.layer().screenWidth,height:p.layer().screenHeight,padding:p.layer().padding,
        view:{...p.layer().view},overlays:p.layer().overlays}};
  })()`);
  assert.equal(initial.resolution, initial.dpr);
  assert.equal(initial.dpr, Number(process.env.EXCELSIS_NAV_TEST_DPR || 1), "The high-DPI test must actually use the requested DPR");
  await pan("mousedown"); await pan("mousemove", 20);
  assert.equal(await evaluate("__navigationTest.activity.active"), true);
  const smallPan = await evaluate(`(() => {
    const p=__navigationTest, layer=p.layer();
    return {reused:layer===p.firstLayer,viewport:{width:innerWidth,height:innerHeight},
      layer:{width:layer.screenWidth,height:layer.screenHeight,padding:layer.padding,
        view:{...layer.view},overlays:layer.overlays,preview:layer.preview},view:{...p.state.view}};
  })()`);
  assert.equal(smallPan.reused, true, `Small pan reuses the geometry bitmap: ${JSON.stringify({initial,smallPan,evidence:root})}`);
  await pan("mousemove", 950);
  assert.equal(await evaluate("__navigationTest.layer().preview"), true, "Large pan refills the preview instead of showing an empty edge");
  assert(await evaluate("__navigationTest.layer().resolution<=0.65"));
  await pan("mouseup", 950);
  await wait(() => evaluate("!__navigationTest.layer().preview"), "mouse-up native detail");
  assert.equal(await evaluate("__navigationTest.layer().resolution"), initial.dpr);
  const wheelAnchor = await evaluate(`(() => {
    const p=__navigationTest; p.fitView(); p.renderCanvasNow();
    // Synthetic WheelEvent coordinates are integer CSS pixels. Derive the
    // reference point from those same pixels, not a pre-rounded fraction.
    const r=p.canvas.getBoundingClientRect(), x=Math.round(r.width*.6), y=Math.round(r.height*.4);
    const point={x:(x-p.state.view.ox)/p.state.view.scale,y:(p.state.view.oy-y)/p.state.view.scale};
    for(let i=0;i<5;i++)p.canvas.dispatchEvent(new WheelEvent('wheel',
      {deltaY:-100,clientX:r.left+x,clientY:r.top+y,bubbles:true,cancelable:true}));
    p.renderCanvasNow(); const mapped=p.worldToScreen(point);
    return Math.hypot(mapped.x-x,mapped.y-y);
  })()`);
  assert(wheelAnchor < 1e-7, `Wheel still anchors the exact world point under the cursor: drift=${wheelAnchor}`);
  assert.equal(await evaluate("__navigationTest.activity.active"), true);
  await wait(() => evaluate("!__navigationTest.activity.active&&!__navigationTest.layer().preview"), "wheel quiet restore");
  assert.equal(await evaluate("JSON.stringify(__navigationTest.state.doc)===__navigationTest.beforeDoc"), true, "Navigation never changes document geometry/source");
  const pixels = await evaluate(`(() => {
    const p=__navigationTest;
    const circle=p.state.doc.entities.find(e=>e.type==='CIRCLE');
    p.state.selectedEntityIds.add(circle.id); p.renderCanvasNow();
    const cached=p.ctx.getImageData(0,0,p.canvas.width,p.canvas.height).data;
    p.reference();
    const direct=p.ctx.getImageData(0,0,p.canvas.width,p.canvas.height).data;
    let changed=0;
    for(let i=0;i<cached.length;i+=4)if(Math.max(Math.abs(cached[i]-direct[i]),Math.abs(cached[i+1]-direct[i+1]),Math.abs(cached[i+2]-direct[i+2]))>4)changed++;
    p.renderCanvasNow();
    return {changed,total:cached.length/4,overlays:p.layer().overlays};
  })()`);
  assert(pixels.changed / pixels.total < 0.015, `Restored image must match native vector detail: ${JSON.stringify(pixels)}`);
  const edit = await evaluate(`(() => {
    const p=__navigationTest, old=p.layer(), circle=p.state.doc.entities.find(e=>e.type==='CIRCLE');
    circle.r=5; p.buildFeatures(); p.renderCanvasNow();
    const snap=p.nearestSnap(p.worldToScreen({x:circle.cx,y:circle.cy}));
    return {replaced:p.layer()!==old,revision:p.revision(),radius:circle.r,snap:!!snap};
  })()`);
  assert(edit.replaced && edit.revision > initial.revision && edit.radius === 5 && edit.snap);
  await evaluate("(() => { __navigationTest.beforeResize=__navigationTest.layer(); return true; })()");
  win.setContentSize(Math.round(1050 * zoomFactor), Math.round(780 * zoomFactor));
  await wait(() => evaluate(`(() => {
    const p=__navigationTest, r=p.canvas.getBoundingClientRect(), layer=p.layer();
    // Resize invalidates the layer before its scheduled animation-frame render.
    // Poll through that expected null interval, then require full native detail.
    return innerWidth===1050&&innerHeight===780&&layer&&layer!==p.beforeResize&&
      !layer.preview&&layer.dpr===devicePixelRatio&&
      layer.screenWidth===r.width&&layer.screenHeight===r.height&&
      p.canvas.width===Math.floor(r.width*devicePixelRatio)&&
      p.canvas.height===Math.floor(r.height*devicePixelRatio);
  })()`), "complete resized layer");
  await evaluate("(() => { __navigationTest.renderCanvasNow(); return true; })()");
  await evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))))");
  // Offscreen paint supplies the complete committed frame. Use that frame for
  // evidence rather than racing capturePage's separate Viz request after resize.
  const finalFrame = new Promise(resolve => win.webContents.once("paint", (_event, _rect, image) => resolve(image)));
  win.webContents.invalidate();
  const image = await finalFrame;
  assert(!image.isEmpty(), "The completed offscreen frame must contain image evidence");
  fs.writeFileSync(path.join(root, "restored.png"), image.toPNG());
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ bitmapReuse: true, largePanRefill: true, wheelAnchor: true,
    fullDetailRestored: true, sourceUnchanged: true, selectionPixelDifference: pixels.changed / pixels.total,
    editInvalidation: true, snapUnchanged: true, resize: true, dpr: initial.dpr,
    readbackWarningCount: warnings.filter(message => message.includes("willReadFrequently")).length, evidence: root }));
  clearTimeout(watchdog);
  app.exit(0);
}
