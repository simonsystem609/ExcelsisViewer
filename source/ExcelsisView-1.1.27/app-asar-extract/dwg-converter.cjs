const fs = require("node:fs/promises");
const path = require("node:path");
const { enforceCacheQuota, hashFileContent, touchCacheEntry } = require("./cache-limits.cjs");
const { runGuardedProcess } = require("./guarded-process.cjs");

const CONVERTER_VERSION = "libredwg-0.14.8492-c34d1efb";
const MAX_DWG_BYTES = 256 * 1024 * 1024;
const MAX_DXF_BYTES = 512 * 1024 * 1024;
const DWG_CACHE_QUOTA_BYTES = 1024 * 1024 * 1024;
const pendingConversions = new Map();

function isDwgPath(filePath) {
  return typeof filePath === "string" && path.extname(filePath).toLowerCase() === ".dwg";
}

function runConverter(executablePath, args, options = {}) {
  const timeoutMs = Number(options.timeoutMs) || 180_000;
  return runGuardedProcess({
    processGuardPath: options.processGuardPath,
    executablePath,
    args,
    cwd: options.cwd,
    timeoutMs,
    memoryMiB: 1024,
    cpuSeconds: 120,
    stderrLimit: 64 * 1024,
    outputLimits: options.outputPath ? [{
      path: options.outputPath,
      maximumBytes: MAX_DXF_BYTES,
    }] : [],
    sandboxReadWriteDirectories: [options.sandboxDirectory],
  });
}

async function fileIsUsable(filePath, maximumBytes = Number.MAX_SAFE_INTEGER) {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile() && stats.size > 128 && stats.size <= maximumBytes;
  } catch {
    return false;
  }
}

async function copyConverterRuntime(converterPath, cacheDirectory) {
  const sourceDirectory = path.dirname(converterPath);
  const runtimeDirectory = path.join(cacheDirectory, "converter-runtime");
  await fs.mkdir(runtimeDirectory, { recursive: true });
  const entries = await fs.readdir(sourceDirectory, { withFileTypes: true });
  const runtimeFiles = entries.filter((entry) => (
    entry.isFile() && /\.(?:dll|exe)$/i.test(entry.name)
  ));
  if (!runtimeFiles.some((entry) => (
    entry.name.toLowerCase() === path.basename(converterPath).toLowerCase()
  ))) {
    throw new Error("The offline DWG converter runtime is incomplete.");
  }
  await Promise.all(runtimeFiles.map((entry) => fs.copyFile(
    path.join(sourceDirectory, entry.name),
    path.join(runtimeDirectory, entry.name),
  )));
  return path.join(runtimeDirectory, path.basename(converterPath));
}

async function convertedDxfPath(sourcePath, options) {
  const resolvedSource = path.resolve(sourcePath);
  if (!isDwgPath(resolvedSource)) throw new Error("Only DWG files can be converted.");

  const converterPath = path.resolve(options.converterPath);
  const cacheRoot = path.resolve(options.cacheRoot);
  const sourceStats = await fs.stat(resolvedSource);
  if (!sourceStats.isFile()) throw new Error("DWG source is not a file.");
  if (sourceStats.size <= 0 || sourceStats.size > MAX_DWG_BYTES) {
    throw new Error("DWG input exceeds the 256 MiB safety limit.");
  }
  if (!(await fileIsUsable(converterPath))) throw new Error("The offline DWG converter is unavailable.");
  if (!(await fileIsUsable(options.processGuardPath))) throw new Error("The native process guard is unavailable.");

  const cacheKey = await hashFileContent(resolvedSource, CONVERTER_VERSION);
  const cacheDirectory = path.join(cacheRoot, cacheKey);
  const outputPath = path.join(cacheDirectory, "model.dxf");

  if (await fileIsUsable(outputPath, MAX_DXF_BYTES)) {
    await touchCacheEntry(cacheDirectory);
    return outputPath;
  }
  if (pendingConversions.has(outputPath)) return pendingConversions.get(outputPath);

  const conversion = (async () => {
    await enforceCacheQuota(cacheRoot, DWG_CACHE_QUOTA_BYTES);
    await fs.mkdir(cacheDirectory, { recursive: true });
    const runDirectory = await fs.mkdtemp(path.join(cacheDirectory, "run-"));
    const inputPath = path.join(runDirectory, "input.dwg");
    const isolatedOutputPath = path.join(runDirectory, "model.dxf");
    await fs.copyFile(resolvedSource, inputPath);
    const isolatedConverterPath = await copyConverterRuntime(
      converterPath,
      runDirectory,
    );
    await runConverter(
      isolatedConverterPath,
      ["-v0", "-y", "-o", isolatedOutputPath, inputPath],
      {
        cwd: path.dirname(isolatedConverterPath),
        timeoutMs: options.timeoutMs,
        processGuardPath: options.processGuardPath,
        outputPath: isolatedOutputPath,
        sandboxDirectory: runDirectory,
      },
    );
    if (!(await fileIsUsable(isolatedOutputPath, MAX_DXF_BYTES))) {
      throw new Error("DWG conversion completed without producing a usable DXF.");
    }
    await fs.copyFile(isolatedOutputPath, outputPath);
    await touchCacheEntry(cacheDirectory);
    await enforceCacheQuota(cacheRoot, DWG_CACHE_QUOTA_BYTES, [cacheDirectory]);
    return outputPath;
  })();

  pendingConversions.set(outputPath, conversion);
  try {
    return await conversion;
  } finally {
    pendingConversions.delete(outputPath);
  }
}

module.exports = {
  CONVERTER_VERSION,
  convertedDxfPath,
  isDwgPath,
};
