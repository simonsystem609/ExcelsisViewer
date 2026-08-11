const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const { enforceCacheQuota, hashFileContent, touchCacheEntry } = require("./cache-limits.cjs");
const { runGuardedProcess } = require("./guarded-process.cjs");

const CACHE_FORMAT = "excelsis-u3d-bridge-2026-07-30-1";
const MAX_U3D_BYTES = 512 * 1024 * 1024;
const MAX_MANIFEST_BYTES = 64 * 1024 * 1024;
const MAX_MESH_BYTES = 768 * 1024 * 1024;
const MAX_MESHES = 100_000;
const MAX_VERTICES = 50_000_000;
const MAX_TRIANGLES = 100_000_000;
const MAX_COMPONENTS = 2_000_000;
const MAX_TREE_DEPTH = 2048;
const U3D_CACHE_QUOTA_BYTES = 4 * 1024 * 1024 * 1024;
const U3D_HEADER = Buffer.from([0x55, 0x33, 0x44, 0x00]);
const MESH_HEADER = Buffer.from([0x55, 0x33, 0x44, 0x4d, 0x30, 0x31, 0x00, 0x00]);
const activeDecodes = new Map();

function asBoundedU3dBuffer(value) {
  const bytes = Buffer.from(value instanceof ArrayBuffer
    ? new Uint8Array(value)
    : value);
  if (bytes.length < U3D_HEADER.length || bytes.length > MAX_U3D_BYTES) {
    throw new Error("U3D input exceeds the 512 MiB safety limit.");
  }
  if (!bytes.subarray(0, U3D_HEADER.length).equals(U3D_HEADER)) {
    throw new Error("The embedded 3D stream is not an ECMA-363 U3D stream.");
  }
  return bytes;
}

async function fileExistsWithBytes(filePath, minimumBytes = 1) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile() && stat.size >= minimumBytes;
  } catch {
    return false;
  }
}

async function runtimeIsAvailable(runtimePaths) {
  const files = [
    runtimePaths?.exporterPath,
    ...(runtimePaths?.dependencyPaths || []),
  ];
  if (files.length < 2) return false;
  const states = await Promise.all(files.map((filePath) => fileExistsWithBytes(filePath)));
  return states.every(Boolean);
}

async function cacheIsValid(manifestPath, meshPath) {
  const [manifestStat, meshStat] = await Promise.all([
    fs.stat(manifestPath).catch(() => null),
    fs.stat(meshPath).catch(() => null),
  ]);
  if (!manifestStat?.isFile() || manifestStat.size < 32 || manifestStat.size > MAX_MANIFEST_BYTES ||
      !meshStat?.isFile() || meshStat.size < 16 || meshStat.size > MAX_MESH_BYTES) {
    return false;
  }
  try {
    const [manifestText, meshHeader] = await Promise.all([
      fs.readFile(manifestPath, "utf8"),
      fs.open(meshPath, "r").then(async (handle) => {
        try {
          const bytes = Buffer.alloc(16);
          const result = await handle.read(bytes, 0, bytes.length, 0);
          return result.bytesRead === bytes.length ? bytes : null;
        } finally {
          await handle.close();
        }
      }),
    ]);
    const manifest = JSON.parse(manifestText);
    return manifest?.format === "Excelsis U3D bridge 1" &&
      meshHeader?.subarray(0, MESH_HEADER.length).equals(MESH_HEADER);
  } catch {
    return false;
  }
}

function validateManifestComplexity(manifest) {
  if (manifest?.format !== "Excelsis U3D bridge 1") {
    throw new Error("U3D manifest format is invalid.");
  }
  if (!Number.isInteger(manifest.mesh_count) ||
      manifest.mesh_count < 0 || manifest.mesh_count > MAX_MESHES) {
    throw new Error("U3D mesh count exceeds the safety limit.");
  }
  if (!manifest.model_tree) return;
  const stack = [{ node: manifest.model_tree, depth: 1 }];
  let components = 0;
  while (stack.length) {
    const { node, depth } = stack.pop();
    components += 1;
    if (components > MAX_COMPONENTS) {
      throw new Error("U3D component tree exceeds the safety limit.");
    }
    if (depth > MAX_TREE_DEPTH) {
      throw new Error("U3D component tree is too deeply nested.");
    }
    const children = Array.isArray(node?.children) ? node.children : [];
    for (const child of children) stack.push({ node: child, depth: depth + 1 });
  }
}

