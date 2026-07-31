const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const entries = [
  {
    source: path.join(projectRoot, "native", "process-guard.exe"),
    runtime: "native/process-guard.exe",
  },
  {
    source: path.join(projectRoot, "modules", "3dpdf", "native", "nano_prc_app_export.exe"),
    runtime: "native/nano_prc_app_export.exe",
  },
  ...[
    "u3d_app_export.exe",
    "IFXCore.dll",
    "IFXImporting.dll",
    "libwinpthread-1.dll",
  ].map((name) => ({
    source: path.join(projectRoot, "modules", "3dpdf", "native", "u3d", name),
    runtime: `native/u3d/${name}`,
  })),
  {
    source: path.join(
      projectRoot,
      "shell",
      "thumbnail-provider",
      "bin",
      "x64",
      "ExcelsisDxfThumbnailProvider.dll",
    ),
    runtime: "shell/ExcelsisDxfThumbnailProvider.dll",
  },
];

const libreDwgRoot = path.join(projectRoot, "third_party", "libredwg");
for (const name of fs.readdirSync(libreDwgRoot).sort()) {
  if (!/\.(?:dll|exe)$/i.test(name)) continue;
  entries.push({
    source: path.join(libreDwgRoot, name),
    runtime: `third_party/libredwg/${name}`,
  });
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

const files = entries
  .map((entry) => {
    const stat = fs.statSync(entry.source);
    if (!stat.isFile() || stat.size <= 0) {
      throw new Error(`External runtime file is missing or empty: ${entry.source}`);
    }
    return {
      path: entry.runtime,
      bytes: stat.size,
      sha256: sha256(entry.source),
    };
  })
  .sort((left, right) => left.path.localeCompare(right.path, "en"));

if (new Set(files.map((entry) => entry.path.toLowerCase())).size !== files.length) {
  throw new Error("External runtime integrity paths are not unique.");
}

const manifest = {
  format: "Excelsis external runtime integrity 1",
  version: require(path.join(projectRoot, "package.json")).version,
  files,
};
fs.writeFileSync(
  path.join(projectRoot, "external-integrity.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`External runtime integrity manifest: ${files.length} files.`);
