const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(projectRoot, name), "utf8");
const main = read("main.cjs");
const preload = read("preload.cjs");
const batchPrintPreload = read("batch-print-preload.cjs");
const printDocumentPreload = read("print-document-preload.cjs");
const dwg = read("dwg-converter.cjs");
const prc = read("nano-prc-bridge.cjs");
const u3d = read("u3d-bridge.cjs");
const guardedProcess = read("guarded-process.cjs");
const processGuard = read("native/process-guard.cpp");
const thumbnailProvider = read("shell/thumbnail-provider/src/thumbnail_provider.cpp");
const nanoBuild = read("../../prc/nanoprc/build.ps1");
const u3dBuild = read("../../u3d/build.ps1");
const nanoTest = read("scripts/test-nanoprc-bridge.cjs");
const u3dTest = read("scripts/test-u3d-bridge.cjs");
const u3dHardeningTest = read("scripts/test-u3d-hardening.cjs");
const sourcePackager = read("scripts/package-corresponding-source.ps1");
const installerScript = read("build/installer.nsh");
const rootLicense = read("LICENSE.txt");
const launcher = read("launcher/index.html");
const sourceDocument = read("SOURCE.md");
const notices = read("THIRD_PARTY_NOTICES.md");
const readme = read("README.md");
const pdfJsRuntime = read("modules/3dpdf/vendor/pdfjs/pdf.min.mjs");
const pdfLoaders = [
  "modules/3dpdf/regular-pdf.mjs",
  "modules/3dpdf/batch-print.mjs",
  "modules/3dpdf/print-document.mjs",
  "modules/3dpdf/pdf-thumbnail.mjs",
];
const pkg = JSON.parse(read("package.json"));