function validateMeshComplexity(mesh, expectedMeshCount) {
  if (mesh.length < 16 || !mesh.subarray(0, MESH_HEADER.length).equals(MESH_HEADER)) {
    throw new Error("U3D mesh output has an invalid signature.");
  }
  if (mesh.readUInt32LE(8) !== 1) throw new Error("U3D mesh output version is unsupported.");
  const meshCount = mesh.readUInt32LE(12);
  if (meshCount !== expectedMeshCount || meshCount > MAX_MESHES) {
    throw new Error("U3D mesh count is inconsistent.");
  }
  let offset = 16;
  let totalVertices = 0;
  let totalTriangles = 0;
  for (let index = 0; index < meshCount; index += 1) {
    if (offset + 16 > mesh.length) throw new Error("U3D mesh header is truncated.");
    const vertexCount = mesh.readUInt32LE(offset + 4);
    const indexCount = mesh.readUInt32LE(offset + 8);
    if (indexCount % 3 !== 0) throw new Error("U3D triangle index count is invalid.");
    totalVertices += vertexCount;
    totalTriangles += indexCount / 3;
    if (totalVertices > MAX_VERTICES || totalTriangles > MAX_TRIANGLES) {
      throw new Error("U3D geometry exceeds the safety complexity limit.");
    }
    const payloadBytes = vertexCount * 12 + indexCount * 4;
    offset += 16;
    if (!Number.isSafeInteger(payloadBytes) || offset + payloadBytes > mesh.length) {
      throw new Error("U3D mesh payload is truncated.");
    }
    offset += payloadBytes;
  }
  if (offset !== mesh.length) throw new Error("U3D mesh output has trailing data.");
}

async function detectEmbedded3dMarker(filePath) {
  const handle = await fs.open(path.resolve(filePath), "r");
  const markers = [
    { bytes: Buffer.from("/PRC", "ascii"), format: "prc" },
    { bytes: Buffer.from("/U3D", "ascii"), format: "u3d" },
  ];
  const overlap = Math.max(...markers.map(({ bytes }) => bytes.length)) - 1;
  const chunk = Buffer.alloc(1024 * 1024 + overlap);
  let carry = 0;
  let position = 0;
  try {
    while (true) {
      const result = await handle.read(chunk, carry, chunk.length - carry, position);
      if (result.bytesRead === 0) return null;
      const used = carry + result.bytesRead;
      const window = chunk.subarray(0, used);
      const matches = markers
        .map((entry) => ({ ...entry, index: window.indexOf(entry.bytes) }))
        .filter(({ index }) => index >= 0)
        .sort((first, second) => first.index - second.index);
      if (matches.length) return matches[0].format;
      carry = Math.min(overlap, used);
      chunk.copy(chunk, 0, used - carry, used);
      position += result.bytesRead;
    }
  } finally {
    await handle.close();
  }
}

async function fileContainsU3dMarker(filePath) {
  return await detectEmbedded3dMarker(filePath) === "u3d";
}

async function cacheKeyFor(u3dBytes, runtimePaths) {
  const runtimeHashes = await Promise.all([
    runtimePaths.exporterPath,
    ...runtimePaths.dependencyPaths,
  ].map((filePath) => hashFileContent(filePath, CACHE_FORMAT)));
  return crypto
    .createHash("sha256")
    .update(CACHE_FORMAT)
    .update(runtimeHashes.join(":"))
    .update(u3dBytes)
    .digest("hex");
}

