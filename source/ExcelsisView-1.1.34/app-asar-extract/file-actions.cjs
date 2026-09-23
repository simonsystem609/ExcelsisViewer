const path = require("node:path");
const fs = require("node:fs/promises");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

function renamedDocumentPath(sourcePath, newName) {
  const extension = path.extname(sourcePath);
  if (!path.isAbsolute(sourcePath) || !/^\.(dxf|dwg|pdf)$/i.test(extension)) {
    throw new Error("Only the current DXF, DWG or PDF can be renamed.");
  }
  if (typeof newName !== "string" || !newName.trim() || newName.length > 255 ||
      /[<>:"/\\|?*\x00-\x1f]/.test(newName) || /[. ]$/.test(newName) ||
      /^(con|prn|aux|nul|conin\$|conout\$|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(newName)) {
    throw new Error("Enter a valid filename, without folders or Windows reserved characters/names.");
  }
  if (path.extname(newName).toLowerCase() !== extension.toLowerCase() ||
      !path.basename(newName, path.extname(newName)).trim()) {
    throw new Error(`Keep the ${extension} extension; rename does not convert the file type.`);
  }
  return path.join(path.dirname(sourcePath), newName);
}

// Rename-Item uses the Windows no-replace rename operation, including case-only
// renames. Never use fs.rename here: it can overwrite an existing destination.
// Paths are encoded as JSON data, not interpolated into executable PowerShell.
async function renameWithoutOverwrite(sourcePath, destinationPath) {
  if (process.platform !== "win32") throw new Error("File rename is supported on Windows only.");
  const payload = Buffer.from(JSON.stringify({ sourcePath, name: path.basename(destinationPath) }), "utf8").toString("base64");
  const script = `$ErrorActionPreference = 'Stop'; try {
    $renameData = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${payload}')) | ConvertFrom-Json
    Rename-Item -LiteralPath $renameData.sourcePath -NewName $renameData.name -ErrorAction Stop
  } catch { [Console]::Error.WriteLine($_.Exception.Message); exit 1 }`;
  try {
    const powershellRoot = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "WindowsPowerShell", "v1.0");
    await promisify(execFile)(path.join(powershellRoot, "powershell.exe"),
      ["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")],
      { windowsHide: true, maxBuffer: 64 * 1024, env: { ...process.env, PSModulePath: path.join(powershellRoot, "Modules") } });
  } catch (error) {
    throw new Error(String(error.stderr || "The file could not be renamed. Check its permissions and whether that name already exists.").trim());
  }
}

function createFileActions({ assertCurrent, rename = renameWithoutOverwrite, trash, io = fs }) {
  const owners = new Set();
  const paths = new Set();
  const key = (value) => path.resolve(value).toLowerCase();
  const isBusy = (owner, filePath) => owners.has(owner) || (filePath && paths.has(key(filePath)));

  async function run(owner, sourcePath, action, newName) {
    if (!path.isAbsolute(sourcePath) || !/^\.(dxf|dwg|pdf)$/i.test(path.extname(sourcePath))) {
      throw new Error("Only the current DXF, DWG or PDF can be changed.");
    }
    if (action !== "rename" && action !== "delete") throw new Error("Unknown file action.");
    const destination = action === "rename" ? renamedDocumentPath(sourcePath, newName) : null;
    if (isBusy(owner, sourcePath) || (destination && paths.has(key(destination)))) {
      throw new Error("Another file operation is in progress. Please try again.");
    }
    const claim = assertCurrent(owner, sourcePath, destination);
    owners.add(owner);
    paths.add(key(sourcePath));
    if (destination) paths.add(key(destination));
    try {
      const stat = await io.lstat(sourcePath);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("Only regular files can be renamed or deleted.");
      if (destination && key(destination) !== key(sourcePath)) {
        const existing = await io.lstat(destination).catch((error) => {
          if (error.code === "ENOENT") return null;
          throw error;
        });
        if (existing) throw new Error("A file with that name already exists. Choose a different name.");
      }
      if (assertCurrent(owner, sourcePath, destination) !== claim) {
        throw new Error("The open file changed. Please reopen the confirmation.");
      }
      if (action === "rename") {
        if (destination !== sourcePath) await rename(sourcePath, destination);
        return { ok: true, path: destination, name: path.basename(destination) };
      }
      // No permanent-delete fallback, even if this drive cannot recycle files.
      await trash(sourcePath);
      return { ok: true, path: sourcePath, deleted: true };
    } finally {
      owners.delete(owner);
      paths.delete(key(sourcePath));
      if (destination) paths.delete(key(destination));
    }
  }
  return { run, isBusy };
}

module.exports = { createFileActions, renamedDocumentPath, renameWithoutOverwrite };
