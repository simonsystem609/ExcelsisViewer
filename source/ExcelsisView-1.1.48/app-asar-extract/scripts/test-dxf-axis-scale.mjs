import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  buildAxisScaleReplacementPairs,
  ellipseParameterRange,
  lineScaleOptions,
  pointOnEllipseDefinition,
  scaleEntitiesByAxesInPlace,
} from "../modules/dxf/axis-scale-utils.mjs";

const SCALE_X = 1.03;
const SCALE_Y = 1;
const EPSILON = 1e-8;

assert.throws(
  () => scaleEntitiesByAxesInPlace([], { x: 0, y: 0 }, Number.POSITIVE_INFINITY, 1),
  /positive numbers/,
);

const slot = [
  { id: 1, type: "LINE", x1: -15, y1: 5.75, x2: 15, y2: 5.75 },
  { id: 2, type: "ARC", cx: 15, cy: 0, r: 5.75, a1: 270, a2: 90 },
  { id: 3, type: "LINE", x1: 15, y1: -5.75, x2: -15, y2: -5.75 },
  { id: 4, type: "ARC", cx: -15, cy: 0, r: 5.75, a1: 90, a2: 270 },
];
for (const entity of slot) Object.assign(entity, { supported: true, deleted: false, virtual: false });
const slotResult = scaleEntitiesByAxesInPlace(slot, { x: 0, y: 0 }, SCALE_X, SCALE_Y);
assert.deepEqual(slotResult, { scaled: 4, exactEllipseReplacements: 2, uniform: false });
assertClosedEndpointGraph(slot, EPSILON);
for (const entity of slot.filter((candidate) => candidate.originalType === "ELLIPSE")) {
  assert.equal(entity.type, "LWPOLYLINE");
  assert.equal(entity.axisScaleReplacementEntities.length, 1);
  const ellipse = entity.axisScaleReplacementEntities[0];
  assert.equal(ellipse.type, "ELLIPSE");
  assertNear(Math.hypot(ellipse.majorAxis.x, ellipse.majorAxis.y), 5.75 * SCALE_X);
  assertNear(ellipse.ratio, SCALE_Y / SCALE_X);
  assertPointNear(entity.points[0], pointOnEllipseDefinition(ellipse, ellipse.startParam));
  assertPointNear(entity.points.at(-1), pointOnEllipseDefinition(ellipse, ellipse.endParam));
  const serializedPairs = buildAxisScaleReplacementPairs(entity);
  assert.deepEqual(serializedPairs.slice(0, 2), [
    { code: "0", value: "ELLIPSE" },
    { code: "100", value: "AcDbEntity" },
  ]);
  assert(serializedPairs.some((pair) => pair.code === "100" && pair.value === "AcDbEllipse"));
  assertNear(Number(firstPair(serializedPairs, "10")), ellipse.center.x, 5e-7);
  assertNear(Number(firstPair(serializedPairs, "20")), ellipse.center.y, 5e-7);
  assertNear(Number(firstPair(serializedPairs, "40")), ellipse.ratio, 5e-7);
}

const circle = {
  id: 5,
  type: "CIRCLE",
  cx: 4,
  cy: -2,
  r: 7,
  supported: true,
};
const circleResult = scaleEntitiesByAxesInPlace([circle], { x: 0, y: 0 }, 0.97, 1.04);
assert.equal(circleResult.exactEllipseReplacements, 1);
assert.equal(circle.type, "LWPOLYLINE");
assert.equal(circle.closed, true);
assert(circle.points.length >= 128);
assertNear(Math.min(...circle.points.map((point) => point.x)), 4 * 0.97 - 7 * 0.97);
assertNear(Math.max(...circle.points.map((point) => point.x)), 4 * 0.97 + 7 * 0.97);
assertNear(Math.min(...circle.points.map((point) => point.y)), -2 * 1.04 - 7 * 1.04);
assertNear(Math.max(...circle.points.map((point) => point.y)), -2 * 1.04 + 7 * 1.04);
assert(
  Math.hypot(circle.points[0].x - circle.points.at(-1).x, circle.points[0].y - circle.points.at(-1).y) > EPSILON,
  "A closed ellipse preview must not repeat its first vertex as a zero-length final segment.",
);

