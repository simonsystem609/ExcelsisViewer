import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { activeDxfSpace, dxfEntitySpace } from '../modules/dxf/dxf-space.mjs';
import { ellipseParameterRange, sampleEllipseDefinition } from '../modules/dxf/axis-scale-utils.mjs';

// Exercise the actual application parser without requiring a window.
const application = fs.readFileSync(new URL('../modules/dxf/app.js', import.meta.url), 'utf8');
const context = vm.createContext({
  activeDxfSpace, dxfEntitySpace, ellipseParameterRange, sampleEllipseDefinition,
  normalizeDegrees: value => ((value % 360) + 360) % 360,
});
vm.runInContext(application.slice(application.indexOf('function parseDxf('),
  application.indexOf('function setNthValue(')), context);
vm.runInContext(application.slice(application.indexOf('function serializeDxf('),
  application.indexOf('function buildLwPolylinePairs(')), context);

const section = (name, content) => `0\nSECTION\n2\n${name}\n${content}0\nENDSEC\n`;
const line = (x1, y1, x2, y2) => `0\nLINE\n8\n0\n10\n${x1}\n20\n${y1}\n11\n${x2}\n21\n${y2}\n`;
const insert = (name, x = 0, y = 0, scale = 1, rotation = 0) =>
  `0\nINSERT\n8\nASSEMBLY\n2\n${name}\n10\n${x}\n20\n${y}\n41\n${scale}\n42\n${scale}\n50\n${rotation}\n`;
const block = (name, content, x = 0, y = 0) =>
  `0\nBLOCK\n2\n${name}\n10\n${x}\n20\n${y}\n${content}0\nENDBLK\n`;
const drawing = (blocks, entities, entitiesFirst = false) =>
  (entitiesFirst ? section('ENTITIES', entities) + section('BLOCKS', blocks)
    : section('BLOCKS', blocks) + section('ENTITIES', entities)) + '0\nEOF\n';
const geometries = doc => doc.entities.filter(entity => entity.supported);
const pointNear = (actual, expected) => {
  assert(Math.abs(actual.x - expected.x) < 1e-9 && Math.abs(actual.y - expected.y) < 1e-9,
    `Unexpected point ${JSON.stringify(actual)}; expected ${JSON.stringify(expected)}`);
};

const definitions = [
  block('OUTER', insert('MIDDLE', 30, 40), 30, 40),
  block('MIDDLE', insert('LEAF', 10, 20, 2, 90), 10, 20),
  block('LEAF', line(5, 7, 6, 7), 5, 7),
];
for (const reverse of [false, true]) for (const entitiesFirst of [false, true]) {
  const text = drawing((reverse ? [...definitions].reverse() : definitions).join(''),
    insert('outer', 100, 200, 1, 90) + insert('OUTER', 300, 400, 1, 90), entitiesFirst);
  const doc = context.parseDxf(text);
  const lines = geometries(doc);
  assert.equal(lines.length, 2, 'Forward and nested block references must produce geometry.');
  pointNear({ x: lines[0].x1, y: lines[0].y1 }, { x: 100, y: 200 });
  pointNear({ x: lines[0].x2, y: lines[0].y2 }, { x: 98, y: 200 });
  pointNear({ x: lines[1].x1, y: lines[1].y1 }, { x: 300, y: 400 });
  assert.equal(lines[0].layer, 'ASSEMBLY');
  assert.equal(new Set(doc.entities.map(entity => entity.id)).size, doc.entities.length);
  for (const entity of lines) {
    const parent = doc.entities.find(candidate => candidate.id === entity.parentInsertId);
    assert.equal(parent.type, 'INSERT');
    assert.equal(entity.start, parent.start);
    assert.equal(entity.end, parent.end);
  }
  context.state = { doc };
  assert.equal(context.serializeDxf().replaceAll('\r', '').trimEnd(), text.trimEnd(),
    'Opening and saving must preserve source blocks and INSERTs without duplicating virtual children.');
}

const cyclic = drawing(block('A', insert('B')) + block('B', insert('A')), insert('A'));
assert.throws(() => context.parseDxf(cyclic), /circular block reference/);
const deep = Array.from({ length: 66 }, (_, index) => block(`B${index}`,
  index === 65 ? line(0, 0, 1, 0) : insert(`B${index + 1}`))).join('');
assert.throws(() => context.parseDxf(drawing(deep, insert('B0'))), /block nesting limit/);
const missing = context.parseDxf(drawing(block('A', insert('MISSING') + line(0, 0, 1, 0)), insert('A')));
assert.equal(geometries(missing).length, 1, 'Missing blocks must not erase valid sibling geometry.');
const rawBlock = { entities: [{ type: 'LINE', x1: 0, y1: 0, x2: 1, y2: 0 }], base: { x: 0, y: 0 }, expanded: null };
assert.throws(() => context.expandInsertBlock({ blockName: 'A', insertTransform: { tx: 0, ty: 0, sx: 1, sy: 1, rotRad: 0 } },
  new Map([['A', rawBlock]]), { next: 1, expandedEntities: 500_000 }), /expansion size limit/);

if (process.argv[2]) {
  const start = performance.now();
  const doc = context.parseDxf(fs.readFileSync(process.argv[2], 'utf8'));
  const entities = geometries(doc);
  console.log(JSON.stringify({ optionalDrawing: true, entities: entities.length,
    geometry: entities.filter(entity => !entity.isAnnotation).length,
    annotations: entities.filter(entity => entity.isAnnotation).length,
    points: entities.reduce((sum, entity) => sum + (entity.points?.length || 0), 0),
    parseMs: Math.round(performance.now() - start) }));
  assert(entities.length > 0, 'Optional drawing must contain visible entities.');
}
console.log('DXF forward/nested blocks, transforms, source preservation and expansion bounds passed.');