assert.equal(pkg.version, "1.1.19");
assert.equal(pkg.devDependencies.electron, "43.3.0");
assert.equal(pkg.devDependencies["pdfjs-dist"], "6.2.108");
assert.deepEqual(pkg.allowScripts, {
  "electron@43.3.0": true,
  "electron-winstaller@5.4.0": false,
  "esbuild@0.25.12": true,
  "tesseract.js@7.0.0": false,
});
assert.equal(pkg.build.appId, "local.excelsis.view");
assert.match(pdfJsRuntime, /pdfjsVersion = 6\.2\.108/, "The bundled PDF.js runtime is not 6.2.108.");
assert.match(pkg.scripts["test:pdf"], /npm run sync:pdfjs/, "PDF tests do not synchronize the pinned PDF.js runtime.");
for (const pdfLoader of pdfLoaders) {
  const source = read(pdfLoader);
  assert.match(source, /getDocument\s*\(\s*\{/, `${pdfLoader} does not load PDF documents as expected.`);
  assert.match(source, /enableScripting\s*:\s*false/, `${pdfLoader} permits embedded PDF scripting.`);
  assert.match(source, /isEvalSupported\s*:\s*false/, `${pdfLoader} permits PDF.js dynamic evaluation.`);
}
assert.doesNotMatch(main, /sandbox\s*:\s*false/, "Renderer sandboxing is disabled.");
assert.match(main, /app\.enableSandbox\(\)/, "Application sandboxing is not enabled.");
assert.match(main, /sandbox\s*:\s*true/, "Browser windows do not opt into the sandbox.");
assert.match(main, /contextIsolation\s*:\s*true/, "Context isolation is missing.");
assert.match(main, /nodeIntegration\s*:\s*false/, "Node integration is not disabled.");
assert.match(main, /Content-Security-Policy/, "CSP response headers are not installed.");
assert.doesNotMatch(main, /unsafe-inline/, "CSP still permits inline scripts or styles.");
assert.match(main, /registerSchemesAsPrivileged/, "A protected custom protocol is not registered.");
assert.match(main, /protocol\.handle\(APP_SCHEME/, "The custom application protocol has no handler.");
assert.doesNotMatch(main, /protocol === "file:"/, "The renderer can still request file URLs.");
assert.doesNotMatch(main, /pathToFileURL|fileURLToPath/, "Privileged file URL loading returned.");
assert.match(main, /setPermissionRequestHandler/, "Permission requests are not denied.");
assert.match(main, /setPermissionCheckHandler/, "Permission checks are not denied.");
assert.match(main, /setWindowOpenHandler/, "New-window creation is not blocked.");
assert.match(main, /will-navigate/, "Unexpected navigation is not blocked.");
assert.match(main, /assertTrustedSender/, "IPC sender validation is missing.");
assert.match(main, /handleTrusted/, "Trusted IPC registration is missing.");
assert.match(main, /grantedFilePaths/, "File capabilities are missing.");
assert.match(main, /MAX_DXF_SAVE_BYTES/, "DXF IPC output limit is missing.");
assert.doesNotMatch(main, /app:open-path/, "The removed arbitrary-path shell API returned.");
assert.doesNotMatch(preload, /openPath/, "The preload exposes arbitrary shell opening.");
assert.match(preload, /fs:grant-local-file/, "Local file grants are not brokered.");
assert.match(preload, /fs:save-dxf-as/, "The DXF Save As capability is not explicitly brokered.");
assert.match(preload, /fs:write-pdf/, "The claimed-path PDF Save capability is not explicitly brokered.");
assert.match(preload, /fs:save-pdf-as/, "The PDF Save As capability is not explicitly brokered.");
assert.match(preload, /3d:detect-file/, "The 3D PDF format detector is not explicitly brokered.");
assert.match(preload, /u3d:decode-stream/, "The U3D stream decoder is not explicitly brokered.");
assert.doesNotMatch(preload, /fs:save-pdf-copy|saveCopy:/, "The obsolete unscoped PDF copy API returned.");
const dxfSaveAsHandler = main.slice(
  main.indexOf('handleTrusted("fs:save-dxf-as"'),
  main.indexOf("for (const [channel, suffix]"),
);
assert.match(dxfSaveAsHandler, /requireFileCapability/, "DXF Save As does not require a source capability.");
assert.match(dxfSaveAsHandler, /requireBoundedDxfText/, "DXF Save As output is not size-bounded.");
assert.match(dxfSaveAsHandler, /dialog\.showSaveDialog/, "DXF Save As is not user-authorized by a save dialog.");
assert.match(dxfSaveAsHandler, /extensions:\s*\["dxf"\]/, "DXF Save As is not restricted to DXF output.");
assert.match(dxfSaveAsHandler, /ownerForPath/, "DXF Save As can overwrite a file owned by another window.");
const pdfWriteHandler = main.slice(
  main.indexOf('handleTrusted("fs:write-pdf"'),
  main.indexOf('handleTrusted("fs:save-pdf-as"'),
);
assert.match(pdfWriteHandler, /requireFileCapability/, "PDF Save does not require a source capability.");
assert.match(pdfWriteHandler, /requireWriteClaim/, "PDF Save can overwrite a file not owned by its window.");
assert.match(pdfWriteHandler, /boundedPdfOutput/, "PDF Save output is not size-bounded.");
assert.match(pdfWriteHandler, /broadcastFileSaved/, "PDF Save does not notify other viewers.");
const pdfSaveAsHandler = main.slice(
  main.indexOf('handleTrusted("fs:save-pdf-as"'),
  main.indexOf('handleTrusted("fs:list-dxf-folder"'),
);
assert.match(pdfSaveAsHandler, /requireFileCapability/, "PDF Save As does not require a source capability.");
assert.match(pdfSaveAsHandler, /boundedPdfOutput/, "PDF Save As output is not size-bounded.");
assert.match(pdfSaveAsHandler, /dialog\.showSaveDialog/, "PDF Save As is not user-authorized by a save dialog.");
assert.match(pdfSaveAsHandler, /extensions:\s*\["pdf"\]/, "PDF Save As is not restricted to PDF output.");
assert.match(pdfSaveAsHandler, /ownerForPath/, "PDF Save As can overwrite a file owned by another window.");
assert.match(pdfSaveAsHandler, /claimFileForWebContents/, "PDF Save As does not transfer the window's file claim.");
assert.match(pdfSaveAsHandler, /grantFileSet/, "PDF Save As does not grant the newly selected PDF path.");
assert.doesNotMatch(
  `${batchPrintPreload}\n${printDocumentPreload}`,
  /fs:read|fs:write|openPath|shell\./,
  "Batch printing exposes an arbitrary filesystem or shell capability.",
);
assert.match(main, /MAX_BATCH_PRINT_FILES\s*=\s*100/, "Batch-print input count is not bounded.");
assert.match(main, /requireBoundedFile\(filePath, MAX_PDF_INPUT_BYTES/, "Batch-print PDF sizes are not bounded.");
assert.match(main, /validateBatchPrintSettings/, "Batch-print settings are not validated in the main process.");
assert.match(
  main,
  /handleTrusted\("print:open-preview", \["3dpdf"\][\s\S]{0,900}boundedPdfOutput\(bytes\)/,
  "The regular-PDF print preview is not restricted to trusted bounded PDF bytes.",
);
assert.match(
  main,
  /function readPrintFileBytes[\s\S]{0,500}MAX_PDF_INPUT_BYTES/,
  "Print preview and rendering do not enforce the PDF input-size boundary.",
);
assert.match(
  installerScript,
  /SystemFileAssociations\\\.pdf\\shell\\ExcelsisView\.BatchPrint[\s\S]*MultiSelectModel[\s\S]*Player/,
  "The Explorer batch-print verb is not registered for multi-selection.",
);
assert.match(main, /verifyExternalRuntimeIntegrity/, "External runtime integrity is not verified.");
assert.equal(pkg.build.electronFuses.grantFileProtocolExtraPrivileges, false);
assert.ok(
  !pkg.build.extraResources.some((entry) => /app-modules/i.test(String(entry.from))),
  "External application modules remain outside ASAR integrity.",
);

for (const [name, source] of [["DWG", dwg], ["PRC", prc], ["U3D", u3d]]) {
  assert.match(source, /runGuardedProcess/, `${name} decoder does not use native containment.`);
  assert.match(source, /hashFileContent/, `${name} cache is not content-addressed.`);
  assert.match(source, /enforceCacheQuota/, `${name} cache quota is missing.`);
  assert.match(source, /outputLimits/, `${name} output limits are missing.`);
  assert.match(
    source,
    /sandboxReadWriteDirectories/,
    `${name} decoder does not request AppContainer filesystem isolation.`,
  );
}
assert.match(guardedProcess, /--sandbox/, "The process guard sandbox mode is not selected.");
assert.match(processGuard, /CreateAppContainerProfile/, "The native parser does not use AppContainer.");
assert.match(processGuard, /CapabilityCount/, "AppContainer capabilities are not constrained.");
assert.match(processGuard, /copyDirectoryTree/, "Parser inputs are not staged into the AppContainer profile.");
assert.doesNotMatch(
  processGuard,
  /SetNamedSecurityInfo|SetEntriesInAcl/,
  "The parser sandbox mutates user-directory ACLs.",
);
assert.match(
  thumbnailProvider,
  /--sandbox appcontainer[\s\S]*--sandbox-rw/,
  "DWG Explorer thumbnails do not use AppContainer isolation.",
);
assert.match(prc, /MAX_TRIANGLES/, "PRC triangle complexity limit is missing.");
assert.match(prc, /MAX_COMPONENTS/, "PRC tree complexity limit is missing.");
assert.match(u3d, /MAX_TRIANGLES/, "U3D triangle complexity limit is missing.");
assert.match(u3d, /MAX_COMPONENTS/, "U3D tree complexity limit is missing.");
assert.match(u3d, /U3D_HEADER/, "U3D stream signature validation is missing.");
assert.match(u3d, /dependencyPaths/, "U3D runtime dependencies are not staged into the sandbox.");
assert.match(
  thumbnailProvider,
  /processGuard[\s\S]*--active-processes 16[\s\S]*--pdf-thumbnail-input/,
  "PDF Explorer thumbnail process tree is not contained.",
);
assert.match(
  thumbnailProvider,
  /--sandbox none[\s\S]*--pdf-thumbnail-input/,
  "The Electron PDF thumbnail runtime does not explicitly select its Chromium sandbox path.",
);
for (const buildSource of [read("scripts/build-process-guard.ps1"), nanoBuild, u3dBuild]) {
  assert.match(buildSource, /fstack-protector-strong/, "Native stack protection is missing.");
  assert.match(buildSource, /--dynamicbase/, "Native ASLR linker hardening is missing.");
  assert.match(buildSource, /--nxcompat/, "Native DEP linker hardening is missing.");
}
assert.equal(pkg.license, "AGPL-3.0-or-later");
assert.ok(
  rootLicense.startsWith("                    GNU AFFERO GENERAL PUBLIC LICENSE"),
  "The installer license is not the complete GNU AGPL text.",
);
for (const [name, source] of [
  ["About screen", launcher],
  ["SOURCE.md", sourceDocument],
  ["third-party notices", notices],
  ["README.md", readme],
]) {
  assert.match(source, /AGPL-3\.0-or-later/, `${name} does not declare the product-level AGPL license.`);
}
assert.equal(pkg.build.nsis.license, "LICENSE.txt");
assert.equal(pkg.build.nsis.perMachine, true);
assert.equal(pkg.build.nsis.allowElevation, true);
assert.equal(pkg.build.nsis.runAfterFinish, false);
assert.doesNotMatch(
  installerScript,
  /customInstallMode|isForceCurrentInstall/,
  "A custom install-mode override can interfere with the machine-wide upgrade path.",
);
assert.equal(
  Object.hasOwn(pkg.build.nsis, "packElevateHelper"),
  false,
  "packElevateHelper is ignored for per-machine installers and must not be misdeclared.",
);
assert.match(
  notices,
  /NSIS 3\.0\.4\.1[\s\S]*9B1FBF0C11C520AE714AF8AA9AF12CFD48503EEDECD7398D8992EE94D1B4DC37/,
  "The required per-machine electron-builder elevation helper is not documented and pinned.",
);
assert.match(
  pkg.scripts.dist,
  /electron-builder --win nsis && npm run audit:package$/,
  "The packaged-runtime audit is not an automatic post-package gate.",
);
assert.equal(
  pkg.build.extraResources.some((entry) => /third_party[\\/]source/i.test(String(entry.from))),
  false,
  "The standalone installer still nests corresponding-source archives in its runtime payload.",
);
const libreDwgRuntimeResource = pkg.build.extraResources.find(
  (entry) => String(entry.from).replaceAll("\\", "/") === "third_party/libredwg",
);
assert.ok(libreDwgRuntimeResource, "The LibreDWG runtime resource mapping is missing.");
assert.deepEqual(
  libreDwgRuntimeResource.filter,
  ["**/*", "!libredwg-0.14.8492-source.tar.gz"],
  "The standalone installer does not exclude the installer-adjacent LibreDWG source archive.",
);
assert.match(
  sourcePackager,
  /Expected exactly one current app source archive/,
  "The source packager does not enforce a single version-matching app archive.",
);
assert.match(nanoTest, /nano_prc_teapot_write/, "The public nanoPRC test does not generate its synthetic fixture.");
assert.doesNotMatch(
  nanoTest,
  /Part1\.pdf|2parts_assembly/i,
  "The mandatory nanoPRC test still requires private fixtures.",
);
assert.match(u3dTest, /box_group\.pdf/, "The U3D test does not use the upstream Apache-licensed fixture.");
assert.match(u3dTest, /ColorChannels\.u3d/, "The U3D test does not exercise a JPEG texture.");
assert.match(u3dTest, /shading_alpha\.u3d/, "The U3D test does not exercise a PNG texture.");
assert.match(u3dTest, /truncatedTextureRejected/, "The U3D test does not reject truncated JPEG data.");
assert.match(u3dTest, /truncatedPngTextureRejected/, "The U3D test does not reject truncated PNG data.");
assert.match(
  u3dHardeningTest,
  /IFX_U3D_IMAGE_MAX_DECODED_BYTES/,
  "The U3D source hardening test does not enforce its decoded-image ceiling.",
);
assert.doesNotMatch(
  u3dTest,
  /Downloads|Part1\.pdf|2parts_assembly/i,
  "The mandatory U3D test requires a private fixture.",
);
assert.match(
  sourceDocument,
  /SOURCE-ExcelsisView-1\.1\.19\.zip/,
  "The exact installer-adjacent application source is not documented.",
);
assert.match(
  sourceDocument,
  /SOURCE-nanoPRC-66cacb70\.zip/,
  "The exact installer-adjacent nanoPRC source is not documented.",
);
assert.match(
  sourceDocument,
  /SOURCE-U3D-5c141d9f\.zip/,
  "The exact installer-adjacent U3D source is not documented.",
);
assert.match(
  sourceDocument,
  /SOURCE-LibreDWG-0\.14\.8492\.tar\.gz/,
  "The exact installer-adjacent LibreDWG source is not documented.",
);
assert.doesNotMatch(
  `${sourceDocument}\n${notices}`,
  /inside the installed resources|resources\/third_party\/source/i,
  "Source documentation still claims that non-runtime source archives are nested in the installer.",
);
assert.match(notices, /5c141d9f0d366357e2b7cf93af2eade284a334be/, "The pinned U3D source is not documented.");
assert.deepEqual(pkg.overrides, {
  "@electron/get": {
    "undici": "7.29.0",
  },
  "brace-expansion": "5.0.9",
  "fast-uri": "3.1.5",
  "js-yaml": "4.3.1",
  "node-gyp": {
    "undici": "6.28.0",
  },
  "tar": "7.5.21",
});
for (const required of [
  "LICENSE.txt",
  "README.md",
  "SOURCE.md",
  "THIRD_PARTY_NOTICES.md",
  "DISTRIBUTION-RISK-ACCEPTANCE.md",
  "external-integrity.json",
]) {
  assert.ok(fs.statSync(path.join(projectRoot, required)).isFile(), `${required} is missing.`);
}
for (const htmlPath of [
  "launcher/index.html",
  "modules/3dpdf/index.html",
  "modules/3dpdf/batch-print.html",
  "modules/3dpdf/print-document.html",
]) {
  const html = read(htmlPath);
  assert.doesNotMatch(html, /<style\b/i, `${htmlPath} contains an inline stylesheet.`);
  assert.doesNotMatch(
    html,
    /<script(?![^>]*\bsrc=)/i,
    `${htmlPath} contains an inline script.`,
  );
}
for (const license of [
  "three-0.160.0.txt",
  "pako-2.1.0.txt",
  "buffer-6.0.3.txt",
  "ieee754-1.2.1.txt",
  "base64-js-1.5.1.txt",
  "pdfjs-6.2.108.txt",
  "roboto-3.008.txt",
  "electron-builder-26.15.3.txt",
  "nsis-3.0.4.1.txt",
  path.join("u3d", "LICENSE-U3D-Apache-2.0.txt"),
  path.join("u3d", "LICENSE-libwinpthread.txt"),
  path.join("u3d", "LICENSE-libpng.txt"),
  path.join("u3d", "LICENSE-zlib.txt"),
  path.join("u3d", "LICENSE-libjpeg-turbo.md"),
]) {
  assert.ok(
    fs.statSync(path.join(projectRoot, "third_party", "licenses", license)).isFile(),
    `Third-party license is missing: ${license}`,
  );
}

console.log("Electron, decoder containment, license, and source checks passed.");