const bulgedPolyline = {
  id: 6,
  type: "LWPOLYLINE",
  originalType: "LWPOLYLINE",
  points: [
    { x: -5, y: 0, bulge: 1 },
    { x: 5, y: 0, bulge: 0 },
  ],
  closed: false,
  supported: true,
};
const bulgeResult = scaleEntitiesByAxesInPlace([bulgedPolyline], { x: 0, y: 0 }, 1.02, 0.99);
assert.equal(bulgeResult.exactEllipseReplacements, 1);
assert.equal(bulgedPolyline.axisScaleReplacementEntities[0].type, "ELLIPSE");
assert(bulgedPolyline.points.every((point) => point.bulge === 0));
assertPointNear(bulgedPolyline.points[0], { x: -5.1, y: 0 });
assertPointNear(bulgedPolyline.points.at(-1), { x: 5.1, y: 0 });

const uniformEntities = [
  { id: 7, type: "ARC", cx: 2, cy: 3, r: 4, a1: 10, a2: 120, supported: true },
  {
    id: 8,
    type: "LWPOLYLINE",
    points: [{ x: 0, y: 0, bulge: 0.5 }, { x: 4, y: 0, bulge: 0 }],
    closed: false,
    supported: true,
  },
];
const uniformResult = scaleEntitiesByAxesInPlace(uniformEntities, { x: 0, y: 0 }, 1.05, 1.05);
assert.deepEqual(uniformResult, { scaled: 2, exactEllipseReplacements: 0, uniform: true });
assert.equal(uniformEntities[0].type, "ARC", "Line/uniform scaling must keep exact circular arcs.");
assertNear(uniformEntities[0].r, 4.2);
assert.equal(uniformEntities[1].points[0].bulge, 0.5, "Line/uniform scaling must preserve bulges.");
assert.equal(uniformEntities[0].axisScaleReplacementEntities, undefined);

const wrappedRange = ellipseParameterRange(Math.PI * 1.5, Math.PI * 0.5);
assert.equal(wrappedRange.full, false, "A wrapped partial ellipse must not be mistaken for a full ellipse.");
assertNear(wrappedRange.sweep, Math.PI);
const fullRange = ellipseParameterRange(0, Math.PI * 2);
assert.equal(fullRange.full, true);

const rotatedEllipseDefinition = {
  center: { x: 3, y: -4 },
  majorAxis: { x: 8 * Math.cos(0.61), y: 8 * Math.sin(0.61) },
  ratio: 0.42,
  startParam: 5.4,
  endParam: 1.2,
  full: false,
};
const rotatedEllipse = {
  id: 9,
  type: "LWPOLYLINE",
  originalType: "ELLIPSE",
  ellipseDefinition: rotatedEllipseDefinition,
  points: [],
  closed: false,
  supported: true,
};
const transformedExpectedEndpoints = [
  pointOnEllipseDefinition(rotatedEllipseDefinition, rotatedEllipseDefinition.startParam),
  pointOnEllipseDefinition(rotatedEllipseDefinition, rotatedEllipseDefinition.endParam),
].map((point) => ({ x: point.x * 1.07, y: point.y * 0.94 }));
scaleEntitiesByAxesInPlace([rotatedEllipse], { x: 0, y: 0 }, 1.07, 0.94);
const transformedDefinition = rotatedEllipse.axisScaleReplacementEntities[0];
const rotatedSourceRange = ellipseParameterRange(
  rotatedEllipseDefinition.startParam,
  rotatedEllipseDefinition.endParam,
);
for (const fraction of [0, 0.2, 0.5, 0.8, 1]) {
  const sourcePoint = pointOnEllipseDefinition(
    rotatedEllipseDefinition,
    rotatedSourceRange.startParam + rotatedSourceRange.sweep * fraction,
  );
  const expectedPoint = { x: sourcePoint.x * 1.07, y: sourcePoint.y * 0.94 };
  const actualPoint = pointOnEllipseDefinition(
    transformedDefinition,
    transformedDefinition.startParam + rotatedSourceRange.sweep * fraction,
  );
  assertPointNear(actualPoint, expectedPoint);
}
assertPointNear(
  pointOnEllipseDefinition(transformedDefinition, transformedDefinition.startParam),
  transformedExpectedEndpoints[0],
);
assertPointNear(
  pointOnEllipseDefinition(transformedDefinition, transformedDefinition.endParam),
  transformedExpectedEndpoints[1],
);

