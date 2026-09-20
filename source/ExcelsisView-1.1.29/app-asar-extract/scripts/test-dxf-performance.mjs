import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  activeDxfSpace,
  dxfEntitySpace,
  DXF_MODEL_SPACE,
  DXF_PAPER_SPACE,
} from "../modules/dxf/dxf-space.mjs";

const pair = (code, value) => ({ code: String(code), value: String(value) });
const modelHeader = [
  pair(0, "SECTION"), pair(2, "HEADER"),
  pair(9, "$TILEMODE"), pair(70, 1),
  pair(0, "ENDSEC"),
];
const paperHeader = modelHeader.map((item) => ({ ...item }));
paperHeader[3].value = "0";

assert.equal(activeDxfSpace(modelHeader), DXF_MODEL_SPACE);
assert.equal(activeDxfSpace(paperHeader), DXF_PAPER_SPACE);
assert.equal(activeDxfSpace([]), DXF_MODEL_SPACE);

const modelLine = [pair(0, "LINE"), pair(8, "0"), pair(10, 2), pair(20, 3)];
const paperLine = [pair(0, "LINE"), pair(67, 1), pair(8, "0"), pair(10, 2), pair(20, 3)];
assert.equal(dxfEntitySpace(modelLine, 0), DXF_MODEL_SPACE);
assert.equal(dxfEntitySpace(paperLine, 0), DXF_PAPER_SPACE);

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const application = fs.readFileSync(path.join(projectRoot, "modules", "dxf", "app.js"), "utf8");
// A paper-space INSERT can own ATTRIB records whose own group 67 is omitted.
// Filtering must advance through the complete 66=1 sequence so those labels
// cannot leak back into an active model-space view.
assert.match(application, /parentType === "INSERT"[\s\S]{0,220}readFirst\(parentPairs, "66"\) === "1"/);
assert.match(application, /type === "SEQEND"\) return after/);
assert.match(application, /dxfEntitySpace\(pairs, i, nextIndex\) !== visibleSpace/);
assert.match(application, /state\.lightweightFeatures = state\.readOnlyReason === "dwg-conversion"/);
assert.match(application, /function geometryPathsForCurrentRevision\(\)[\s\S]{0,1200}new Path2D\(\)/);
assert.match(application, /function nearestSnap\([\s\S]{0,700}nearbyFeatureIds/);
assert.doesNotMatch(
  application.match(/function nearestSnap\([\s\S]*?\n\}/)?.[0] || "",
  /for \(const f of state\.features\)/,
  "Pointer hover must not scan every feature in a large drawing.",
);
assert.match(application, /FEATURE_LIST_RENDER_LIMIT = 1000/);
assert.doesNotMatch(application, /rawValue|rawCode/);

console.log(JSON.stringify({
  activeSpaceFiltering: true,
  cachedPathRendering: true,
  localHoverCandidates: true,
  lightweightDwgContours: true,
}));
