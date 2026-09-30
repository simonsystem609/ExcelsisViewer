// Rebuild the independently pinned GPL LibreDWG converter, never a vendor decoder.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const project = path.resolve(__dirname, '..');
const workspace = path.resolve(project, '../..');
const runtime = path.join(project, 'third_party/libredwg');
const kit = path.join(runtime, 'excelsis');
const archive = path.join(runtime, 'libredwg-0.14.8492-source.tar.gz');
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const expectedArchive = '9935245817278c944c681527ef52eee81ccf720fce09f9fb467d0d6a926ae3ce';
if (digest(archive) !== expectedArchive) throw new Error('Pinned LibreDWG source hash mismatch.');
const mingw = path.resolve(process.env.EXCELSIS_MINGW64 || 'C:/msys64/mingw64');
const cmake = path.join(mingw, 'bin/cmake.exe');
const compiler = path.join(mingw, 'bin/gcc.exe');
const ninja = path.join(mingw, 'bin/ninja.exe');
const env = { ...process.env, PATH: path.join(mingw, 'bin') + path.delimiter + process.env.PATH };
function run(exe, args, cwd) {
  const result = spawnSync(exe, args, { cwd, env, windowsHide: true, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`LibreDWG build command failed (exit ${result.status}).`);
}
for (const file of [cmake, compiler, ninja]) if (!fs.statSync(file).isFile()) throw new Error('MinGW64 build tools are unavailable.');
const compilerVersion = spawnSync(compiler, ['--version'], { env, windowsHide:true, encoding:'utf8' });
if (compilerVersion.status !== 0) throw new Error('Could not identify the converter compiler.');
const key = crypto.createHash('sha256').update(expectedArchive).update(compilerVersion.stdout);
for (const name of ['CMakeLists.txt', 'config-mingw64.h', 'out_dxf.c']) key.update(fs.readFileSync(path.join(kit, name)));
const buildKey = key.digest('hex').slice(0, 20);
const stage = path.join(workspace, 'trash', `libredwg-build-${buildKey}`);
fs.mkdirSync(stage, { recursive:true });
const source = path.join(stage, 'libredwg-0.14.8492');
if (!fs.existsSync(source)) run('tar.exe', ['-xzf', archive, '-C', stage], project);
const originalWriter = fs.readFileSync(path.join(source, 'src/out_dxf.c'), 'utf8');
if (!originalWriter.includes('error |= dxf_block_write (dat, obj, mspace, pspace, &i);')
    && !originalWriter.includes('error |= dxf_block_write (dat, obj, mspace, pspace, &entity_index);')) {
  throw new Error('LibreDWG block writer does not match the pinned source.');
}
fs.copyFileSync(path.join(kit, 'out_dxf.c'), path.join(source, 'src/out_dxf.c'));
fs.copyFileSync(path.join(kit, 'config-mingw64.h'), path.join(source, 'src/config.h'));
fs.copyFileSync(path.join(kit, 'CMakeLists.txt'), path.join(source, 'CMakeLists.txt'));
const build = path.join(stage, 'build');
run(cmake, ['-S', source, '-B', build, '-G', 'Ninja', '-DCMAKE_BUILD_TYPE=Release',
  `-DCMAKE_C_COMPILER=${compiler.replaceAll('\\','/')}`, `-DCMAKE_MAKE_PROGRAM=${ninja.replaceAll('\\','/')}`], project);
run(cmake, ['--build', build, '--parallel', '3'], project);
const candidate = path.join(build, 'dwg2dxf.exe');
if (!fs.statSync(candidate).isFile()) throw new Error('Converter rebuild produced no executable.');
const destination = path.join(runtime, 'dwg2dxf.exe');
if (fs.existsSync(destination) && digest(candidate) !== digest(destination)) {
  fs.copyFileSync(destination, path.join(stage, `previous-dwg2dxf-${digest(destination)}.exe`));
}
fs.copyFileSync(candidate, destination);
// Retain the bundled iconv runtime. dxf2dwg stays build-only.
fs.copyFileSync(path.join(runtime, 'libiconv-2.dll'), path.join(build, 'libiconv-2.dll'));
console.log(JSON.stringify({ nativeConverterRebuilt:true, sha256:digest(destination), buildKey }));
