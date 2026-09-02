import assert from "node:assert/strict";
import {
  angleOnCounterClockwiseArcDegrees,
  angleOnSignedSweepRadians,
  arcExtremaPoints,
  arcQuadrantPoints,
  axisOffsetDimensions,
  bulgeArcExtremaPoints,
  circleQuadrantPoints,
  scalePointByAxes,
  tangentPointsToCircle,
} from "../modules/dxf/geometry-utils.mjs";
import {
  rotateEntityInPlace,
  rotatePointAround,
} from "../modules/dxf/transform-utils.mjs";
import {
  clockwiseInputToDxfDegrees,
  lineReferencesForEntity,
  rotationDegreesToAlignXAxis,
} from "../modules/dxf/rotation-utils.mjs";

const leftArc = { cx: -15, cy: 0, r: 5.75, a1: 89.999, a2: 270.001 };
const rightArc = { cx: 15, cy: 0, r: 5.75, a1: 269.999, a2: 90.001 };
const slotPoints = [...arcExtremaPoints(leftArc), ...arcExtremaPoints(rightArc)];
const minX = Math.min(...slotPoints.map((point) => point.x));
const maxX = Math.max(...slotPoints.map((point) => point.x));
assert.equal(maxX - minX, 41.5, "analytic arc bounds must include exact side quadrants");
assert(arcQuadrantPoints(leftArc).some((point) => Math.abs(point.x + 20.75) < 1e-9));
assert(arcQuadrantPoints(rightArc).some((point) => Math.abs(point.x - 20.75) < 1e-9));

assert(angleOnCounterClockwiseArcDegrees(0, 270, 90), "wrapped DXF arc must include zero degrees");
assert(!angleOnCounterClockwiseArcDegrees(180, 270, 90), "wrapped DXF arc must exclude the opposite quadrant");
assert(angleOnSignedSweepRadians(-Math.PI / 2, 0, -Math.PI), "clockwise bulge sweep must include its midpoint");

const bulgePoints = bulgeArcExtremaPoints({ x: -5, y: 0 }, { x: 5, y: 0 }, 1);
assert(bulgePoints.some((point) => Math.abs(Math.abs(point.y) - 5) < 1e-9), "bulge bounds must include its exact quadrant");

const quadrants = circleQuadrantPoints({ cx: 4, cy: -2, r: 3 });
assert.deepEqual(
  quadrants.map((point) => [round(point.x), round(point.y)]),
  [[7, -2], [4, 1], [1, -2], [4, -5]],
);

const tangents = tangentPointsToCircle({ x: 2, y: 0 }, { cx: 0, cy: 0, r: 1 });
assert.equal(tangents.length, 2);
for (const point of tangents) {
  assert(Math.abs(point.x - 0.5) < 1e-9);
  assert(Math.abs(Math.abs(point.y) - Math.sqrt(3) / 2) < 1e-9);
}
assert.deepEqual(tangentPointsToCircle({ x: 0.5, y: 0 }, { cx: 0, cy: 0, r: 1 }), []);

for (const delta of [1, -1]) {
  const dimensions = axisOffsetDimensions(400, 90, delta, delta);
  assert.equal(dimensions.targetWidth, 400 + 2 * delta);
  assert.equal(dimensions.targetHeight, 90 + 2 * delta);
  assert(Math.abs(400 * dimensions.scaleX - dimensions.targetWidth) < 1e-9);
  assert(Math.abs(90 * dimensions.scaleY - dimensions.targetHeight) < 1e-9);
}
assert.deepEqual(
  axisOffsetDimensions(400, 90, 0, 1),
  {
    targetWidth: 400,
    targetHeight: 92,
    scaleX: 1,
    scaleY: 92 / 90,
  },
);
assert.equal(axisOffsetDimensions(400, 90, Number.NaN, 1), null);
assert.equal(axisOffsetDimensions(400, 90, -45, -45).targetHeight, 0);

const rotationCenter = { x: 50, y: 25 };
assert.deepEqual(
  roundedPoint(rotatePointAround({ x: 0, y: 0 }, rotationCenter, -90)),
  { x: 25, y: 75 },
  "clockwise view rotation must use the drawing center rather than the DXF origin",
);
const rotatedLine = { type: "LINE", x1: 0, y1: 0, x2: 100, y2: 0 };
assert(rotateEntityInPlace(rotatedLine, rotationCenter, -90));
assert.deepEqual(
  [roundedPoint({ x: rotatedLine.x1, y: rotatedLine.y1 }), roundedPoint({ x: rotatedLine.x2, y: rotatedLine.y2 })],
  [{ x: 25, y: 75 }, { x: 25, y: -25 }],
);
assert.equal(rotatedLine.modified, true);

const rotatedArc = { type: "ARC", cx: 75, cy: 25, r: 5, a1: 0, a2: 90 };
assert(rotateEntityInPlace(rotatedArc, rotationCenter, -90));
assert.deepEqual(roundedPoint({ x: rotatedArc.cx, y: rotatedArc.cy }), { x: 50, y: 0 });
assert.equal(rotatedArc.a1, 270);
assert.equal(rotatedArc.a2, 0);

