const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const {
  cacheIsValid,
  decodePrcFile,
  fileContainsPrcMarker,
} = require("../nano-prc-bridge.cjs");

async function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const workspaceRoot = path.resolve(projectRoot, "..", "..");
  const exporterPath = path.join(
    projectRoot,
    "modules",
    "3dpdf",
    "native",
    "nano_prc_app_export.exe",
  );
  const processGuardPath = path.join(projectRoot, "native", "process-guard.exe");
  const fixtureWriterPath = path.join(
    workspaceRoot,
    "prc",
    "nanoprc",
    "build",
    "nano_prc_teapot_write.exe",
  );
  const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "excelsis-nanoprc-public-"));
  const sourcePrc = path.join(testRoot, "synthetic-teapot.prc");
  const sourcePdf = path.join(testRoot, "synthetic-teapot.pdf");
  const cacheRoot = path.join(testRoot, "cache");
  const html = [
    fs.readFileSync(
      path.join(projectRoot, "modules", "3dpdf", "index.html"),
      "utf8",
    ),
    fs.readFileSync(
      path.join(projectRoot, "modules", "3dpdf", "app.mjs"),
      "utf8",
    ),
  ].join("\n");

  assert.doesNotMatch(
    html,
    /prcDoubleTable|meshwalk_exact|extractPRCFromPDF|decodeDocumentScene/,
    "The active PDF page still contains the previous embedded decoder.",
  );
  assert.match(
    html,
    /nano-prc-worker\.mjs[\s\S]*decode-nanoprc/,
    "The PDF page does not route nanoPRC decoding through its geometry worker.",
  );
  assert.ok(fs.statSync(fixtureWriterPath).isFile(), "The synthetic nanoPRC fixture writer is missing.");

  const writerOutput = execFileSync(
    fixtureWriterPath,
    [sourcePrc, sourcePdf],
    { cwd: testRoot, encoding: "utf8" },
  );
  assert.match(writerOutput, /Verification \(prc\): tessellations=1/);
  assert.match(writerOutput, /Verification \(pdf\): tessellations=1/);
  assert.equal(await fileContainsPrcMarker(sourcePdf), true);

  const result = await decodePrcFile({
    filePath: sourcePdf,
    exporterPath,
    cacheRoot,
    processGuardPath,
  });
  const manifest = JSON.parse(result.manifest);
  const cacheDirectory = path.join(cacheRoot, result.cacheKey);
  assert.equal(
    await cacheIsValid(
      path.join(cacheDirectory, "model.json"),
      path.join(cacheDirectory, "model.mesh"),
    ),
    true,
  );
  assert.equal(manifest.format, "Excelsis nanoPRC bridge 1");
  assert.equal(manifest.mesh_count, 1);
  assert.equal(manifest.vertex_count, 2144);
  assert.equal(manifest.triangle_count, 4032);

  const { decodeNanoDocument } = await import(pathToFileURL(
    path.join(projectRoot, "modules", "3dpdf", "nano-prc.mjs"),
  ));
  const scene = decodeNanoDocument(result.manifest, result.mesh);
  assert.equal(scene.geometries.length, 1);
  assert.equal(scene.nodes.length, 1);
  assert.equal(scene.components.length, 3);
  assert.equal(scene.vertexCount, 2144);
  assert.equal(scene.triangleCount, 4032);
  assert.deepEqual(scene.warnings, []);

  console.log(JSON.stringify({
    fixture: "upstream nanoPRC synthetic teapot PRC-in-PDF",
    decoder: scene.decoder,
    sourcePrcBytes: fs.statSync(sourcePrc).size,
    sourcePdfBytes: fs.statSync(sourcePdf).size,
    manifestBytes: Buffer.byteLength(result.manifest),
    meshBytes: result.mesh.length,
    geometries: scene.geometries.length,
    components: scene.components.length,
    vertices: scene.vertexCount,
    triangles: scene.triangleCount,
    privateFixturesRequired: false,
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
