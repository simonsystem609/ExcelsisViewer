import assert from "node:assert/strict";
import fs from "node:fs";
import { planChamferFilletRemoval } from "../modules/dxf/contour-cleanup.mjs";

function line(id, x1, y1, x2, y2) {
  return {
    id,
    type: "LINE",
    closed: false,
    points: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
  };
}

function rectangleStrip(firstId, outer, inner) {
  let id = firstId;
  const cycle = (bounds) => [
    line(id++, bounds.x1, bounds.y1, bounds.x2, bounds.y1),
    line(id++, bounds.x2, bounds.y1, bounds.x2, bounds.y2),
    line(id++, bounds.x2, bounds.y2, bounds.x1, bounds.y2),
    line(id++, bounds.x1, bounds.y2, bounds.x1, bounds.y1),
  ];
  const outerCycle = cycle(outer);
  const innerCycle = cycle(inner);
  const bridges = [
    line(id++, outer.x1, outer.y1, inner.x1, inner.y1),
    line(id++, outer.x2, outer.y1, inner.x2, inner.y1),
    line(id++, outer.x2, outer.y2, inner.x2, inner.y2),
    line(id++, outer.x1, outer.y2, inner.x1, inner.y2),
  ];
  return { records: [...outerCycle, ...innerCycle, ...bridges], outerCycle, innerCycle, bridges };
}

const exterior = rectangleStrip(
  1,
  { x1: 0, y1: 0, x2: 100, y2: 60 },
  { x1: 1, y1: 1, x2: 99, y2: 59 },
);
const hole = rectangleStrip(
  100,
  { x1: 20, y1: 20, x2: 40, y2: 35 },
  { x1: 21, y1: 21, x2: 39, y2: 34 },
);
const synthetic = planChamferFilletRemoval([...exterior.records, ...hole.records]);
assert.equal(synthetic.strips.length, 2);
for (const entity of exterior.outerCycle) assert.ok(synthetic.keepIds.has(entity.id));
for (const entity of exterior.innerCycle) assert.ok(synthetic.deleteIds.has(entity.id));
for (const entity of hole.innerCycle) assert.ok(synthetic.keepIds.has(entity.id));
for (const entity of hole.outerCycle) assert.ok(synthetic.deleteIds.has(entity.id));
for (const entity of [...exterior.bridges, ...hole.bridges]) {
  assert.ok(synthetic.deleteIds.has(entity.id));
}

const unbridgedOuter = rectangleStrip(
  200,
  { x1: 0, y1: 0, x2: 80, y2: 40 },
  { x1: 0.5, y1: 0.5, x2: 79.5, y2: 39.5 },
);
const unbridgedRecords = [...unbridgedOuter.outerCycle, ...unbridgedOuter.innerCycle];
assert.equal(
  planChamferFilletRemoval(unbridgedRecords).strips.length,
  0,
  "strict mode must continue requiring bridge proof",
);
const relaxedSynthetic = planChamferFilletRemoval(unbridgedRecords, { relaxed: true });
assert.equal(relaxedSynthetic.strips.length, 1);
assert.equal(relaxedSynthetic.strips[0].proof, "relaxed-closed-offset");
for (const entity of unbridgedOuter.outerCycle) assert.ok(relaxedSynthetic.keepIds.has(entity.id));
for (const entity of unbridgedOuter.innerCycle) assert.ok(relaxedSynthetic.deleteIds.has(entity.id));
assert.equal(
  planChamferFilletRemoval(unbridgedRecords, { relaxed: true }).strips.length,
  1,
  "contour analysis must not mutate source points needed by a repeated pass",
);

const ambiguousOuter = rectangleStrip(
  300,
  { x1: 0, y1: 0, x2: 80, y2: 40 },
  { x1: 0.5, y1: 0.5, x2: 79.5, y2: 39.5 },
);
const ambiguousInner = rectangleStrip(
  400,
  { x1: 0.5, y1: 0.5, x2: 79.5, y2: 39.5 },
  { x1: 1, y1: 1, x2: 79, y2: 39 },
);
const ambiguousRecords = [
  ...ambiguousOuter.outerCycle,
  ...ambiguousOuter.innerCycle,
  ...ambiguousInner.innerCycle,
];
assert.equal(
  planChamferFilletRemoval(ambiguousRecords, { relaxed: true }).strips.length,
  0,
  "relaxed mode must reject ambiguous three-contour nesting",
);

function branchedExteriorNetwork(firstId, { openInnerChains = false, bridgeCount = 4 } = {}) {
  let id = firstId;
  const edge = (x1, y1, x2, y2) => line(id++, x1, y1, x2, y2);
  const outerCycle = [
    edge(0, 0, 100, 0),
    edge(100, 0, 100, 60),
    edge(100, 60, 0, 60),
    edge(0, 60, 0, 0),
  ];
  const upper = openInnerChains
    ? [
      edge(99, 31, 99, 59),
      edge(99, 59, 1, 59),
      edge(1, 59, 1, 31),
    ]
    : [
      edge(1, 31, 99, 31),
      edge(99, 31, 99, 59),
      edge(99, 59, 1, 59),
      edge(1, 59, 1, 31),
      edge(1, 31, 99, 59),
    ];
  const lower = openInnerChains
    ? [
      edge(1, 1, 99, 1),
      edge(99, 1, 99, 29),
      edge(1, 29, 1, 1),
    ]
    : [
      edge(1, 1, 99, 1),
      edge(99, 1, 99, 29),
      edge(99, 29, 1, 29),
      edge(1, 29, 1, 1),
      edge(1, 1, 99, 29),
    ];
  const bridges = [
    edge(0, 60, 1, 59),
    edge(100, 60, 99, 59),
    edge(100, 0, 99, 1),
    edge(0, 0, 1, 1),
  ].slice(0, bridgeCount);
  return {
    records: [...outerCycle, ...upper, ...lower, ...bridges],
    outerCycle,
  };
}

