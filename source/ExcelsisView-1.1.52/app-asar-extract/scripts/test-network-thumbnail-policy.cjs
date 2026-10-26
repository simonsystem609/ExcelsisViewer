const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { ensureNetworkThumbnailPolicy } = require("../network-thumbnail-policy.cjs");

async function main() {
  const calls = [], writes = [];
  const options = {
    platform: "win32", isPackaged: true, isThumbnailHelper: false, isPrimaryInstance: true,
    systemRoot: "C:\\Windows", resourcesPath: "C:\\Program Files\\ExcelsisView\\resources",
    userDataPath: "C:\\SyntheticProfile\\ExcelsisView",
    execute: async (...args) => calls.push(args),
    fileSystem: { mkdir: async () => {}, writeFile: async (...args) => writes.push(args) },
  };
  for (const skip of [{ platform: "linux" }, { isPackaged: false }, { isThumbnailHelper: true }, { isPrimaryInstance: false }]) {
    assert.equal((await ensureNetworkThumbnailPolicy({ ...options, ...skip })).status, "skipped");
  }
  assert.equal(calls.length, 0); assert.equal(writes.length, 0);
  assert.equal((await ensureNetworkThumbnailPolicy(options)).status, "configured-or-already-enabled");
  assert.deepEqual(calls[0], ["C:\\Windows\\System32\\regsvr32.exe", ["/s", "/n", "/i:network-thumbnail-cache",
    "C:\\Program Files\\ExcelsisView\\resources\\shell\\ExcelsisDxfThumbnailProvider.dll"],
    { windowsHide: true, shell: false, timeout: 20000, maxBuffer: 16384 }]);
  assert.equal(writes[0][0], path.join(options.userDataPath, "NetworkThumbnailCachePolicy.json"));
  assert.equal(JSON.parse(writes[0][1]).status, "configured-or-already-enabled");
  const failed = await ensureNetworkThumbnailPolicy({ ...options, execute: async () => {
    throw Object.assign(new Error("sensitive process output"), { code: 5, stderr: "private-data" });
  } });
  assert.deepEqual(failed, { status: "not-changed", code: 5 });
  assert(!writes.at(-1)[1].includes("sensitive") && !writes.at(-1)[1].includes("private-data"));
  assert.equal((await ensureNetworkThumbnailPolicy({ ...options, execute: async () => { throw new Error("timeout"); },
    fileSystem: { mkdir: async () => { throw new Error("read-only profile"); } } })).status, "not-changed");

  const source = fs.readFileSync(path.join(__dirname, "..", "main.cjs"), "utf8");
  const ready = source.slice(source.indexOf("app.whenReady().then(async () => {"));
  assert(ready.indexOf("await verifyExternalRuntimeIntegrity()") < ready.indexOf("await ensureNetworkThumbnailPolicy("));
  assert(ready.indexOf("await renderPdfThumbnail(pdfThumbnailRequest)") < ready.indexOf("await ensureNetworkThumbnailPolicy("));
  assert(!fs.readFileSync(path.join(__dirname, "..", "preload.cjs"), "utf8").includes("network-thumbnail"));
  console.log("Network thumbnail startup tests passed (mocked execution; no Windows policy changed).");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