const rotatedPolyline = {
  type: "LWPOLYLINE",
  points: [{ x: 0, y: 0, bulge: 0.5 }, { x: 100, y: 0, bulge: 0 }],
};
assert(rotateEntityInPlace(rotatedPolyline, rotationCenter, -90));
assert.equal(rotatedPolyline.points[0].bulge, 0.5, "rigid rotation must preserve polyline bulges");

const rotatedText = {
  type: "TEXT",
  x: 75,
  y: 25,
  rotation: 0,
  hasExplicitRotation: false,
  alignmentPoint: { x: 80, y: 25 },
};
assert(rotateEntityInPlace(rotatedText, rotationCenter, -90));
assert.deepEqual(roundedPoint(rotatedText), { x: 50, y: 0 });
assert.deepEqual(roundedPoint(rotatedText.alignmentPoint), { x: 50, y: -5 });
assert.equal(rotatedText.rotation, 270);
assert.equal(rotatedText.hasExplicitRotation, true);

const rotatedMText = {
  type: "MTEXT",
  x: 50,
  y: 25,
  rotation: 0,
  hasExplicitRotation: false,
  directionVector: { x: 1, y: 0 },
};
assert(rotateEntityInPlace(rotatedMText, rotationCenter, -90));
assert.deepEqual(roundedPoint(rotatedMText.directionVector), { x: 0, y: -1 });
assert.equal(rotatedMText.hasExplicitRotation, false, "MTEXT direction vectors must remain authoritative");

const rotatedInsert = {
  type: "INSERT",
  insertTransform: { tx: 75, ty: 25, rotRad: Math.PI / 6 },
};
assert(rotateEntityInPlace(rotatedInsert, rotationCenter, -90));
assert.deepEqual(
  roundedPoint({ x: rotatedInsert.insertTransform.tx, y: rotatedInsert.insertTransform.ty }),
  { x: 50, y: 0 },
);
assertNear(rotatedInsert.insertTransform.rotRad, -Math.PI / 3);

assert.equal(clockwiseInputToDxfDegrees(90), -90, "the regular Rotate direction must remain clockwise");
assertNear(
  rotationDegreesToAlignXAxis({ start: { x: 0, y: 0 }, end: { x: 10, y: 10 / Math.sqrt(3) } }),
  -30,
);
assertNear(
  rotationDegreesToAlignXAxis({ start: { x: 10, y: 10 / Math.sqrt(3) }, end: { x: 0, y: 0 } }),
  -30,
  1e-8,
);
assertNear(
  rotationDegreesToAlignXAxis({ start: { x: 0, y: 0 }, end: { x: 0, y: 5 } }),
  90,
);
assert(Number.isNaN(rotationDegreesToAlignXAxis({ start: { x: 1, y: 1 }, end: { x: 1, y: 1 } })));

const rawLine = { type: "LINE", x1: 1, y1: 2, x2: 3, y2: 4 };
assert.deepEqual(lineReferencesForEntity(rawLine), [{
  entity: rawLine,
  start: { x: 1, y: 2 },
  end: { x: 3, y: 4 },
  segmentIndex: 0,
}]);
const undissolvedPolyline = {
  type: "LWPOLYLINE",
  closed: true,
  points: [
    { x: 0, y: 0, bulge: 0 },
    { x: 8, y: 0, bulge: 0.5 },
    { x: 8, y: 4, bulge: 0 },
    { x: 0, y: 4, bulge: 0 },
  ],
};
assert.deepEqual(
  lineReferencesForEntity(undissolvedPolyline).map((reference) => reference.segmentIndex),
  [0, 2, 3],
  "rotate-by-line must expose straight segments without dissolving a polyline contour",
);

for (const delta of [1, -1]) {
  const sourceBounds = { minX: -7, maxX: 73, minY: 11, maxY: 41 };
  const center = { x: 33, y: 26 };
  const dimensions = axisOffsetDimensions(80, 30, delta, delta);
  const sourcePoints = [
    { x: -7, y: 11 },
    { x: 73, y: 11 },
    { x: 73, y: 41 },
    { x: 10, y: 41 },
    { x: -7, y: 25 },
  ];
  const transformed = sourcePoints.map((point) => (
    scalePointByAxes(point, center, dimensions.scaleX, dimensions.scaleY)
  ));
  const resultBounds = {
    minX: Math.min(...transformed.map((point) => point.x)),
    maxX: Math.max(...transformed.map((point) => point.x)),
    minY: Math.min(...transformed.map((point) => point.y)),
    maxY: Math.max(...transformed.map((point) => point.y)),
  };
  assertNear(resultBounds.minX, sourceBounds.minX - delta);
  assertNear(resultBounds.maxX, sourceBounds.maxX + delta);
  assertNear(resultBounds.minY, sourceBounds.minY - delta);
  assertNear(resultBounds.maxY, sourceBounds.maxY + delta);
  assertNear((resultBounds.minX + resultBounds.maxX) / 2, center.x);
  assertNear((resultBounds.minY + resultBounds.maxY) / 2, center.y);
}

console.log("DXF analytic bounds, rotation, line alignment, and snap geometry tests passed.");

function round(value) {
  return Math.round(value * 1e9) / 1e9;
}

function roundedPoint(point) {
  return { x: round(point.x), y: round(point.y) };
}

function assertNear(actual, expected, tolerance = 1e-9) {
  assert(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}
