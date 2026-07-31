const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const {
  decodePrcFile,
  fileContainsPrcMarker,
} = require("../nano-prc-bridge.cjs");

async function main() {
  const singlePartPdf = process.argv[2] ? path.resolve(process.argv[2]) : "";
  const assemblyPdf = process.argv[3] ? path.resolve(process.argv[3]) : "";
  if (!singlePartPdf || !assemblyPdf) {
    throw new Error(
      "Usage: npm run test:nanoprc:private -- <single-part.pdf> <assembly.pdf>",
    );
  }

  const projectRoot = path.resolve(__dirname, "..");
  const exporterPath = path.join(
    projectRoot,
    "modules",
    "3dpdf",
    "native",
    "nano_prc_app_export.exe",
  );
  const processGuardPath = path.join(projectRoot, "native", "process-guard.exe");
  const cacheRoot = fs.mkdtempSync(path.join(os.tmpdir(), "excelsis-nanoprc-private-"));
  const { decodeNanoDocument } = await import(pathToFileURL(
    path.join(projectRoot, "modules", "3dpdf", "nano-prc.mjs"),
  ));

  assert.equal(await fileContainsPrcMarker(singlePartPdf), true);
  const result = await decodePrcFile({
    filePath: singlePartPdf,
    exporterPath,
    cacheRoot,
    processGuardPath,
  });
  const scene = decodeNanoDocument(result.manifest, result.mesh);
  assert.equal(scene.geometries.length, 1);
  assert.equal(scene.nodes.length, 1);
  assert.equal(scene.components.length, 3);
  assert.equal(scene.vertexCount, 244);
  assert.equal(scene.triangleCount, 228);
  assert.deepEqual(scene.warnings, []);

  assert.equal(await fileContainsPrcMarker(assemblyPdf), true);
  const assemblyResult = await decodePrcFile({
    filePath: assemblyPdf,
    exporterPath,
    cacheRoot,
    processGuardPath,
  });
  const assemblyScene = decodeNanoDocument(
    assemblyResult.manifest,
    assemblyResult.mesh,
  );
  assert.equal(assemblyScene.nodes.length, 2);
  assert.equal(assemblyScene.triangleCount, 204);
  assert.ok(
    Math.abs(assemblyScene.nodes[0].matrix[14] - 2.36195284) < 1e-6,
    "nanoPRC omitted the first assembly occurrence placement.",
  );
  assert.ok(
    Math.abs(assemblyScene.nodes[1].matrix[12] - 54.7866744) < 1e-6
      && Math.abs(assemblyScene.nodes[1].matrix[13] + 14.4668851) < 1e-6
      && Math.abs(assemblyScene.nodes[1].matrix[14] - 52.3619528) < 1e-6,
    "nanoPRC omitted the second assembly occurrence placement.",
  );

  console.log(JSON.stringify({
    privateRegression: true,
    decoder: scene.decoder,
    singlePart: {
      vertices: scene.vertexCount,
      triangles: scene.triangleCount,
    },
    assembly: {
      nodes: assemblyScene.nodes.length,
      triangles: assemblyScene.triangleCount,
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