for (const openInnerChains of [false, true]) {
  const network = branchedExteriorNetwork(openInnerChains ? 700 : 500, { openInnerChains });
  assert.equal(
    planChamferFilletRemoval(network.records).strips.length,
    0,
    "strict mode must not flatten a multi-branch exterior network",
  );
  const cleanup = planChamferFilletRemoval(network.records, { relaxed: true });
  assert.equal(cleanup.strips.length, 1);
  assert.equal(cleanup.strips[0].proof, "relaxed-exterior-network");
  assert.equal(cleanup.keepIds.size, network.outerCycle.length);
  assert.equal(cleanup.deleteIds.size, network.records.length - network.outerCycle.length);
  for (const entity of network.outerCycle) assert.ok(cleanup.keepIds.has(entity.id));
  const cleanedRecords = network.records.filter((record) => cleanup.keepIds.has(record.id));
  assert.equal(
    planChamferFilletRemoval(cleanedRecords, { relaxed: true }).strips.length,
    0,
    "exterior-network cleanup must be idempotent",
  );
}

const weakExteriorEvidence = branchedExteriorNetwork(900, { bridgeCount: 2 });
assert.equal(
  planChamferFilletRemoval(weakExteriorEvidence.records, { relaxed: true }).strips.length,
  0,
  "relaxed exterior cleanup must require at least four coherent short bridges",
);

function first(pairs, code) {
  return pairs.find((pair) => pair.code === code)?.value.trim() || "";
}

function number(pairs, code) {
  const value = Number(first(pairs, code));
  return Number.isFinite(value) ? value : NaN;
}

function recordsFromDxf(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").replace(/\r\n?/g, "\n").split("\n");
  const pairs = [];
  for (let index = 0; index < lines.length - 1; index += 2) {
    pairs.push({ code: lines[index].trim(), value: lines[index + 1] });
  }
  let entityStart = -1;
  let entityEnd = -1;
  for (let index = 0; index < pairs.length; index += 1) {
    if (pairs[index].code !== "0" || pairs[index].value.trim().toUpperCase() !== "SECTION") continue;
    let nameIndex = index + 1;
    while (nameIndex < pairs.length && pairs[nameIndex].code !== "0" && pairs[nameIndex].code !== "2") {
      nameIndex += 1;
    }
    if (pairs[nameIndex]?.code !== "2" || pairs[nameIndex].value.trim().toUpperCase() !== "ENTITIES") continue;
    entityStart = nameIndex + 1;
    entityEnd = entityStart;
    while (
      entityEnd < pairs.length
      && !(pairs[entityEnd].code === "0" && pairs[entityEnd].value.trim().toUpperCase() === "ENDSEC")
    ) {
      entityEnd += 1;
    }
    break;
  }
  assert.ok(entityStart >= 0 && entityEnd > entityStart, "DXF fixture must contain an ENTITIES section");
  const records = [];
  let nextId = 1;
  for (let index = entityStart; index < entityEnd;) {
    if (pairs[index].code !== "0") {
      index += 1;
      continue;
    }
    const type = pairs[index].value.trim().toUpperCase();
    let end = index + 1;
    while (end < pairs.length && pairs[end].code !== "0") end += 1;
    const entityPairs = pairs.slice(index, end);
    const id = nextId++;
    if (type === "LINE") {
      records.push(line(
        id,
        number(entityPairs, "10"),
        number(entityPairs, "20"),
        number(entityPairs, "11"),
        number(entityPairs, "21"),
      ));
    } else if (type === "ARC") {
      const cx = number(entityPairs, "10");
      const cy = number(entityPairs, "20");
      const radius = number(entityPairs, "40");
      const start = number(entityPairs, "50");
      const finish = number(entityPairs, "51");
      let sweep = finish - start;
      while (sweep <= 0) sweep += 360;
      const points = [];
      const sampleCount = Math.max(4, Math.ceil((sweep / 360) * 96));
      for (let sample = 0; sample <= sampleCount; sample += 1) {
        const angle = (start + sweep * sample / sampleCount) * Math.PI / 180;
        points.push({
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        });
      }
      records.push({ id, type: "ARC", closed: false, points });
    }
    index = end;
  }
  return records;
}

const privateFixture = process.argv[2];
let privateResult = null;
if (privateFixture) {
  const privateRecords = recordsFromDxf(privateFixture);
  const strictPlan = planChamferFilletRemoval(privateRecords);
  const plan = planChamferFilletRemoval(privateRecords, { relaxed: true, diagnostics: true });
  if (!plan.strips.length) {
    console.error(JSON.stringify(plan.diagnostics, null, 2));
  }
  assert.ok(plan.strips.length > 0, "the supplied DXF should contain removable strips");
  assert.ok(plan.deleteIds.size > 0, "the supplied DXF cleanup should remove entities");
  privateResult = {
    entities: privateRecords.length,
    strictStrips: strictPlan.strips.length,
    strips: plan.strips.length,
    removed: plan.deleteIds.size,
    kept: plan.keepIds.size,
    proofs: plan.strips.map((strip) => strip.proof),
    offsets: plan.strips.map((strip) => Number(strip.offset.toFixed(4))),
  };
}

console.log(JSON.stringify({
  syntheticStrips: synthetic.strips.length,
  syntheticRemoved: synthetic.deleteIds.size,
  relaxedSyntheticStrips: relaxedSynthetic.strips.length,
  privateFixture: privateResult,
}, null, 2));