function runExporter(exporterPath, inputPath, manifestPath, meshPath, options = {}) {
  return runGuardedProcess({
    processGuardPath: options.processGuardPath,
    executablePath: exporterPath,
    args: [inputPath, manifestPath, meshPath],
    cwd: path.dirname(exporterPath),
    timeoutMs: 10 * 60 * 1000,
    memoryMiB: 3072,
    cpuSeconds: 600,
    stderrLimit: 128 * 1024,
    outputLimits: [
      { path: manifestPath, maximumBytes: MAX_MANIFEST_BYTES },
      { path: meshPath, maximumBytes: MAX_MESH_BYTES },
    ],
    sandboxReadWriteDirectories: [options.sandboxDirectory],
  });
}

async function decodeU3dStream({
  u3dBytes: value,
  runtimePaths,
  cacheRoot,
  processGuardPath,
}) {
  const u3dBytes = asBoundedU3dBuffer(value);
  if (!await runtimeIsAvailable(runtimePaths)) {
    throw new Error("The packaged U3D decoder is missing.");
  }
  if (!await fileExistsWithBytes(processGuardPath)) {
    throw new Error("The native process guard is missing.");
  }

  const cacheKey = await cacheKeyFor(u3dBytes, runtimePaths);
  if (activeDecodes.has(cacheKey)) return activeDecodes.get(cacheKey);

  const decodePromise = (async () => {
    const cacheDirectory = path.join(cacheRoot, cacheKey);
    const manifestPath = path.join(cacheDirectory, "model.json");
    const meshPath = path.join(cacheDirectory, "model.mesh");
    await enforceCacheQuota(cacheRoot, U3D_CACHE_QUOTA_BYTES);
    await fs.mkdir(cacheDirectory, { recursive: true });

    if (!await cacheIsValid(manifestPath, meshPath)) {
      const runDirectory = await fs.mkdtemp(path.join(cacheDirectory, "run-"));
      const isolatedExporterPath = path.join(runDirectory, "u3d_app_export.exe");
      const isolatedInputPath = path.join(runDirectory, "input.u3d");
      const isolatedManifestPath = path.join(runDirectory, "model.json");
      const isolatedMeshPath = path.join(runDirectory, "model.mesh");
      await Promise.all([
        fs.copyFile(runtimePaths.exporterPath, isolatedExporterPath),
        ...runtimePaths.dependencyPaths.map((dependencyPath) =>
          fs.copyFile(dependencyPath, path.join(runDirectory, path.basename(dependencyPath)))),
        fs.writeFile(isolatedInputPath, u3dBytes),
      ]);
      await runExporter(
        isolatedExporterPath,
        isolatedInputPath,
        isolatedManifestPath,
        isolatedMeshPath,
        {
          processGuardPath,
          sandboxDirectory: runDirectory,
        },
      );
      if (!await cacheIsValid(isolatedManifestPath, isolatedMeshPath)) {
        throw new Error("U3D produced an invalid application bridge file.");
      }
      await Promise.all([
        fs.copyFile(isolatedManifestPath, manifestPath),
        fs.copyFile(isolatedMeshPath, meshPath),
      ]);
    }

    const [manifest, mesh] = await Promise.all([
      fs.readFile(manifestPath, "utf8"),
      fs.readFile(meshPath),
    ]);
    const parsedManifest = JSON.parse(manifest);
    validateManifestComplexity(parsedManifest);
    validateMeshComplexity(mesh, parsedManifest.mesh_count);
    await touchCacheEntry(cacheDirectory);
    await enforceCacheQuota(cacheRoot, U3D_CACHE_QUOTA_BYTES, [cacheDirectory]);
    return { manifest, mesh, cacheKey };
  })();

  activeDecodes.set(cacheKey, decodePromise);
  try {
    return await decodePromise;
  } finally {
    activeDecodes.delete(cacheKey);
  }
}

module.exports = {
  CACHE_FORMAT,
  cacheIsValid,
  decodeU3dStream,
  detectEmbedded3dMarker,
  fileContainsU3dMarker,
  runExporter,
};