// Line-relative scale must stretch one local axis without rotating the drawing
// or applying an unwanted scale to the perpendicular axis.
const angle = Math.PI / 6;
const refStart = { x: 17, y: -8 };
const refEnd = { x: refStart.x + 30 * Math.cos(angle), y: refStart.y + 30 * Math.sin(angle) };
const lineReference = { start: refStart, end: refEnd };
const uniformLineOptions = lineScaleOptions(lineReference, 60, false);
assertNear(uniformLineOptions.scaleX, 2);
assertNear(uniformLineOptions.scaleY, 2);
assert.equal(uniformLineOptions.axisAngleRadians, 0);
assert.throws(() => lineScaleOptions({ start: refStart, end: refStart }, 60), /valid line/);
assert.throws(() => lineScaleOptions(lineReference, 60, true, 0), /positive finite/);
const lineOptions = lineScaleOptions(lineReference, 60, true, 100);
assertNear(lineOptions.axisAngleRadians, angle);
for (const perpendicularPercent of [100, 83, 125]) {
  const options = lineScaleOptions(lineReference, 33, true, perpendicularPercent);
  const framePoint = (x, y) => ({ x: x * Math.cos(angle) - y * Math.sin(angle), y: x * Math.sin(angle) + y * Math.cos(angle) });
  const points = [framePoint(-15, 5.75), framePoint(15, 5.75), framePoint(15, -5.75), framePoint(-15, -5.75)];
  const rightCenter = framePoint(15, 0);
  const leftCenter = framePoint(-15, 0);
  const diagonalSlot = [
    { type: "LINE", x1: points[0].x, y1: points[0].y, x2: points[1].x, y2: points[1].y },
    { type: "ARC", cx: rightCenter.x, cy: rightCenter.y, r: 5.75, a1: 300, a2: 120 },
    { type: "LINE", x1: points[2].x, y1: points[2].y, x2: points[3].x, y2: points[3].y },
    { type: "ARC", cx: leftCenter.x, cy: leftCenter.y, r: 5.75, a1: 120, a2: 300 },
  ];
  scaleEntitiesByAxesInPlace(diagonalSlot, { x: 0, y: 0 }, options.scaleX, options.scaleY, options.axisAngleRadians);
  assertClosedEndpointGraph(diagonalSlot, EPSILON);
  assertPointNear({ x: diagonalSlot[0].x1, y: diagonalSlot[0].y1 }, framePoint(-16.5, 5.75 * perpendicularPercent / 100));
  assertPointNear({ x: diagonalSlot[0].x2, y: diagonalSlot[0].y2 }, framePoint(16.5, 5.75 * perpendicularPercent / 100));
  const savedLines = diagonalSlot.filter((entity) => entity.type === "LINE");
  for (const ellipse of diagonalSlot.filter((entity) => entity.originalType === "ELLIPSE")) {
    for (const point of serializedEllipseEndpoints(buildAxisScaleReplacementPairs(ellipse))) {
      assert(nearestLineEndpointDistance(point, savedLines) < 1e-5);
    }
  }
}

