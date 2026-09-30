const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const {
  decodeU3dStream,
  detectEmbedded3dMarker,
} = require("../u3d-bridge.cjs");

function findTexturePayload(u3dBytes, signature, description) {
  const textureContinuationType = 0xffffff5c;
  let blockOffset = 0;
  while (blockOffset + 12 <= u3dBytes.length) {
    const blockType = u3dBytes.readUInt32LE(blockOffset);
    const dataSize = u3dBytes.readUInt32LE(blockOffset + 4);
    const metadataSize = u3dBytes.readUInt32LE(blockOffset + 8);
    const dataOffset = blockOffset + 12;
    const paddedDataSize = (dataSize + 3) & ~3;
    const paddedMetadataSize = (metadataSize + 3) & ~3;
    const nextOffset = dataOffset + paddedDataSize + paddedMetadataSize;
    assert.ok(
      nextOffset <= u3dBytes.length,
      "Upstream U3D fixture has a truncated block.",
    );
    if (blockType === textureContinuationType) {
      const payloadOffset = u3dBytes.indexOf(signature, dataOffset);
      if (payloadOffset >= dataOffset && payloadOffset < dataOffset + dataSize) {
        return {
          dataEnd: dataOffset + dataSize,
          payloadOffset,
        };
      }
    }
    blockOffset = nextOffset;
  }
  assert.fail(`No ${description} texture continuation was found.`);
}

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

  const texturedU3d = await fs.readFile(path.join(
    workspaceRoot,
    "u3d",
    "upstream",
    "Samples",
    "TestScenes",
    "ColorChannels.u3d",
  ));
  const texturedPayload = await decodeU3dStream({
    u3dBytes: texturedU3d,
    runtimePaths,
    cacheRoot,
    processGuardPath,
  });
  assert.equal(JSON.parse(texturedPayload.manifest).mesh_count, 1);

  const jpegPayload = findTexturePayload(
    texturedU3d,
    Buffer.from([0xff, 0xd8, 0xff]),
    "JPEG",
  );
  const bytesAfterJpegHeader =
    jpegPayload.dataEnd - jpegPayload.payloadOffset;
  const truncatedTexture = texturedU3d.subarray(
    0,
    jpegPayload.payloadOffset +
      Math.max(4, Math.floor(bytesAfterJpegHeader / 2)),
  );
  await assert.rejects(
    decodeU3dStream({
      u3dBytes: truncatedTexture,
      runtimePaths,
      cacheRoot,
      processGuardPath,
    }),
    /U3D|decode|exited|failed|invalid/i,
    "A truncated JPEG texture continuation must be rejected.",
  );

  const pngTexturedU3d = await fs.readFile(path.join(
    workspaceRoot,
    "u3d",
    "upstream",
    "Samples",
    "TestScenes",
    "shading_alpha.u3d",
  ));
  const pngTexturedPayload = await decodeU3dStream({
    u3dBytes: pngTexturedU3d,
    runtimePaths,
    cacheRoot,
    processGuardPath,
  });
  assert.equal(JSON.parse(pngTexturedPayload.manifest).mesh_count, 1);

  const pngPayload = findTexturePayload(
    pngTexturedU3d,
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    "PNG",
  );
  const bytesAfterPngHeader = pngPayload.dataEnd - pngPayload.payloadOffset;
  const truncatedPngTexture = pngTexturedU3d.subarray(
    0,
    pngPayload.payloadOffset +
      Math.max(8, Math.floor(bytesAfterPngHeader / 2)),
  );
  await assert.rejects(
    decodeU3dStream({
      u3dBytes: truncatedPngTexture,
      runtimePaths,
      cacheRoot,
      processGuardPath,
    }),
    /U3D|decode|exited|failed|invalid/i,
    "A truncated PNG texture continuation must be rejected.",
  );

  console.log(JSON.stringify({
    cacheKey: payload.cacheKey,
    components: scene.components.length,
    instances: scene.instanceCount,
    triangles: scene.triangleCount,
    vertices: scene.vertexCount,
    texturedMeshes: JSON.parse(texturedPayload.manifest).mesh_count,
    pngTexturedMeshes: JSON.parse(pngTexturedPayload.manifest).mesh_count,
    truncatedTextureRejected: true,
    truncatedPngTextureRejected: true,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
