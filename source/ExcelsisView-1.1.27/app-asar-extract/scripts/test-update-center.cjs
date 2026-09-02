const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  compareProductVersions,
  isAllowedFinalDownloadUrl,
  latestReleaseApiUrl,
  updateStatusForVersions,
  validateLatestRelease,
} = require("../update-center-utils.cjs");

const root = path.resolve(__dirname, "..");
const digest = `sha256:${"a".repeat(64)}`;

function releaseFixture(productKey) {
  const viewer = productKey === "viewer";
  const repository = viewer ? "ExcelsisViewer" : "ExcelsisHelper";
  const tag = viewer ? "excelsis-view-v1.2.3" : "excelsis-helper-v2.3.4";
  const name = viewer
    ? "ExcelsisView-Setup-1.2.3.exe"
    : "ExcelsisHelper-2.3.4-Setup.exe";
  return {
    draft: false,
    prerelease: false,
    immutable: true,
    tag_name: tag,
    html_url: `https://github.com/simonsystem609/${repository}/releases/tag/${tag}`,
    published_at: "2026-08-13T12:00:00Z",
    assets: [{
      state: "uploaded",
      name,
      size: 2 * 1024 * 1024,
      digest,
      browser_download_url:
        `https://github.com/simonsystem609/${repository}/releases/download/${tag}/${name}`,
    }],
  };
}

for (const productKey of ["viewer", "helper"]) {
  const validated = validateLatestRelease(productKey, releaseFixture(productKey));
  assert.equal(validated.productKey, productKey);
  assert.equal(validated.asset.sha256, "a".repeat(64));
  assert.ok(validated.asset.downloadUrl.startsWith("https://github.com/simonsystem609/"));
  assert.ok(latestReleaseApiUrl(productKey).endsWith("/releases/latest"));
}
assert.equal(validateLatestRelease("viewer", releaseFixture("viewer")).version, "1.2.3");
const helperRelease = validateLatestRelease("helper", releaseFixture("helper"));
assert.equal(helperRelease.releaseLabel, "2.3.4");
assert.equal(helperRelease.version, "2.3.4");

const publicHelperFixture = releaseFixture("helper");
publicHelperFixture.tag_name = "excelsis-helper-v1.4.8-public.1";
publicHelperFixture.html_url =
  "https://github.com/simonsystem609/ExcelsisHelper/releases/tag/excelsis-helper-v1.4.8-public.1";
publicHelperFixture.assets[0].name = "ExcelsisHelper-1.4.8-public.1-Setup.exe";
publicHelperFixture.assets[0].browser_download_url =
  "https://github.com/simonsystem609/ExcelsisHelper/releases/download/" +
  "excelsis-helper-v1.4.8-public.1/ExcelsisHelper-1.4.8-public.1-Setup.exe";
const publicHelper = validateLatestRelease("helper", publicHelperFixture);
assert.equal(publicHelper.releaseLabel, "1.4.8-public.1");
assert.equal(publicHelper.version, "1.4.8");

assert.equal(compareProductVersions("1.1.23", "1.1.24"), -1);
assert.equal(compareProductVersions("1.1.24", "1.1.24"), 0);
assert.equal(compareProductVersions("1.2.0", "1.1.24"), 1);
assert.equal(compareProductVersions("1.4.8-public.1", "1.4.8-public.2"), -1);
assert.equal(compareProductVersions("broken", "1.0.0"), null);
assert.equal(updateStatusForVersions(null, "1.0.0"), "not-installed");
assert.equal(updateStatusForVersions("0.9.0", "1.0.0"), "update-available");
assert.equal(updateStatusForVersions("1.0.0", "1.0.0"), "up-to-date");
assert.equal(updateStatusForVersions("2.0.0", "1.0.0"), "newer-installed");
assert.equal(updateStatusForVersions("unknown", "1.0.0"), "unknown");

function rejectsFixture(mutator, message) {
  const fixture = releaseFixture("viewer");
  mutator(fixture);
  assert.throws(() => validateLatestRelease("viewer", fixture), message);
}

