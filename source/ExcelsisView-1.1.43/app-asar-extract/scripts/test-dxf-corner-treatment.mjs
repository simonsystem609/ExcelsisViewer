import assert from "node:assert/strict";
import {
  cornerTreatmentLimit,
  linePairCornerTarget,
  planLinePairTreatment,
  planPolylineCornerTreatment,
  polylineCornerTarget,
} from "../modules/dxf/corner-treatment.mjs";

const EPSILON = 1e-8;

const near = (actual, expected, epsilon = EPSILON) => {
  assert(Math.abs(actual - expected) <= epsilon, `${actual} is not within ${epsilon} of ${expected}`);
};

const pointNear = (actual, expected, epsilon = EPSILON) => {
  near(actual.x, expected.x, epsilon);
  near(actual.y, expected.y, epsilon);
};

const lineA = { id: 1, type: "LINE", x1: 10, y1: 0, x2: 0, y2: 0 };
const lineB = { id: 2, type: "LINE", x1: 0, y1: 0, x2: 0, y2: 8 };
const originalLineA = structuredClone(lineA);
const originalLineB = structuredClone(lineB);
const lineTarget = linePairCornerTarget(lineA, lineB);
pointNear(lineTarget.corner, { x: 0, y: 0 });
assert.equal(lineTarget.lineAEndpoint, "end");
assert.equal(lineTarget.lineBEndpoint, "start");
near(lineTarget.angleRadians, Math.PI / 2);
near(cornerTreatmentLimit(lineTarget, "chamfer"), 8);
near(cornerTreatmentLimit(lineTarget, "fillet"), 8);

const chamfer = planLinePairTreatment(lineA, lineB, { kind: "chamfer", size: 2 });
assert.equal(chamfer.connector.type, "LINE");
pointNear(chamfer.tangentA, { x: 2, y: 0 });
pointNear(chamfer.tangentB, { x: 0, y: 2 });
assert.deepEqual(chamfer.lineUpdates[0], { id: 1, x1: 10, y1: 0, x2: 2, y2: 0 });
assert.deepEqual(chamfer.lineUpdates[1], { id: 2, x1: 0, y1: 2, x2: 0, y2: 8 });
assert.deepEqual(lineA, originalLineA, "Planning must not mutate the first source line.");
assert.deepEqual(lineB, originalLineB, "Planning must not mutate the second source line.");

const fillet = planLinePairTreatment(lineA, lineB, { kind: "fillet", size: 2 });
assert.equal(fillet.connector.type, "ARC");
pointNear(fillet.center, { x: 2, y: 2 });
pointNear(fillet.tangentA, { x: 2, y: 0 });
pointNear(fillet.tangentB, { x: 0, y: 2 });
near(fillet.connector.r, 2);
near(((fillet.connector.a2 - fillet.connector.a1 + 360) % 360), 90);

const sixtyDegrees = {
  id: 3,
  type: "LINE",
  x1: 0,
  y1: 0,
  x2: 10 * Math.cos(Math.PI / 3),
  y2: 10 * Math.sin(Math.PI / 3),
};
const sixtyFillet = planLinePairTreatment(
  { id: 4, type: "LINE", x1: 0, y1: 0, x2: 10, y2: 0 },
  sixtyDegrees,
  { kind: "fillet", size: 1 },
);
near(sixtyFillet.setback, 1 / Math.tan(Math.PI / 6));
near(Math.hypot(sixtyFillet.center.x, sixtyFillet.center.y), 2);
near(((sixtyFillet.connector.a2 - sixtyFillet.connector.a1 + 360) % 360), 120);

assert.throws(
  () => planLinePairTreatment(lineA, lineB, { kind: "chamfer", size: 8 }),
  /too large.*below 8 mm/i,
);
assert.throws(
  () => linePairCornerTarget(
    { id: 5, type: "LINE", x1: -10, y1: 0, x2: 10, y2: 0 },
    { id: 6, type: "LINE", x1: 0, y1: -10, x2: 0, y2: 10 },
  ),
  /must meet at.*one endpoint/i,
);
assert.throws(
  () => linePairCornerTarget(
    { id: 7, type: "LINE", x1: 0, y1: 0, x2: 10, y2: 0 },
    { id: 8, type: "LINE", x1: 0, y1: 1, x2: 10, y2: 1 },
  ),
  /parallel or collinear/i,
);

const openPolyline = {
  id: 9,
  type: "LWPOLYLINE",
  closed: false,
  points: [
    { x: 0, y: 8, bulge: 0 },
    { x: 0, y: 0, bulge: 0 },
    { x: 10, y: 0, bulge: 0 },
  ],
};
const originalOpenPolyline = structuredClone(openPolyline);
const openTarget = polylineCornerTarget(openPolyline, 1);
near(openTarget.angleRadians, Math.PI / 2);
const polylineChamfer = planPolylineCornerTreatment(openPolyline, 1, { kind: "chamfer", size: 2 });
assert.deepEqual(polylineChamfer.points, [
  { x: 0, y: 8, bulge: 0 },
  { x: 0, y: 2, bulge: 0 },
  { x: 2, y: 0, bulge: 0 },
  { x: 10, y: 0, bulge: 0 },
]);
assert.deepEqual(openPolyline, originalOpenPolyline, "Planning must not mutate the source polyline.");
assert.throws(() => polylineCornerTarget(openPolyline, 0), /internal vertex/i);

const closedCounterClockwise = {
  id: 10,
  type: "LWPOLYLINE",
  closed: true,
  points: [
    { x: 0, y: 0, bulge: 0 },
    { x: 10, y: 0, bulge: 0 },
    { x: 10, y: 10, bulge: 0 },
    { x: 0, y: 10, bulge: 0 },
  ],
};
const ccwFillet = planPolylineCornerTreatment(closedCounterClockwise, 0, { kind: "fillet", size: 1 });
assert.equal(ccwFillet.points.length, 5);
pointNear(ccwFillet.points[0], { x: 0, y: 1 });
pointNear(ccwFillet.points[1], { x: 1, y: 0 });
near(ccwFillet.points[0].bulge, Math.tan(Math.PI / 8));
near(ccwFillet.points[1].bulge, 0);

const closedClockwise = {
  ...closedCounterClockwise,
  id: 11,
  points: [
    { x: 0, y: 0, bulge: 0 },
    { x: 0, y: 10, bulge: 0 },
    { x: 10, y: 10, bulge: 0 },
    { x: 10, y: 0, bulge: 0 },
  ],
};
const cwFillet = planPolylineCornerTreatment(closedClockwise, 0, { kind: "fillet", size: 1 });
assert(cwFillet.points[0].bulge < 0, "Clockwise polyline traversal needs a negative fillet bulge.");
near(Math.abs(cwFillet.points[0].bulge), Math.tan(Math.PI / 8));

const bulgedPolyline = structuredClone(openPolyline);
bulgedPolyline.points[0].bulge = 0.2;
assert.throws(() => polylineCornerTarget(bulgedPolyline, 1), /must be straight/i);
assert.throws(
  () => planPolylineCornerTreatment(openPolyline, 1, { kind: "fillet", size: 20 }),
  /too large/i,
);

console.log(JSON.stringify({
  connectedLinePair: true,
  chamferSetback: true,
  tangentFillet: true,
  polylineVertex: true,
  signedPolylineBulge: true,
  oversizedAndAmbiguousRejected: true,
}));
