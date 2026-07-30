const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const {
  decodeU3dStream,
  detectEmbedded3dMarker,
} = require("../u3d-bridge.cjs");

async function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const workspaceRoot = path.resolve(projectRoot, "..", "..");
  const samplePdf = path.join(
    workspaceRoot,
    "u3d",
    "upstream",
    "Samples",
    "TestScenes",
    "box_group.pdf",
  );
  const runtimeRoot = path.join(projectRoot, "modules", "3dpdf", "native", "u3d");
  const runtimePaths = {
    exporterPath: path.join(runtimeRoot, "u3d_app_export.exe"),
    dependencyPaths: [
      path.join(runtimeRoot, "IFXCore.dll"),
      path.join(runtimeRoot, "IFXImporting.dll"),
      path.join(runtimeRoot, "libwinpthread-1.dll"),
    ],
  };
  const processGuardPath = path.join(projectRoot, "native", "process-guard.exe");
  const marker = await detectEmbedded3dMarker(samplePdf);
  assert.equal(marker, "u3d");

  const workerModule = await import(pathToFileURL(
    path.join(projectRoot, "modules", "3dpdf", "u3d-pdf-worker.mjs"),
  ));
  const extracted = await workerModule.extractU3dStream(await fs.readFile(samplePdf));
  assert.equal(extracted.streamCount, 1);
  assert.deepEqual(
    [...new Uint8Array(extracted.bytes, 0, 4)],
    [0x55, 0x33, 0x44, 0x00],
  );

  const cacheRoot = await fs.mkdtemp(path.join(os.tmpdir(), "excelsis-u3d-test-"));
  const payload = await decodeU3dStream({
    u3dBytes: extracted.bytes,
    runtimePaths,
    cacheRoot,
    processGuardPath,
  });
  const sceneModule = await import(pathToFileURL(
    path.join(projectRoot, "modules", "3dpdf", "nano-prc.mjs"),
  ));
  const scene = sceneModule.decodeNanoDocument(payload.manifest, payload.mesh);
  assert.equal(scene.geometries.length, 1);
  assert.equal(scene.nodes.length, 2);
  assert.equal(scene.triangleCount, 24);
  assert.equal(scene.vertexCount, 16);
  assert(scene.components.some(({ name }) => name === "Box_Group"));
  assert(scene.components.some(({ name }) => name === "Box01"));
  assert(scene.components.some(({ name }) => name === "Box02"));
  assert.notDeepEqual(scene.nodes[0].matrix, scene.nodes[1].matrix);

  console.log(JSON.stringify({
    cacheKey: payload.cacheKey,
    components: scene.components.length,
    instances: scene.instanceCount,
    triangles: scene.triangleCount,
    vertices: scene.vertexCount,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

