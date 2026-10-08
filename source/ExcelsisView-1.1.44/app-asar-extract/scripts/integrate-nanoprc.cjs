const fs = require("node:fs");
const path = require("node:path");

const appRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(appRoot, "..", "..");
const sourceModule = path.join(appRoot, "modules", "3dpdf");

const applicationPath = path.join(sourceModule, "app.mjs");
let applicationSource = fs.readFileSync(applicationPath, "utf8");
const decoderStartMarker = "import { Buffer, pako, THREE } from './vendor/runtime.mjs';";
const decoderEndMarker = "setInflate((sub) => pako.inflate(new Uint8Array(sub)));";
const decoderStart = applicationSource.indexOf(decoderStartMarker);
const decoderEndStart = applicationSource.indexOf(decoderEndMarker);

if (decoderStart >= 0 && decoderEndStart > decoderStart) {
  const decoderEnd = decoderEndStart + decoderEndMarker.length;
  const replacement = [
    "import { THREE } from './vendor/runtime.mjs';",
    "import { createRegularPdfViewer } from './regular-pdf.mjs';",
    "import { decodeNanoDocument, looksLikePrcPdf } from './nano-prc.mjs';",
  ].join("\n");
  applicationSource = `${applicationSource.slice(0, decoderStart)}${replacement}${applicationSource.slice(decoderEnd)}`;
  fs.writeFileSync(applicationPath, applicationSource);
} else if (!applicationSource.includes("from './nano-prc.mjs'")) {
  throw new Error("Could not locate the previous embedded decoder block.");
}

const exporterSource = path.join(
  workspaceRoot,
  "prc",
  "nanoprc",
  "build",
  "nano_prc_app_export.exe",
);
const licenseSource = path.join(workspaceRoot, "prc", "nanoprc", "upstream", "LICENSE");
const noticesSource = path.join(
  workspaceRoot,
  "prc",
  "nanoprc",
  "upstream",
  "THIRD_PARTY_NOTICES.md",
);

const nativeTarget = path.join(sourceModule, "native");
fs.mkdirSync(nativeTarget, { recursive: true });
fs.copyFileSync(exporterSource, path.join(nativeTarget, "nano_prc_app_export.exe"));
fs.copyFileSync(licenseSource, path.join(nativeTarget, "LICENSE-nanoPRC.txt"));
fs.copyFileSync(
  noticesSource,
  path.join(nativeTarget, "THIRD_PARTY_NOTICES-nanoPRC.md"),
);

console.log("nanoPRC integrated into the ASAR-protected 3D PDF module.");
