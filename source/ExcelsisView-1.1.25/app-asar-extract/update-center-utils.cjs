const path = require("node:path");

const UPDATE_OWNER = "simonsystem609";
const MAX_INSTALLER_BYTES = 512 * 1024 * 1024;
const MIN_INSTALLER_BYTES = 1024 * 1024;

const UPDATE_PRODUCTS = Object.freeze({
  viewer: Object.freeze({
    key: "viewer",
    displayName: "ExcelsisView",
    repository: "ExcelsisViewer",
    releaseTagPrefix: "excelsis-view-v",
    uninstallGuid: "9542c8ef-f59a-55a8-bf9f-0ca14a456236",
    installerPattern: /^ExcelsisView-Setup-(?<version>[0-9A-Za-z._-]+)\.exe$/,
  }),
  helper: Object.freeze({
    key: "helper",
    displayName: "Excelsis Helper",
    repository: "ExcelsisHelper",
    releaseTagPrefix: "excelsis-helper-v",
    releaseLabelSuffixPattern: /-public\.\d+$/,
    uninstallGuid: "9902802a-b027-5709-9ce3-7a9d4fdcc95c",
    installerPattern: /^ExcelsisHelper-(?<version>[0-9A-Za-z._-]+)-Setup\.exe$/,
  }),
});

function parseProductVersion(rawVersion) {
  const value = String(rawVersion || "").trim();
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(value);
  if (!match) return null;
  const core = match.slice(1, 4).map(Number);
  if (core.some((part) => !Number.isSafeInteger(part))) return null;
  const prerelease = match[4] ? match[4].split(".") : [];
  if (prerelease.some((part) => !part || !/^[0-9A-Za-z-]+$/.test(part))) return null;
  return { value, core, prerelease };
}

function compareProductVersions(leftVersion, rightVersion) {
  const left = parseProductVersion(leftVersion);
  const right = parseProductVersion(rightVersion);
  if (!left || !right) return null;
  for (let index = 0; index < left.core.length; index += 1) {
    if (left.core[index] !== right.core[index]) {
      return left.core[index] < right.core[index] ? -1 : 1;
    }
  }
  if (!left.prerelease.length && !right.prerelease.length) return 0;
  if (!left.prerelease.length) return 1;
  if (!right.prerelease.length) return -1;
  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let index = 0; index < length; index += 1) {
    if (left.prerelease[index] === undefined) return -1;
    if (right.prerelease[index] === undefined) return 1;
    const leftPart = left.prerelease[index];
    const rightPart = right.prerelease[index];
    if (leftPart === rightPart) continue;
    const leftNumeric = /^\d+$/.test(leftPart);
    const rightNumeric = /^\d+$/.test(rightPart);
    if (leftNumeric && rightNumeric) return Number(leftPart) < Number(rightPart) ? -1 : 1;
    if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
    return leftPart < rightPart ? -1 : 1;
  }
  return 0;
}

function updateStatusForVersions(installedVersion, latestVersion) {
  if (!installedVersion) return "not-installed";
  const comparison = compareProductVersions(installedVersion, latestVersion);
  if (comparison === null) return "unknown";
  if (comparison < 0) return "update-available";
  if (comparison > 0) return "newer-installed";
  return "up-to-date";
}

function releaseVersions(product, tag) {
  if (!tag.startsWith(product.releaseTagPrefix)) {
    throw new Error("The latest release tag does not match the selected product.");
  }
  const releaseLabel = tag.slice(product.releaseTagPrefix.length);
  if (!parseProductVersion(releaseLabel)) {
    throw new Error("The latest release has an invalid product version.");
  }
  const version = product.releaseLabelSuffixPattern
    ? releaseLabel.replace(product.releaseLabelSuffixPattern, "")
    : releaseLabel;
  if (!parseProductVersion(version)) {
    throw new Error("The latest release has an invalid application version.");
  }
  return { releaseLabel, version };
}

function productForKey(productKey) {
  const product = UPDATE_PRODUCTS[String(productKey || "")];
  if (!product) throw new Error("Unknown update product.");
  return product;
}

function latestReleaseApiUrl(productKey) {
  const product = productForKey(productKey);
  return `https://api.github.com/repos/${UPDATE_OWNER}/${product.repository}/releases/latest`;
}

function expectedReleasePrefix(product) {
  return `/${UPDATE_OWNER.toLowerCase()}/${product.repository.toLowerCase()}/releases/`;
}

