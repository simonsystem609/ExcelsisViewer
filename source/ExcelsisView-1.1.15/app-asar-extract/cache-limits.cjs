const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

async function hashFileContent(filePath, namespace) {
  const hash = crypto.createHash("sha256");
  hash.update(String(namespace || ""));
  hash.update("\0");
  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.once("error", reject);
    stream.once("end", resolve);
  });
  return hash.digest("hex");
}

async function treeStats(rootPath) {
  let bytes = 0;
  let newestMtimeMs = 0;
  const entries = await fsp.readdir(rootPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      const nested = await treeStats(entryPath);
      bytes += nested.bytes;
      newestMtimeMs = Math.max(newestMtimeMs, nested.newestMtimeMs);
    } else if (entry.isFile()) {
      const stat = await fsp.stat(entryPath);
      bytes += stat.size;
      newestMtimeMs = Math.max(newestMtimeMs, stat.mtimeMs);
    }
  }
  return { bytes, newestMtimeMs };
}

function assertDirectCacheChild(cacheRoot, candidatePath) {
  const resolvedRoot = path.resolve(cacheRoot);
  const resolvedCandidate = path.resolve(candidatePath);
  if (path.dirname(resolvedCandidate).toLowerCase() !== resolvedRoot.toLowerCase() ||
      !/^[a-f0-9]{64}$/i.test(path.basename(resolvedCandidate))) {
    throw new Error("Refusing to evict a path outside the bounded cache.");
  }
}

async function removeGeneratedCacheTree(cacheRoot, candidatePath) {
  assertDirectCacheChild(cacheRoot, candidatePath);
  const entries = await fsp.readdir(candidatePath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(candidatePath, entry.name);
    if (entry.isDirectory()) {
      await removeNestedGeneratedDirectory(candidatePath, entryPath);
    } else {
      await fsp.unlink(entryPath);
    }
  }
  await fsp.rmdir(candidatePath);
}

async function removeNestedGeneratedDirectory(cacheEntryRoot, directoryPath) {
  const relative = path.relative(cacheEntryRoot, directoryPath);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Refusing to evict an invalid nested cache path.");
  }
  const entries = await fsp.readdir(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) await removeNestedGeneratedDirectory(cacheEntryRoot, entryPath);
    else await fsp.unlink(entryPath);
  }
  await fsp.rmdir(directoryPath);
}

async function enforceCacheQuota(cacheRoot, maximumBytes, preserve = []) {
  await fsp.mkdir(cacheRoot, { recursive: true });
  const preserveSet = new Set(preserve.map((entry) => path.resolve(entry).toLowerCase()));
  const entries = [];
  let totalBytes = 0;
  for (const dirent of await fsp.readdir(cacheRoot, { withFileTypes: true })) {
    if (!dirent.isDirectory() || !/^[a-f0-9]{64}$/i.test(dirent.name)) continue;
    const entryPath = path.join(cacheRoot, dirent.name);
    const stats = await treeStats(entryPath);
    totalBytes += stats.bytes;
    entries.push({ path: entryPath, ...stats });
  }
  entries.sort((left, right) => left.newestMtimeMs - right.newestMtimeMs);
  for (const entry of entries) {
    if (totalBytes <= maximumBytes) break;
    if (preserveSet.has(path.resolve(entry.path).toLowerCase())) continue;
    await removeGeneratedCacheTree(cacheRoot, entry.path);
    totalBytes -= entry.bytes;
  }
  if (totalBytes > maximumBytes) {
    throw new Error("Decoder cache quota is exhausted.");
  }
  return totalBytes;
}

async function touchCacheEntry(directoryPath) {
  const now = new Date();
  for (const entry of await fsp.readdir(directoryPath, { withFileTypes: true })) {
    if (entry.isFile()) await fsp.utimes(path.join(directoryPath, entry.name), now, now);
  }
}

module.exports = {
  enforceCacheQuota,
  hashFileContent,
  touchCacheEntry,
};
