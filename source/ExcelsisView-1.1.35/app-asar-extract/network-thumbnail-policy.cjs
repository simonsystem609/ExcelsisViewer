const path = require("node:path");

// Fixed-purpose main-process startup action. The caller must verify the
// packaged external-runtime integrity manifest before invoking this module.
// This is never exposed to renderer IPC or run by PDF thumbnail helpers.
async function ensureNetworkThumbnailPolicy({
  platform, isPackaged, isThumbnailHelper, isPrimaryInstance,
  systemRoot, resourcesPath, userDataPath, execute, fileSystem,
}) {
  if (platform !== "win32" || !isPackaged || isThumbnailHelper || !isPrimaryInstance) {
    return { status: "skipped" };
  }
  const executable = path.win32.join(systemRoot, "System32", "regsvr32.exe");
  const provider = path.win32.join(resourcesPath, "shell", "ExcelsisDxfThumbnailProvider.dll");
  let result;
  try {
    await execute(executable, ["/s", "/n", "/i:network-thumbnail-cache", provider], {
      windowsHide: true, shell: false, timeout: 20000, maxBuffer: 16384,
    });
    // Success also includes an already-enabled policy that Viewer does not own.
    result = { status: "configured-or-already-enabled" };
  } catch (error) {
    // Do not log command output, document paths, usernames or environment data.
    result = { status: "not-changed", code: Number.isInteger(error?.code) ? error.code : "execution-failed" };
  }
  try {
    await fileSystem.mkdir(userDataPath, { recursive: true });
    await fileSystem.writeFile(path.join(userDataPath, "NetworkThumbnailCachePolicy.json"),
      JSON.stringify({ ...result, checkedAt: new Date().toISOString() }) + "\n", "utf8");
  } catch {
    // A diagnostic-log failure must not prevent opening the document.
  }
  return result;
}

module.exports = { ensureNetworkThumbnailPolicy };
