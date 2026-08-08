const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { CONVERTER_VERSION, convertedDxfPath, isDwgPath } = require("../dwg-converter.cjs");

async function main() {
  assert.equal(CONVERTER_VERSION, "libredwg-0.14.8492-c34d1efb");
  assert.equal(isDwgPath("drawing.DWG"), true);
  assert.equal(isDwgPath("drawing.dxf"), false);

  const projectRoot = path.resolve(__dirname, "..");
  const converterPath = path.join(projectRoot, "third_party", "libredwg", "dwg2dxf.exe");
  const processGuardPath = path.join(projectRoot, "native", "process-guard.exe");
  const sourcePath = process.argv[2];
  if (!sourcePath) {
    const stats = await fs.stat(converterPath);
    assert.ok(stats.isFile() && stats.size > 128, "Bundled DWG converter is missing.");
    console.log(JSON.stringify({ ok: true, converterPath, sampleTested: false }));
    return;
  }

  const cacheRoot = await fs.mkdtemp(path.join(os.tmpdir(), "excelsis-dwg-test-"));
  const outputPath = await convertedDxfPath(sourcePath, { converterPath, cacheRoot, processGuardPath });
  const text = await fs.readFile(outputPath, "utf8");
  assert.match(text, /\bSECTION\b/);
  assert.match(text, /\bENTITIES\b/);
  assert.ok(text.length > 1000, "Converted DXF is unexpectedly small.");
  console.log(JSON.stringify({
    ok: true,
    converterPath,
    sampleTested: true,
    outputPath,
    outputBytes: Buffer.byteLength(text),
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
