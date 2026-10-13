// Author-owned synthetic DXF only; no customer drawing is used by this generator.
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { runGuardedProcess } = require('../guarded-process.cjs');

async function main() {
  const project = path.resolve(__dirname, '..');
  const writer = path.resolve(process.argv[2] || '');
  if (path.basename(writer).toLowerCase() !== 'dxf2dwg.exe') throw new Error('Provide the build-only dxf2dwg.exe path.');
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'excelsis-block-fixture-'));
  const runtime = path.join(root, 'runtime');
  await fs.mkdir(runtime);
  await fs.copyFile(writer, path.join(runtime, 'dxf2dwg.exe'));
  await fs.copyFile(path.join(project,'third_party/libredwg/libiconv-2.dll'),path.join(runtime,'libiconv-2.dll'));
  const input = path.join(root, 'input.dxf'), output = path.join(root, 'fixture.dwg');
  await fs.copyFile(path.join(__dirname, 'fixtures/dwg-block-scan.dxf'), input);
  await runGuardedProcess({
    processGuardPath:path.join(project,'native/process-guard.exe'), executablePath:path.join(runtime,'dxf2dwg.exe'),
    args:['-v0','-y','-o',output,input], cwd:runtime, memoryMiB:1024, cpuSeconds:120, timeoutMs:180000,
    sandboxReadWriteDirectories:[root], outputLimits:[{path:output,maximumBytes:16*1024*1024}],
  });
  const destination = path.join(__dirname, 'fixtures/dwg-block-scan.dwg');
  const candidate = await fs.readFile(output);
  if (candidate.length <= 128) throw new Error('Synthetic DWG generation failed.');
  try {
    const previous = await fs.readFile(destination);
    if (!previous.equals(candidate)) {
      const digest = crypto.createHash('sha256').update(previous).digest('hex');
      const backup = path.resolve(project, '../../trash/dwg-synthetic-fixture-backups');
      await fs.mkdir(backup,{recursive:true});
      await fs.writeFile(path.join(backup,`block-scan-${digest}.dwg`),previous);
    }
  } catch(error) { if (error.code !== 'ENOENT') throw error; }
  await fs.copyFile(output,destination);
  console.log(JSON.stringify({ syntheticFixtureGenerated:true, bytes:candidate.length,
    sha256:crypto.createHash('sha256').update(candidate).digest('hex') }));
}
main().catch(error => { console.error(error); process.exitCode=1; });
