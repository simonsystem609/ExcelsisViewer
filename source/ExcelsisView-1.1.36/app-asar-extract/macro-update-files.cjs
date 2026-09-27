const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");
const { MACRO_SOURCES, MAX_MACRO_BYTES } = require("./update-center-utils.cjs");

const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

async function safeDirectory(folder) {
  const entry = await fs.lstat(folder);
  if (!entry.isDirectory() || entry.isSymbolicLink()) {
    throw new Error("The Helper macro folder contains a redirected path.");
  }
  const real = await fs.realpath(folder);
  if (path.resolve(real).toLowerCase() !== path.resolve(folder).toLowerCase()) {
    throw new Error("The Helper macro folder contains a redirected path.");
  }
}

async function safeFile(filePath, maximum = MAX_MACRO_BYTES) {
  const entry = await fs.lstat(filePath);
  if (!entry.isFile() || entry.isSymbolicLink() || entry.size < 32 || entry.size > maximum) {
    throw new Error("A Helper macro or deployment marker is unsafe.");
  }
  const real = await fs.realpath(filePath);
  if (path.resolve(real).toLowerCase() !== path.resolve(filePath).toLowerCase()) {
    throw new Error("A Helper macro or deployment marker is redirected.");
  }
  return entry;
}

async function macroPaths(documentsPath) {
  const documents = path.resolve(String(documentsPath || ""));
  const helper = path.join(documents, "Excelsis Helper");
  const macros = path.join(helper, "Macros");
  const backup = path.join(helper, "macrobackup");
  await safeDirectory(documents);
  await safeDirectory(helper);
  await safeDirectory(macros);
  try { await safeDirectory(backup); } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  return { macros, backup };
}

async function inspectInstalledMacros(documentsPath, helperVersion, names) {
  const folders = await macroPaths(documentsPath);
  const markerPath = path.join(folders.macros, ".bundled-macros.json");
  await safeFile(markerPath, 64 * 1024);
  let marker;
  try { marker = JSON.parse(await fs.readFile(markerPath, "utf8")); } catch {
    throw new Error("Helper's bundled-macro deployment marker is unreadable. Start Helper to repair it.");
  }
  if (marker.schema !== "excelsis-bundled-macros-v2" ||
      marker.appVersion !== helperVersion || !Array.isArray(marker.files)) {
    throw new Error("Start Helper once after installing its latest version before updating macros.");
  }
  const current = [];
  for (const name of names) {
    if (!Object.hasOwn(MACRO_SOURCES, name) || !marker.files.includes(name)) {
      throw new Error("The requested macro is not part of this Helper installation.");
    }
    const filePath = path.join(folders.macros, name);
    await safeFile(filePath);
    current.push({ name, sha256: hash(await fs.readFile(filePath)) });
  }
  return { ...folders, current };
}

function isMacroLockError(error) {
  return ["EPERM", "EACCES", "EBUSY"].includes(error?.code);
}

async function replaceInstalledMacros(documentsPath, helperVersion, revision, assets) {
  if (!/^20\d{6}\.\d{1,4}$/.test(revision) || !Array.isArray(assets) ||
      assets.length < 1 || assets.length > Object.keys(MACRO_SOURCES).length) {
    throw new Error("The macro revision or asset list is invalid.");
  }
  const names = assets.map((asset) => asset.name);
  if (new Set(names).size !== names.length) throw new Error("The macro revision repeats an asset.");
  for (const asset of assets) {
    if (!Object.hasOwn(MACRO_SOURCES, asset.name) || !Buffer.isBuffer(asset.bytes) ||
        asset.bytes.length < 32 || asset.bytes.length > MAX_MACRO_BYTES ||
        hash(asset.bytes) !== asset.sha256) {
      throw new Error("The macro revision did not pass SHA-256 or file validation.");
    }
  }
  const folders = await inspectInstalledMacros(documentsPath, helperVersion, names);
  const changes = assets.filter((asset) => (
    folders.current.find((item) => item.name === asset.name).sha256 !== asset.sha256
  ));
  if (!changes.length) return { updated: [], alreadyCurrent: true };
  const transactionId = crypto.randomUUID();
  await fs.mkdir(folders.backup, { recursive: true });
  await safeDirectory(folders.backup);
  const viewerBackup = path.join(folders.backup, "viewer-update");
  await fs.mkdir(viewerBackup, { recursive: true });
  await safeDirectory(viewerBackup);
  const backupFolder = path.join(viewerBackup, `${revision}-${transactionId}`);
  await fs.mkdir(backupFolder);
  await safeDirectory(backupFolder);

  const prepared = changes.map((asset) => ({
    ...asset,
    target: path.join(folders.macros, asset.name),
    staged: path.join(folders.macros, `.${asset.name}.${transactionId}.part`),
    backup: path.join(backupFolder, asset.name),
    rollbackStage: path.join(folders.macros, `.${asset.name}.${transactionId}.rollback`),
  }));
  const replaced = [];
  try {
    for (const item of prepared) {
      await fs.writeFile(item.staged, item.bytes, { flag: "wx", mode: 0o600 });
      await safeFile(item.staged);
      if (hash(await fs.readFile(item.staged)) !== item.sha256) {
        throw new Error("The staged macro changed before installation.");
      }
      await safeFile(item.target);
      await fs.copyFile(item.target, item.backup, fsSync.constants.COPYFILE_EXCL);
      await safeFile(item.backup);
    }
    for (const item of prepared) {
      const original = folders.current.find((entry) => entry.name === item.name);
      await safeFile(item.target);
      if (hash(await fs.readFile(item.target)) !== original.sha256) {
        throw new Error("A macro changed during the update. No further files were replaced.");
      }
      await fs.rename(item.staged, item.target);
      replaced.push(item);
      if (hash(await fs.readFile(item.target)) !== item.sha256) {
        throw new Error("The installed macro failed SHA-256 read-back.");
      }
    }
    await fs.writeFile(path.join(backupFolder, "completed.json"), JSON.stringify({
      schema: "excelsis-viewer-macro-update-v1", helperVersion, revision,
      updated: prepared.map((item) => item.name), completedAt: new Date().toISOString(),
    }, null, 2), { flag: "wx" });
    return { updated: prepared.map((item) => item.name), alreadyCurrent: false, backupFolder };
  } catch (error) {
    const rollbackErrors = [];
    for (const item of replaced.reverse()) {
      try {
        await fs.copyFile(item.backup, item.rollbackStage, fsSync.constants.COPYFILE_EXCL);
        await fs.rename(item.rollbackStage, item.target);
        if (hash(await fs.readFile(item.target)) !==
            folders.current.find((entry) => entry.name === item.name).sha256) {
          throw new Error("Original macro read-back failed.");
        }
      } catch (rollbackError) {
        rollbackErrors.push(`${item.name}: ${rollbackError.message}`);
      }
    }
    if (rollbackErrors.length) {
      throw new Error(`Macro rollback needs manual attention. Originals are in ${backupFolder}. ${rollbackErrors.join("; ")}`);
    }
    error.backupFolder = backupFolder;
    throw error;
  } finally {
    for (const item of prepared) {
      await fs.rm(item.staged, { force: true }).catch(() => {});
      await fs.rm(item.rollbackStage, { force: true }).catch(() => {});
    }
  }
}

module.exports = { inspectInstalledMacros, isMacroLockError, replaceInstalledMacros };
