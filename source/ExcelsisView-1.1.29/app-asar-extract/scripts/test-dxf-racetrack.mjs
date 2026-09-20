import assert from "node:assert/strict";
import fs from "node:fs";
import { planRacetrack } from "../modules/dxf/racetrack.mjs";
import { bulgeArcGeometry } from "../modules/dxf/geometry-utils.mjs";

const near = (actual, expected, tolerance = 1e-8) => assert(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
const pointNear = (actual, expected) => { near(actual.x, expected.x); near(actual.y, expected.y); };
function area(plan) {
  let result = 0;
  plan.points.forEach((a, i) => {
    const b = plan.points[(i + 1) % 4];
    result += (a.x * b.y - b.x * a.y) / 2;
    const arc = bulgeArcGeometry(a, b, a.bulge);
    if (arc) result += arc.r ** 2 * (arc.sweep - Math.sin(arc.sweep)) / 2;
  });
  return Math.abs(result);
}
let cases = 0;
for (const [a, b] of [
  [{ x: 0, y: 0 }, { x: 20, y: 0 }],
  [{ x: 20, y: 0 }, { x: 0, y: 0 }],
  [{ x: 5, y: -9 }, { x: 5, y: 17 }],
  [{ x: -6, y: 8 }, { x: 10, y: -4 }],
]) {
  const before = JSON.stringify([a, b]);
  const distance = Math.hypot(b.x - a.x, b.y - a.y);
  for (const width of [0.25, 4, 15]) {
    for (const side of ["left", "right"]) {
      for (const radius of [distance / 2, distance, distance * 3]) {
        const plan = planRacetrack(a, b, { kind: "curved", width, curveRadius: radius, side });
        const arcs = plan.points.map((p, i) => bulgeArcGeometry(p, plan.points[(i + 1) % 4], p.bulge));
        assert.equal(plan.closed, true);
        assert.equal(plan.points.length, 4);
        near(arcs[0].r, radius + width / 2);
        near(arcs[2].r, radius - width / 2);
        near(arcs[1].r, width / 2);
        near(arcs[3].r, width / 2);
        pointNear({ x: arcs[0].cx, y: arcs[0].cy }, plan.center);
        pointNear({ x: arcs[2].cx, y: arcs[2].cy }, plan.center);
        pointNear({ x: arcs[1].cx, y: arcs[1].cy }, b);
        pointNear({ x: arcs[3].cx, y: arcs[3].cy }, a);
        // Every join has equal oriented tangents, including the closing cap.
        for (let i = 0; i < 4; i += 1) {
          const end = arcs[i].start + arcs[i].sweep;
          const next = arcs[(i + 1) % 4];
          const tangent = { x: -Math.sin(end) * Math.sign(arcs[i].sweep), y: Math.cos(end) * Math.sign(arcs[i].sweep) };
          pointNear(tangent, { x: -Math.sin(next.start) * Math.sign(next.sweep), y: Math.cos(next.start) * Math.sign(next.sweep) });
        }
        near(area(plan), width * radius * Math.abs(plan.sweep) + Math.PI * (width / 2) ** 2);
        const midAngle = arcs[0].start + arcs[0].sweep / 2;
        const mid = { x: plan.center.x + radius * Math.cos(midAngle), y: plan.center.y + radius * Math.sin(midAngle) };
        const cross = (b.x - a.x) * (mid.y - a.y) - (b.y - a.y) * (mid.x - a.x);
        assert.equal(Math.sign(cross), side === "left" ? 1 : -1);
        cases += 1;
      }
    }
    const straight = planRacetrack(a, b, { width });
    const endB = bulgeArcGeometry(straight.points[1], straight.points[2], 1);
    const endA = bulgeArcGeometry(straight.points[3], straight.points[0], 1);
    pointNear({ x: endA.cx, y: endA.cy }, a);
    pointNear({ x: endB.cx, y: endB.cy }, b);
    near(area(straight), width * distance + Math.PI * (width / 2) ** 2);
    cases += 1;
  }
  assert.equal(JSON.stringify([a, b]), before, "The planner must not mutate picked source geometry.");
}
const a = { x: 0, y: 0 }, b = { x: 20, y: 0 };
for (const bad of [0, -1, NaN, Infinity]) assert.throws(() => planRacetrack(a, b, { width: bad }));
assert.throws(() => planRacetrack(a, a, { width: 2 }), /different/);
assert.throws(() => planRacetrack(a, { x: NaN, y: 2 }, { width: 2 }), /finite/);
assert.throws(() => planRacetrack(a, b, { kind: "curved", width: 2, curveRadius: 9.999 }), /half/);
assert.throws(() => planRacetrack(a, b, { kind: "curved", width: 20, curveRadius: 10 }), /larger/);
assert.throws(() => planRacetrack(a, b, { kind: "curved", width: 2, curveRadius: 1e20 }), /too large/);
assert.throws(() => planRacetrack(a, b, { kind: "unknown", width: 2 }), /straight or curved/);
assert.throws(() => planRacetrack(a, b, { kind: "curved", width: 2, curveRadius: 20, side: "up" }), /left or right/);
const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");
const html = read("modules/dxf/index.html");
const app = read("modules/dxf/app.js");
const dialog = read("modules/dxf/racetrack-dialog.mjs");
for (const id of ["racetrackBtn", "racetrackDialog", "racetrackKind", "racetrackWidth", "racetrackEndRadius", "racetrackCurveRadius", "racetrackSide", "racetrackApplyBtn", "racetrackCancelBtn"]) assert(html.includes(`id="${id}"`));
assert.match(dialog, /curveRadius: Number\(curveRadius.value\)/);
assert.match(dialog, /Number\(endRadius.value\) \* 2/);
assert.match(dialog, /Number\(width.value\) \/ 2/);
assert.match(app, /pushUndoSnapshot\(\);\s*state.doc.entities.push\(entity\)/);
assert.match(app, /state.doc !== originalDoc \|\| state.readOnly/);
assert.match(app, /if \(state.racetrackBusy\) return;/);
assert.match(app, /racetrackGenerated \? \(value\) => String\(value\)/);
console.log(JSON.stringify({ racetrackGeometryCases: cases, exactArcTangency: true, independentRadii: true, invalidInputsRejected: true, uiWired: true }));