const privateResults = [];
for (const filePath of process.argv.slice(2)) {
  privateResults.push(testPrivateFixture(path.resolve(filePath)));
}

console.log(JSON.stringify({
  exactNonUniformConics: true,
  connectedSlotEndpoints: true,
  bulgedPolylineConversion: true,
  uniformLineScalePreserved: true,
  wrappedEllipseRange: true,
  diagonalLineScale: true,
  privateFixtures: privateResults,
}));

function testPrivateFixture(filePath) {
  const source = parseGeometry(fs.readFileSync(filePath, "utf8"));
  const sourceById = new Map(source.map((entity) => [entity.id, structuredClone(entity)]));
  const connectedArcIds = source
    .filter((entity) => entity.type === "ARC")
    .filter((arc) => entityEndpoints(arc).every((point) => nearestLineEndpointDistance(point, source) <= 0.05))
    .map((arc) => arc.id);
  const result = scaleEntitiesByAxesInPlace(source, { x: 0, y: 0 }, SCALE_X, SCALE_Y);
  let maximumGap = 0;
  let maximumSerializedGap = 0;
  const serializedLineEntities = source
    .filter((entity) => entity.type === "LINE")
    .map((entity) => ({
      ...entity,
      x1: roundDxf(entity.x1),
      y1: roundDxf(entity.y1),
      x2: roundDxf(entity.x2),
      y2: roundDxf(entity.y2),
    }));
  for (const id of connectedArcIds) {
    const transformed = source.find((entity) => entity.id === id);
    assert.equal(transformed?.type, "LWPOLYLINE");
    for (const point of entityEndpoints(transformed)) {
      maximumGap = Math.max(maximumGap, nearestLineEndpointDistance(point, source));
    }
    for (const point of serializedEllipseEndpoints(buildAxisScaleReplacementPairs(transformed))) {
      maximumSerializedGap = Math.max(
        maximumSerializedGap,
        nearestLineEndpointDistance(point, serializedLineEntities),
      );
    }
    const original = sourceById.get(id);
    assert(original?.type === "ARC");
  }
  assert(
    maximumGap <= EPSILON,
    `${path.basename(filePath)} retained a ${maximumGap} mm endpoint gap after axis scaling.`,
  );
  assert(
    maximumSerializedGap <= 1e-5,
    `${path.basename(filePath)} retained a ${maximumSerializedGap} mm endpoint gap after DXF serialization.`,
  );
  return {
    file: path.basename(filePath),
    entities: source.length,
    connectedArcEnds: connectedArcIds.length * 2,
    exactEllipseReplacements: result.exactEllipseReplacements,
    maximumGap,
    maximumSerializedGap,
  };
}

