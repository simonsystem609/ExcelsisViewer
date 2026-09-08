const fs = require("node:fs/promises");
const path = require("node:path");
const { enforceCacheQuota, hashFileContent, touchCacheEntry } = require("./cache-limits.cjs");
const { runGuardedProcess } = require("./guarded-process.cjs");

const CACHE_FORMAT = "excelsis-nanoprc-bridge-2026-07-26-4";
const MAX_PDF_BYTES = 512 * 1024 * 1024;
const MAX_MANIFEST_BYTES = 64 * 1024 * 1024;
const MAX_MESH_BYTES = 768 * 1024 * 1024;
const MAX_MESHES = 100_000;
const MAX_VERTICES = 50_000_000;
const MAX_TRIANGLES = 100_000_000;
const MAX_COMPONENTS = 2_000_000;
const MAX_TREE_DEPTH = 2048;
const PRC_CACHE_QUOTA_BYTES = 4 * 1024 * 1024 * 1024;
const activeDecodes = new Map();

async function fileExistsWithBytes(filePath, minimumBytes = 1) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile() && stat.size >= minimumBytes;
  } catch {
    return false;
  }
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
    return manifest?.format === "Excelsis nanoPRC bridge 1" &&
      meshHeader?.subarray(0, 8).equals(Buffer.from("NPRCM01\0", "binary"));
  } catch {
    return false;
  }
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

async function cacheKeyFor(filePath, exporterPath) {
  const exporterHash = await hashFileContent(exporterPath, CACHE_FORMAT);
  return hashFileContent(filePath, `${CACHE_FORMAT}:${exporterHash}`);
}

function validateManifestComplexity(manifest) {
  if (manifest?.format !== "Excelsis nanoPRC bridge 1") {
    throw new Error("nanoPRC manifest format is invalid.");
  }
  if (!Number.isInteger(manifest.mesh_count) ||
      manifest.mesh_count < 0 || manifest.mesh_count > MAX_MESHES) {
    throw new Error("nanoPRC mesh count exceeds the safety limit.");
  }
  if (!manifest.model_tree) return;
  const stack = [{ node: manifest.model_tree, depth: 1 }];
  let components = 0;
  while (stack.length) {
    const { node, depth } = stack.pop();
    components += 1;
    if (components > MAX_COMPONENTS) {
      throw new Error("nanoPRC component tree exceeds the safety limit.");
    }
    if (depth > MAX_TREE_DEPTH) {
      throw new Error("nanoPRC component tree is too deeply nested.");
    }
    const children = Array.isArray(node?.children) ? node.children : [];
    for (const child of children) stack.push({ node: child, depth: depth + 1 });
  }
}

function validateMeshComplexity(mesh, expectedMeshCount) {
  if (mesh.length < 16 || !mesh.subarray(0, 8).equals(Buffer.from("NPRCM01\0", "binary"))) {
    throw new Error("nanoPRC mesh output has an invalid signature.");
  }
  if (mesh.readUInt32LE(8) !== 1) throw new Error("nanoPRC mesh output version is unsupported.");
  const meshCount = mesh.readUInt32LE(12);
  if (meshCount !== expectedMeshCount || meshCount > MAX_MESHES) {
    throw new Error("nanoPRC mesh count is inconsistent.");
  }
  let offset = 16;
  let totalVertices = 0;
  let totalTriangles = 0;
  for (let index = 0; index < meshCount; index += 1) {
    if (offset + 16 > mesh.length) throw new Error("nanoPRC mesh header is truncated.");
    const vertexCount = mesh.readUInt32LE(offset + 4);
    const indexCount = mesh.readUInt32LE(offset + 8);
    if (indexCount % 3 !== 0) throw new Error("nanoPRC triangle index count is invalid.");
    totalVertices += vertexCount;
    totalTriangles += indexCount / 3;
    if (totalVertices > MAX_VERTICES || totalTriangles > MAX_TRIANGLES) {
      throw new Error("nanoPRC geometry exceeds the safety complexity limit.");
    }
    const payloadBytes = vertexCount * 12 + indexCount * 4;
    offset += 16;
    if (!Number.isSafeInteger(payloadBytes) || offset + payloadBytes > mesh.length) {
      throw new Error("nanoPRC mesh payload is truncated.");
    }
    offset += payloadBytes;
  }
  if (offset !== mesh.length) throw new Error("nanoPRC mesh output has trailing data.");
}

async function fileContainsPrcMarker(filePath) {
  const handle = await fs.open(path.resolve(filePath), "r");
  const marker = Buffer.from("/PRC", "ascii");
  const chunk = Buffer.alloc(1024 * 1024 + marker.length - 1);
  let carry = 0;
  let position = 0;
  try {
    while (true) {
      const result = await handle.read(
        chunk,
        carry,
        chunk.length - carry,
        position,
      );
      if (result.bytesRead === 0) return false;
      const used = carry + result.bytesRead;
      if (chunk.subarray(0, used).indexOf(marker) >= 0) return true;
      carry = Math.min(marker.length - 1, used);
      chunk.copy(chunk, 0, used - carry, used);
      position += result.bytesRead;
    }
  } finally {
    await handle.close();
  }
}

async function decodePrcFile({ filePath, exporterPath, cacheRoot, processGuardPath }) {
  const resolved = path.resolve(filePath);
  if (path.extname(resolved).toLowerCase() !== ".pdf") {
    throw new Error("nanoPRC accepts PDF files only.");
  }
  if (!await fileExistsWithBytes(exporterPath)) {
    throw new Error("The packaged nanoPRC decoder is missing.");
  }
  if (!await fileExistsWithBytes(processGuardPath)) {
    throw new Error("The native process guard is missing.");
  }
  const sourceStat = await fs.stat(resolved);
  if (!sourceStat.isFile() || sourceStat.size <= 0 || sourceStat.size > MAX_PDF_BYTES) {
    throw new Error("3D PDF input exceeds the 512 MiB safety limit.");
  }

  const cacheKey = await cacheKeyFor(resolved, exporterPath);
  if (activeDecodes.has(cacheKey)) return activeDecodes.get(cacheKey);

  const decodePromise = (async () => {
    const cacheDirectory = path.join(cacheRoot, cacheKey);
    const manifestPath = path.join(cacheDirectory, "model.json");
    const meshPath = path.join(cacheDirectory, "model.mesh");
    await enforceCacheQuota(cacheRoot, PRC_CACHE_QUOTA_BYTES);
    await fs.mkdir(cacheDirectory, { recursive: true });

    if (!await cacheIsValid(manifestPath, meshPath)) {
      const runDirectory = await fs.mkdtemp(path.join(cacheDirectory, "run-"));
      const isolatedExporterPath = path.join(
        runDirectory,
        "nano_prc_app_export.exe",
      );
      const isolatedInputPath = path.join(runDirectory, "input.pdf");
      const isolatedManifestPath = path.join(runDirectory, "model.json");
      const isolatedMeshPath = path.join(runDirectory, "model.mesh");
      // The native API accepts narrow paths on Windows.  An ASCII cache name
      // also makes accented Hungarian source paths reliable.
      await Promise.all([
        fs.copyFile(exporterPath, isolatedExporterPath),
        fs.copyFile(resolved, isolatedInputPath),
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
        throw new Error("nanoPRC produced an invalid application bridge file.");
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
    await enforceCacheQuota(cacheRoot, PRC_CACHE_QUOTA_BYTES, [cacheDirectory]);
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
  decodePrcFile,
  fileContainsPrcMarker,
  runExporter,
};
