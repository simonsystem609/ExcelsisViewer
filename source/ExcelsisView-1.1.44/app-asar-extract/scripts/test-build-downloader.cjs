"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { createRequire } = require("node:module");

async function main() {
  const fromBuilder = createRequire(require.resolve("app-builder-lib/package.json"));
  assert.equal(fromBuilder.resolve("@electron/get"), require.resolve("@electron/get"),
    "The builder must use the same pinned downloader as Electron.");
  const helperPath = fromBuilder.resolve("@electron/get");
  const helper = JSON.parse(await fs.readFile(path.resolve(path.dirname(helperPath), "../package.json"), "utf8"));
  assert.equal(helper.version, "5.0.0");
  assert.ok(!helper.dependencies.got && !helper.optionalDependencies["global-agent"],
    "The removed vulnerable downloader dependency chains must not return.");

  const { downloadElectronArtifactZip } = require("app-builder-lib/out/util/electronGet");
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "excelsis-build-downloader-"));
  const payload = Buffer.from("Synthetic Electron artifact: checksum-only downloader fixture.\n");
  const checksum = crypto.createHash("sha256").update(payload).digest("hex");
  const artifact = "electron-v43.7.7-win32-x64.zip";
  const requests = [];
  const originalFetch = globalThis.fetch;
  let mode = "success";
  globalThis.fetch = async (url, options) => {
    const expected = `https://download-fixture.invalid/${mode}/${artifact}`;
    assert.equal(String(url), expected, "The test must never contact an external endpoint.");
    assert.equal(options.method, undefined);
    requests.push(expected);
    if (mode === "http-error") return new Response("Not found", { status: 404, statusText: "Not Found" });
    return new Response(payload, { status: 200, headers: { "content-length": String(payload.length) } });
  };
  const download = (expectedHash = checksum) => downloadElectronArtifactZip({
    artifactName: "electron", version: "43.7.7", platformName: "win32", arch: "x64",
    cacheDir: path.join(root, "cache"),
    electronDownload: {
      mirrorOptions: { resolveAssetURL: async () => `https://download-fixture.invalid/${mode}/${artifact}` },
      checksums: { [artifact]: expectedHash },
      downloadOptions: { quiet: true },
    },
  });
  try {
    const first = await download();
    assert.deepEqual(await fs.readFile(first), payload);
    assert.equal(requests.length, 1);
    assert.equal(await download(), first);
    assert.equal(requests.length, 1, "A validated cache hit must not download again.");

    mode = "checksum-error";
    await assert.rejects(download("0".repeat(64)), /checksum|digest|sum mismatch/i,
      "An altered artifact must never be accepted by the builder.");
    assert.equal(requests.length, 2);

    mode = "http-error";
    await assert.rejects(download(), /404/);
    assert.equal(requests.length, 3);
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log(JSON.stringify({ passed: true, helperVersion: helper.version,
    builderIntegration: true, checksumRejection: true, validatedCacheReuse: true,
    httpErrorRejection: true, externalNetworkRequests: 0, fixtureRoot: root }));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