function parseGeometry(text) {
  const lines = String(text).replace(/^\uFEFF/, "").split(/\r?\n/);
  const pairs = [];
  for (let index = 0; index + 1 < lines.length; index += 2) {
    pairs.push({ code: lines[index].trim(), value: lines[index + 1].trim() });
  }
  const entitiesMarker = pairs.findIndex((pair, index) => (
    pair.code === "2"
    && pair.value.toUpperCase() === "ENTITIES"
    && pairs[index - 1]?.code === "0"
    && pairs[index - 1]?.value.toUpperCase() === "SECTION"
  ));
  if (entitiesMarker < 0) return [];

  const entities = [];
  let id = 1;
  for (let index = entitiesMarker + 1; index < pairs.length;) {
    if (pairs[index].code !== "0") {
      index += 1;
      continue;
    }
    const type = pairs[index].value.toUpperCase();
    if (type === "ENDSEC") break;
    let end = index + 1;
    while (end < pairs.length && pairs[end].code !== "0") end += 1;
    const entityPairs = pairs.slice(index, end);
    const read = (code) => {
      const value = entityPairs.find((pair) => pair.code === code)?.value;
      return value == null ? Number.NaN : Number(value);
    };
    if (type === "LINE") {
      entities.push({ id, type, x1: read("10"), y1: read("20"), x2: read("11"), y2: read("21"), supported: true });
    } else if (type === "ARC") {
      entities.push({ id, type, cx: read("10"), cy: read("20"), r: read("40"), a1: read("50"), a2: read("51"), supported: true });
    } else if (type === "CIRCLE") {
      entities.push({ id, type, cx: read("10"), cy: read("20"), r: read("40"), supported: true });
    } else if (type === "LWPOLYLINE") {
      const points = [];
      let point = null;
      for (const pair of entityPairs) {
        if (pair.code === "10") {
          if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) points.push(point);
          point = { x: Number(pair.value), y: Number.NaN, bulge: 0 };
        } else if (pair.code === "20" && point) {
          point.y = Number(pair.value);
        } else if (pair.code === "42" && point) {
          point.bulge = Number(pair.value) || 0;
        }
      }
      if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) points.push(point);
      entities.push({ id, type, points, closed: (read("70") & 1) !== 0, supported: true });
    }
    id += 1;
    index = end;
  }
  return entities;
}

function entityEndpoints(entity) {
  if (entity.type === "LINE") {
    return [{ x: entity.x1, y: entity.y1 }, { x: entity.x2, y: entity.y2 }];
  }
  if (entity.type === "ARC") {
    return [entity.a1, entity.a2].map((degrees) => ({
      x: entity.cx + entity.r * Math.cos(degrees * Math.PI / 180),
      y: entity.cy + entity.r * Math.sin(degrees * Math.PI / 180),
    }));
  }
  if (entity.type === "LWPOLYLINE" && !entity.closed && entity.points.length) {
    return [entity.points[0], entity.points.at(-1)];
  }
  return [];
}

function nearestLineEndpointDistance(point, entities) {
  let nearest = Number.POSITIVE_INFINITY;
  for (const entity of entities) {
    if (entity.type !== "LINE") continue;
    for (const endpoint of entityEndpoints(entity)) {
      nearest = Math.min(nearest, Math.hypot(point.x - endpoint.x, point.y - endpoint.y));
    }
  }
  return nearest;
}

function assertClosedEndpointGraph(entities, tolerance) {
  const endpoints = entities.flatMap(entityEndpoints);
  for (let index = 0; index < endpoints.length; index += 1) {
    const matches = endpoints.filter((candidate, candidateIndex) => (
      candidateIndex !== index
      && Math.hypot(candidate.x - endpoints[index].x, candidate.y - endpoints[index].y) <= tolerance
    ));
    assert.equal(matches.length, 1, `Endpoint ${index} is not connected exactly once.`);
  }
}

function assertPointNear(actual, expected, tolerance = EPSILON) {
  assertNear(actual.x, expected.x, tolerance);
  assertNear(actual.y, expected.y, tolerance);
}

function assertNear(actual, expected, tolerance = EPSILON) {
  assert(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}.`,
  );
}

function firstPair(pairs, code) {
  return pairs.find((pair) => pair.code === code)?.value;
}

function serializedEllipseEndpoints(pairs) {
  const definition = {
    center: { x: Number(firstPair(pairs, "10")), y: Number(firstPair(pairs, "20")) },
    majorAxis: { x: Number(firstPair(pairs, "11")), y: Number(firstPair(pairs, "21")) },
    ratio: Number(firstPair(pairs, "40")),
    startParam: Number(firstPair(pairs, "41")),
    endParam: Number(firstPair(pairs, "42")),
  };
  return [
    pointOnEllipseDefinition(definition, definition.startParam),
    pointOnEllipseDefinition(definition, definition.endParam),
  ];
}

function roundDxf(value) {
  return Number(Number(value).toFixed(6));
}
