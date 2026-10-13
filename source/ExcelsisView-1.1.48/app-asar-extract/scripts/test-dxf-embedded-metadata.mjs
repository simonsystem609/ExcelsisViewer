import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { activeDxfSpace, dxfEntitySpace } from '../modules/dxf/dxf-space.mjs';
import { ellipseParameterRange, sampleEllipseDefinition } from '../modules/dxf/axis-scale-utils.mjs';
import { readDxfMetadata, readDxfMetadataFromPairs, METADATA_BEGIN, METADATA_END,
  METADATA_JSON, MAX_METADATA_CHARS } from '../modules/dxf/embedded-metadata.mjs';

const group = value => `999\n${value}\n`;
const block = (value, chunkSize = 25) => {
  const text = JSON.stringify(value), chunks = [];
  for (let index = 0; index < text.length; index += chunkSize) chunks.push(group(METADATA_JSON + text.slice(index, index + chunkSize)));
  return group(METADATA_BEGIN) + chunks.join('') + group(METADATA_END);
};
const drawing = '0\nSECTION\n2\nENTITIES\n0\nCIRCLE\n8\n0\n10\n3\n20\n7\n40\n5\n0\nENDSEC\n0\nEOF\n';
const data = { fullFilename: 'Original long part Árvíz 😀 <b>name</b>.SLDPRT',
  configuration: 'Variant 1', sourceId: 'synthetic-source', ownerId: 'synthetic-owner',
  ownership: { privateMacroField: 'preserve without interpretation' } };
const prefix = block(data), text = prefix + drawing;
assert.equal(readDxfMetadata(text).fullFilename, data.fullFilename);
assert.deepEqual(readDxfMetadata(text), { fullFilename: data.fullFilename,
  configuration: data.configuration, sourceId: data.sourceId, ownerId: data.ownerId });
assert.equal(readDxfMetadata('\ufeff' + text.replaceAll('\n', '\r\n')).fullFilename, data.fullFilename);
assert.equal(readDxfMetadata(text.replaceAll('\n', '\r')).fullFilename, data.fullFilename);
for (const invalid of [drawing, group(METADATA_END) + drawing, group(METADATA_BEGIN) + drawing,
  group(METADATA_BEGIN) + group(METADATA_END) + drawing,
  group(METADATA_JSON + JSON.stringify(data)) + drawing,
  group(METADATA_BEGIN) + group(METADATA_JSON + '{bad JSON') + group(METADATA_END) + drawing,
  prefix + prefix + drawing, drawing + prefix,
  block({ fullFilename: '' }) + drawing, block({ fullFilename: 42 }) + drawing,
  block({ fullFilename: 'x'.repeat(4097) }) + drawing,
  block({ fullFilename: 'misleading\nname.dxf' }) + drawing,
  block({ fullFilename: 'spoof\u202efile.dxf' }) + drawing,
  block([]) + drawing,
  group(METADATA_BEGIN) + group(METADATA_JSON + 'x'.repeat(MAX_METADATA_CHARS + 1)) + group(METADATA_END) + drawing,
]) assert.equal(readDxfMetadata(invalid), null);
assert.equal(readDxfMetadata(group('Unrelated comment') + prefix + drawing).fullFilename, data.fullFilename);

// Actual Viewer parser/serializer: metadata produces no drawing entity and
// survives edits, Save/Save As serialization, and a second parser/save cycle.
const application = fs.readFileSync(new URL('../modules/dxf/app.js', import.meta.url), 'utf8');
const context = vm.createContext({ activeDxfSpace, dxfEntitySpace, ellipseParameterRange,
  sampleEllipseDefinition, readDxfMetadataFromPairs, normalizeDegrees: value => ((value % 360) + 360) % 360 });
vm.runInContext(application.slice(application.indexOf('function parseDxf('), application.indexOf('function setNthValue(')), context);
vm.runInContext(application.slice(application.indexOf('function setNthValue('), application.indexOf('function pointGridKey(')), context);
vm.runInContext(application.slice(application.indexOf('function serializeDxf('), application.indexOf('function currentFile(')), context);
const doc = context.parseDxf(text);
assert.equal(doc.entities.length, 1);
assert.equal(doc.entities[0].type, 'CIRCLE');
assert.equal(doc.metadata.fullFilename, data.fullFilename);
const originalCommentPairs = JSON.stringify(doc.pairs.filter(pair => pair.code === '999'));
context.state = { doc };
doc.entities[0].r = 8; doc.entities[0].modified = true;
const saved = context.serializeDxf();
assert(saved.replaceAll('\r', '').startsWith(prefix), 'All original metadata/ownership comment values survive our existing CRLF serializer');
assert.equal(JSON.stringify(doc.pairs.filter(pair => pair.code === '999')), originalCommentPairs);
assert.equal(readDxfMetadata(saved).fullFilename, data.fullFilename);
context.state = { doc: context.parseDxf(saved) };
assert.equal(context.state.doc.entities[0].r, 8);
assert(context.serializeDxf().replaceAll('\r', '').startsWith(prefix));
console.log(JSON.stringify({ passed: true, chunkOrder: true, unicode: true, bounds: true,
  malformedSafe: true, noEntities: true, sourcePreservingSave: true, displayOnly: true }));
