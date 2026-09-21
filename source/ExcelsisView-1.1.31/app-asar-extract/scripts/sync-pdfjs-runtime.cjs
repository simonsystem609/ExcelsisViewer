"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const packageMetadata = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"),
);
const expectedVersion = packageMetadata.devDependencies?.["pdfjs-dist"];
const packageRoot = path.join(projectRoot, "node_modules", "pdfjs-dist");
const installedMetadata = JSON.parse(
  fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"),
);
const runtimeRoot = path.join(projectRoot, "modules", "3dpdf", "vendor", "pdfjs");

assert.match(expectedVersion, /^\d+\.\d+\.\d+$/, "pdfjs-dist must be pinned exactly.");
assert.equal(
  installedMetadata.version,
  expectedVersion,
  "Installed pdfjs-dist does not match the pinned package version.",
);

function relativeFiles(root) {
  const files = [];
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile()) files.push(path.relative(root, absolute));
    }
  };
  visit(root);
  return files.sort();
}

function copyFile(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function syncDirectory(relativeDirectory) {
  const source = path.join(packageRoot, relativeDirectory);
  const destination = path.join(runtimeRoot, relativeDirectory);
  const sourceFiles = relativeFiles(source);
  const destinationFiles = fs.existsSync(destination) ? relativeFiles(destination) : [];
  const sourceSet = new Set(sourceFiles);
  const staleFiles = destinationFiles.filter((name) => !sourceSet.has(name));

  assert.deepEqual(
    staleFiles,
    [],
    `Bundled PDF.js ${relativeDirectory} has stale files; review and move them to the workspace trash first.`,
  );

  for (const relativeFile of sourceFiles) {
    copyFile(path.join(source, relativeFile), path.join(destination, relativeFile));
  }
  return sourceFiles.length;
}

copyFile(path.join(packageRoot, "build", "pdf.min.mjs"), path.join(runtimeRoot, "pdf.min.mjs"));
copyFile(
  path.join(packageRoot, "build", "pdf.worker.min.mjs"),
  path.join(runtimeRoot, "pdf.worker.min.mjs"),
);

let assetCount = 2;
for (const directory of ["cmaps", "iccs", "image_decoders", "standard_fonts", "wasm"]) {
  assetCount += syncDirectory(directory);
}

console.log(`Synchronized PDF.js ${expectedVersion}: ${assetCount} runtime files.`);
