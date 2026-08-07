import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
const html = read("modules/dxf/index.html");
const styles = read("modules/dxf/styles.css");
const application = read("modules/dxf/app.js");
const preload = read("preload.cjs");
const main = read("main.cjs");

for (const id of ["saveBtn", "saveMenuBtn", "saveMenu", "saveAsBtn", "rotateBtn"]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `DXF split-save UI omits #${id}.`);
}
assert.match(html, /id=["']saveMenu["'][^>]*role=["']menu["'][^>]*hidden/i);
assert.match(styles, /\.save-split\s*\{[\s\S]{0,250}position:\s*relative/);
assert.match(styles, /\.save-menu-toggle\s*\{[\s\S]{0,180}width:\s*24px/);
assert.match(application, /saveAsBtn\.addEventListener\(["']click["'],\s*saveFileAs\)/);
assert.match(application, /desktopApi\?\.saveAs/);
assert.match(preload, /saveAs:\s*\(filePath,\s*text\)\s*=>\s*ipcRenderer\.invoke\(["']fs:save-dxf-as["']/);
assert.match(main, /handleTrusted\(["']fs:save-dxf-as["'],\s*\[["']dxf["']\]/);
assert.match(main, /title:\s*["']Save DXF as["'][\s\S]{0,260}extensions:\s*\[["']dxf["']\]/);
assert.match(main, /existingOwner[\s\S]{0,180}open in another ExcelsisView window/);
assert.match(
  main,
  /fs:save-dxf-as[\s\S]{0,1800}broadcastFileSaved\(outputPath,\s*event\.sender\.id\)/,
  "Save As must notify other windows if it overwrites an already-open DXF.",
);

assert.match(html, /id=["']cleanupRelaxedToggle["'][^>]*type=["']checkbox["']/i);
assert.match(html, /Less-safe mode:\s*include complex bridged outer networks/i);
assert.match(
  application,
  /maxOffsetWidth:\s*2,[\s\S]{0,100}relaxed,/,
  "The cleanup worker request must carry the explicit relaxed-mode choice.",
);
assert.match(
  application,
  /decision\s*===\s*["']reanalyze["']/,
  "Changing cleanup safety mode must rerun analysis rather than applying stale results.",
);
assert.match(
  application,
  /function planUniformOffset[\s\S]{0,700}planAxisOffset\(feature,\s*delta,\s*delta\)/,
  "Uniform offset must reuse the exact equal-X/Y directional transform for unrecognized straight contours.",
);
assert.match(
  application,
  /function applySelectionOffset\(delta\)[\s\S]{0,180}Math\.abs\(delta\)\s*<=\s*Number\.EPSILON/,
  "A zero uniform offset must be a no-op.",
);
assert.match(
  application,
  /function rotateCurrentDrawing\(\)[\s\S]{0,1800}drawingBodyBoxForRotation\(\)[\s\S]{0,1800}CLOCKWISE_QUARTER_TURN_DEGREES/,
  "DXF rotation must use a body-centered clockwise transform.",
);
assert.match(
  application,
  /type === "TEXT" \|\| e\.type === "MTEXT"[\s\S]{0,900}setOrAppendValue\(pairs, "50"/,
  "Rotated DXF text positions and angles must be serialized.",
);
assert.match(
  application,
  /type === "INSERT" && e\.insertTransform[\s\S]{0,500}insertTransform\.rotRad/,
  "Rotated block INSERT transforms must be serialized.",
);
assert.match(
  application,
  /state\.readOnlyReason === "dwg-conversion"[\s\S]{0,1200}Save As to write the rotated drawing as DXF/,
  "Converted DWGs must allow rotation while keeping the original DWG unchanged.",
);

console.log(JSON.stringify({
  splitSaveMenu: true,
  dxfOnlySaveDialog: true,
  relaxedCleanupToggle: true,
  savedBodyCenteredRotation: true,
}));