function validateReleasePageUrl(rawUrl, product) {
  const url = new URL(String(rawUrl || ""));
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com" ||
      url.username || url.password || url.port) {
    throw new Error("The update release page is not hosted by GitHub.");
  }
  if (!url.pathname.toLowerCase().startsWith(expectedReleasePrefix(product))) {
    throw new Error("The update release belongs to an unexpected repository.");
  }
  return url.href;
}

function validateInstallerAssetUrl(rawUrl, product) {
  const url = new URL(String(rawUrl || ""));
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com" ||
      url.username || url.password || url.port || url.search || url.hash) {
    throw new Error("The update asset is not hosted by GitHub.");
  }
  const expected = `/${UPDATE_OWNER.toLowerCase()}/${product.repository.toLowerCase()}/releases/download/`;
  if (!url.pathname.toLowerCase().startsWith(expected)) {
    throw new Error("The update asset belongs to an unexpected repository.");
  }
  return url.href;
}

function parseSha256Digest(rawDigest) {
  const match = /^sha256:([0-9a-f]{64})$/i.exec(String(rawDigest || ""));
  if (!match) throw new Error("The installer release asset has no valid GitHub SHA-256 digest.");
  return match[1].toLowerCase();
}

function validateLatestRelease(productKey, release) {
  const product = productForKey(productKey);
  if (!release || typeof release !== "object") throw new Error("GitHub returned an invalid release response.");
  if (release.draft || release.prerelease) throw new Error("Only published full releases can be installed.");
  if (release.immutable !== true) throw new Error("The latest release is not immutable yet.");
  const tag = String(release.tag_name || "").trim();
  if (!tag || tag.length > 160 || !/^[0-9A-Za-z._-]+$/.test(tag)) {
    throw new Error("The latest release has an invalid tag.");
  }
  const { releaseLabel, version } = releaseVersions(product, tag);
  const releaseUrl = validateReleasePageUrl(release.html_url, product);
  const candidates = Array.isArray(release.assets)
    ? release.assets.filter((asset) => (
      asset?.state === "uploaded"
      && product.installerPattern.test(String(asset?.name || ""))
    ))
    : [];
  if (candidates.length !== 1) {
    throw new Error(`Expected exactly one ${product.displayName} installer in the latest release.`);
  }
  const asset = candidates[0];
  const name = String(asset.name);
  if (path.basename(name) !== name) throw new Error("The installer asset name is unsafe.");
  const assetVersion = product.installerPattern.exec(name)?.groups?.version;
  if (assetVersion !== releaseLabel) {
    throw new Error("The installer version does not match the immutable release tag.");
  }
  const size = Number(asset.size);
  if (!Number.isSafeInteger(size) || size < MIN_INSTALLER_BYTES || size > MAX_INSTALLER_BYTES) {
    throw new Error("The installer release asset has an unsafe size.");
  }
  const downloadUrl = validateInstallerAssetUrl(asset.browser_download_url, product);
  const encodedUrlName = new URL(downloadUrl).pathname.split("/").pop();
  let urlName;
  try {
    urlName = decodeURIComponent(encodedUrlName);
  } catch {
    throw new Error("The installer asset URL has an invalid filename.");
  }
  if (urlName !== name) throw new Error("The installer asset URL does not match its filename.");
  return Object.freeze({
    productKey: product.key,
    displayName: product.displayName,
    repository: product.repository,
    tag,
    releaseLabel,
    version,
    releaseUrl,
    publishedAt: String(release.published_at || ""),
    asset: Object.freeze({
      name,
      size,
      sha256: parseSha256Digest(asset.digest),
      downloadUrl,
    }),
  });
}

function isAllowedFinalDownloadUrl(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl || ""));
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
  return new Set([
    "github.com",
    "objects.githubusercontent.com",
    "release-assets.githubusercontent.com",
  ]).has(url.hostname.toLowerCase());
}

module.exports = {
  MAX_INSTALLER_BYTES,
  UPDATE_OWNER,
  UPDATE_PRODUCTS,
  compareProductVersions,
  isAllowedFinalDownloadUrl,
  latestReleaseApiUrl,
  parseProductVersion,
  parseSha256Digest,
  productForKey,
  validateInstallerAssetUrl,
  validateLatestRelease,
  updateStatusForVersions,
};