rejectsFixture((release) => { release.immutable = false; }, /immutable/i);
rejectsFixture((release) => { release.prerelease = true; }, /full releases/i);
rejectsFixture((release) => { release.assets[0].digest = null; }, /SHA-256/i);
rejectsFixture((release) => { release.tag_name = "wrong-v1.2.3"; }, /selected product/i);
rejectsFixture((release) => { release.assets[0].name = "ExcelsisView-Setup-9.9.9.exe"; }, /installer version/i);
rejectsFixture((release) => {
  release.html_url = "https://github.com/another-owner/ExcelsisViewer/releases/tag/v1";
}, /unexpected repository/i);
rejectsFixture((release) => {
  release.assets[0].browser_download_url =
    "https://github.com/simonsystem609/ExcelsisViewer/releases/download/v1/other.exe";
}, /filename/i);
rejectsFixture((release) => { release.assets[0].name = "../evil.exe"; }, /exactly one/i);

assert.equal(isAllowedFinalDownloadUrl("https://github.com/a/b"), true);
assert.equal(isAllowedFinalDownloadUrl("https://release-assets.githubusercontent.com/a"), true);
assert.equal(isAllowedFinalDownloadUrl("https://objects.githubusercontent.com/a"), true);
assert.equal(isAllowedFinalDownloadUrl("https://github.com.evil.example/a"), false);
assert.equal(isAllowedFinalDownloadUrl("https://user@github.com/a"), false);
assert.equal(isAllowedFinalDownloadUrl("http://github.com/a"), false);

const main = fs.readFileSync(path.join(root, "main.cjs"), "utf8");
const preload = fs.readFileSync(path.join(root, "preload.cjs"), "utf8");
const launcher = fs.readFileSync(path.join(root, "launcher", "index.html"), "utf8");
const updatePage = fs.readFileSync(path.join(root, "launcher", "update-center.html"), "utf8");
const updateScript = fs.readFileSync(path.join(root, "launcher", "update-center.js"), "utf8");
const updateUtils = fs.readFileSync(path.join(root, "update-center-utils.cjs"), "utf8");

assert.match(main, /"update-center"/);
assert.match(main, /app\.getPath\("downloads"\)/);
assert.match(main, /fileHasExpectedInstaller\(installerPath, update\.asset\)/);
assert.match(main, /shell\.openPath\(installerPath\)/);
assert.match(main, /productForKey\(requestedProductKey\)\.key/);
assert.match(main, /function installedProductVersion\(productKey\)/);
assert.match(main, /registryQueryExecutable\(\), \[/);
assert.match(main, /"DisplayVersion"/);
assert.match(main, /updateStatusForVersions\(installedVersion, update\.version\)/);
assert.match(main, /is newer than the latest public version/);
assert.doesNotMatch(main, /shell\.openExternal/);
assert.match(preload, /install: \(productKey\).*update:download-and-run/);
assert.doesNotMatch(preload, /downloadUrl|installerPath/);
assert.match(launcher, /data-module="dxf"/);
assert.match(launcher, /data-module="dwg"/);
assert.match(launcher, /data-module="3dpdf"/);
assert.match(launcher, /id="updateCenter"/);
assert.match(updatePage, /<script src="\.\/update-center\.js"><\/script>/);
assert.doesNotMatch(updatePage, /<script(?![^>]*src=)[^>]*>/i);
assert.match(updateScript, /Installed: \$\{installedText\} · Latest:/);
assert.match(updateScript, /"up-to-date": "Up to date"/);
assert.match(updateScript, /!update\.canInstall/);
assert.match(updateUtils, /uninstallGuid: "9542c8ef-f59a-55a8-bf9f-0ca14a456236"/);
assert.match(updateUtils, /uninstallGuid: "9902802a-b027-5709-9ce3-7a9d4fdcc95c"/);

console.log("Update-center validation and confinement tests passed.");
