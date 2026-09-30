const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { convertedDxfPath } = require('../dwg-converter.cjs');

async function main() {
  const project = path.resolve(__dirname, '..');
  const cacheRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'excelsis-block-scan-'));
  const output = await convertedDxfPath(path.join(__dirname, 'fixtures/dwg-block-scan.dwg'), {
    converterPath: path.join(project, 'third_party/libredwg/dwg2dxf.exe'),
    processGuardPath: path.join(project, 'native/process-guard.exe'), cacheRoot,
  });
  const lines = (await fs.readFile(output, 'utf8')).replace(/\r\n?/g, '\n').split('\n');
  const names = new Set();
  let blocks = 0, polylines = 0, inBlock = false;
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const code = lines[i].trim(), value = lines[i+1].trim();
    if (code === '0') {
      inBlock = value === 'BLOCK';
      if (inBlock) blocks++;
      if (value === 'POLYLINE') polylines++;
    } else if (inBlock && code === '2') names.add(value);
  }
  for (let i=0; i<24; i++) assert(names.has(`B${i}`), `Converter skipped block B${i}.`);
  assert.equal(blocks, 26, 'All declared blocks, including model/paper space, must be written.');
  assert.equal(polylines, 24, 'Polyline sequences must not advance the block-header scan.');
  console.log(JSON.stringify({ blockHeaderScan:true, blocks, polylines, syntheticFixture:true }));
}
main().catch(error => { console.error(error); process.exitCode=1; });
