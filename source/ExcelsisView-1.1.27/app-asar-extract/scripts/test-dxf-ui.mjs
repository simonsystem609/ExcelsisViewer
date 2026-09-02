import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
const html = read("modules/dxf/index.html");
const styles = read("modules/dxf/styles.css");
const application = read("modules/dxf/app.js");
const axisScale = read("modules/dxf/axis-scale-utils.mjs");
const preload = read("preload.cjs");
const main = read("main.cjs");

for (const id of [
  "saveBtn", "saveMenuBtn", "saveMenu", "saveAsBtn",
  "rotateBtn", "rotateMenuBtn", "rotateMenu", "rotateDegreeBtn", "rotateLineBtn",
  "rotateDegreeDialog", "rotateDegreeInput",
]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `DXF split-save UI omits #${id}.`);
}
assert.match(html, /id=["']saveMenu["'][^>]*role=["']menu["'][^>]*hidden/i);
assert.match(html, /id=["']rotateMenu["'][^>]*role=["']menu["'][^>]*hidden/i);
assert.match(html, /id=["']rotateBtn["'][^>]*title=["'][^"']*90 degrees clockwise/i);
assert.match(styles, /\.save-split,[\s\S]{0,80}\.split-action\s*\{[\s\S]{0,250}position:\s*relative/);
assert.match(styles, /\.save-menu-toggle,[\s\S]{0,80}\.split-menu-toggle\s*\{[\s\S]{0,180}width:\s*24px/);
assert.match(
  styles,
  /\.toolbar\s*\{[\s\S]{0,420}overflow:\s*visible/,
  "The DXF toolbar must not use a horizontal scrollbar when the window narrows.",
);
assert.match(
  styles,
  /\.toolbar button,[\s\S]{0,100}\.toolbar \.mode-label\s*\{[\s\S]{0,100}white-space:\s*nowrap/,
  "DXF toolbar labels must remain on one line when the window narrows.",
);
assert.match(
  styles,
  /@media\s*\(max-width:\s*1400px\)[\s\S]{0,520}\.toolbar button\s*\{[\s\S]{0,100}padding-inline:\s*8px/,
  "The DXF toolbar must compact before its two-row layout is needed.",
);
assert.match(
  styles,
  /@media\s*\(max-width:\s*1320px\)[\s\S]{0,220}\.toolbar\s*\{[\s\S]{0,160}display:\s*grid[\s\S]{0,160}grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/,
  "The narrow DXF toolbar must switch to a deterministic two-column, two-row grid.",
);
assert.match(
  styles,
  /\.file-actions\s*\{[\s\S]{0,100}grid-column:\s*1[\s\S]{0,100}grid-row:\s*1/,
  "File actions must stay on the first responsive toolbar row.",
);
assert.match(
  styles,
  /\.mode-actions\s*\{[\s\S]{0,100}grid-column:\s*2[\s\S]{0,100}grid-row:\s*1/,
  "Mode actions must stay at the right of the first responsive toolbar row.",
);
assert.match(
  styles,
  /\.view-actions\s*\{[\s\S]{0,100}grid-column:\s*1\s*\/\s*-1[\s\S]{0,100}grid-row:\s*2/,
  "View and editing actions must occupy the second responsive toolbar row.",
);
assert.match(application, /saveAsBtn\.addEventListener\(["']click["'],\s*saveFileAs\)/);
assert.match(application, /rotateBtn\.addEventListener\(["']click["'],\s*rotateCurrentDrawing\)/);
assert.match(application, /rotateDegreeBtn\.addEventListener\(["']click["'],\s*rotateCurrentDrawingByDegree\)/);
assert.match(application, /rotateLineBtn\.addEventListener\(["']click["'],\s*rotateCurrentDrawingByLine\)/);
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
  /function rotateCurrentDrawingByAngle[\s\S]{0,1800}drawingBodyBoxForRotation\(\)[\s\S]{0,2200}rotateEntityInPlace\(entity, center, angleDegrees\)/,
  "DXF rotation must use a body-centered clockwise transform.",
);
assert.match(
  application,
  /function rotateCurrentDrawing\(\)\s*\{[\s\S]{0,160}CLOCKWISE_QUARTER_TURN_DEGREES/,
  "The main Rotate button must retain its regular 90-degree action.",
);
assert.match(
  application,
  /function nearestLineReference[\s\S]{0,900}lineReferencesForEntity/,
  "Rotate by line must hit-test raw lines and straight undissolved-polyline segments.",
);
assert.match(
  application,
  /function pickLineReference[\s\S]{0,900}restoreRotationInteraction\(interactionSnapshot\)/,
  "Temporary line picking must bypass and restore normal selection/measurement interaction.",
);
assert.match(
  application,
  /function pickLineReference[\s\S]{0,2600}addEventListener\("mousedown", blockPointer, true\)/,
  "Temporary line picking must capture canvas input before normal contour selection.",
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
assert.match(
  application,
  /scaleEntitiesByAxesInPlace\(entities,\s*\{ x: 0, y: 0 \},\s*scaleX,\s*scaleY,\s*axisAngleRadians\)/,
  "Whole-file X/Y scaling must use the conic-aware axis transform.",
);
assert.match(
  application,
  /axisScaleReplacementEntities[\s\S]{0,300}buildAxisScaleReplacementPairs\(e,\s*formatNumber\)/,
  "Non-uniformly scaled circular geometry must serialize as exact DXF ellipses.",
);
assert.match(axisScale, /export function buildAxisScaleReplacementPairs/);
assert.match(axisScale, /isUniformAxisScale|exactEllipseReplacements/);
assert.match(html, /id="scaleNonUniformToggle" type="checkbox"/);
assert.match(html, /Perpendicular to line \(%\)/);
assert.match(application, /Parallel to line: new length \(mm\)/);
assert.match(styles, /#scaleDialog \[hidden\][\s\S]{0,50}display: none !important/);
assert.match(application, /lineScaleOptions\(pickedLine\.reference/);
assert.doesNotMatch(
  application,
  /radiusScale\s*=\s*Math\.sqrt/,
  "The disconnected geometric-mean arc scaling path must not return.",
);

console.log(JSON.stringify({
  splitSaveMenu: true,
  responsiveToolbar: true,
  twoRowResponsiveToolbar: true,
  dxfOnlySaveDialog: true,
  relaxedCleanupToggle: true,
  savedBodyCenteredRotation: true,
  splitRotationMenu: true,
  arbitraryAndLineRotation: true,
  conicAwareAxisScaling: true,
  nonUniformToggle: true,
  lineRelativeScale: true,
}));
