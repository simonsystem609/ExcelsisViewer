const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const asar = require("@electron/asar");
const { NtExecutable, NtExecutableResource } = require("resedit");
const { readAsarHeader } = require("app-builder-lib/out/asar/asar");

const FUSE_SENTINEL = Buffer.from("dL7pKGdnNz796PbbjQWNKmHXBZaB9tsX", "ascii");
const FUSE_NAMES = [
  "RunAsNode",
  "EnableCookieEncryption",
  "EnableNodeOptionsEnvironmentVariable",
  "EnableNodeCliInspectArguments",
  "EnableEmbeddedAsarIntegrityValidation",
  "OnlyLoadAppFromAsar",
  "LoadBrowserProcessSpecificV8Snapshot",
  "GrantFileProtocolExtraPrivileges",
  "WasmTrapHandlers",
];
const EXPECTED_FUSES = ["0", "0", "0", "0", "1", "1", "0", "0", "1"];
const EXPECTED_CHROMIUM_VERSION = "150.0.7871.129";
const EXPECTED_ELEVATE_HELPER_SHA256 = "9b1fbf0c11c520ae714af8aa9af12cfd48503eedecd7398d8992ee94d1b4dc37";

function readFuseWire(executable) {
  const sentinelAt = executable.indexOf(FUSE_SENTINEL);
  assert.notEqual(sentinelAt, -1, "Electron fuse sentinel is missing.");
  const wireAt = sentinelAt + FUSE_SENTINEL.length;
  const version = executable[wireAt];
  const length = executable[wireAt + 1];
  assert.equal(version, 1, "Unexpected Electron fuse wire version.");
  assert.ok(length >= FUSE_NAMES.length, "Electron fuse wire is missing expected slots.");
  return Array.from(
    executable.subarray(wireAt + 2, wireAt + 2 + length),
    (byte) => String.fromCharCode(byte),
  );
}

function readIntegrityResource(executable) {
  const parsed = NtExecutable.from(executable);
  const resources = NtExecutableResource.from(parsed);
  const entry = resources.entries.find((candidate) => (
    String(candidate.type).toUpperCase() === "INTEGRITY"
    && String(candidate.id).toUpperCase() === "ELECTRONASAR"
  ));
  assert.ok(entry, "Embedded ASAR integrity resource is missing.");
  const value = JSON.parse(Buffer.from(entry.bin).toString("utf8"));
  assert.ok(Array.isArray(value), "Embedded ASAR integrity resource is invalid.");
  return value;
}

function assertPeMitigations(filePath, label) {
  const image = fs.readFileSync(filePath);
  assert.equal(image.readUInt16LE(0), 0x5a4d, `${label} has no MZ header.`);
  const peOffset = image.readUInt32LE(0x3c);
  assert.equal(image.toString("ascii", peOffset, peOffset + 4), "PE\u0000\u0000", `${label} has no PE header.`);
  const optionalHeader = peOffset + 24;
  const optionalMagic = image.readUInt16LE(optionalHeader);
  assert.ok(
    optionalMagic === 0x10b || optionalMagic === 0x20b,
    `${label} is not a PE32 or PE32+ image.`,
  );
  const dllCharacteristics = image.readUInt16LE(optionalHeader + 70);
  const requiredMitigations = optionalMagic === 0x20b ? 0x0160 : 0x0140;
  assert.equal(
    dllCharacteristics & requiredMitigations,
    requiredMitigations,
    `${label} is missing required ASLR or NX compatibility.`,
  );
  return {
    format: optionalMagic === 0x20b ? "PE32+" : "PE32",
    dllCharacteristics: `0x${dllCharacteristics.toString(16)}`,
  };
}

function readManifest(executablePath) {
  const parsed = NtExecutable.from(fs.readFileSync(executablePath));
  const resources = NtExecutableResource.from(parsed);
  const manifests = resources.entries.filter((entry) => String(entry.type) === "24");
  assert.ok(manifests.length > 0, `${path.basename(executablePath)} has no application manifest.`);
  return manifests.map((entry) => {
    const value = Buffer.from(entry.bin);
    if (value.length >= 2 && value[0] === 0xff && value[1] === 0xfe) {
      return value.subarray(2).toString("utf16le");
    }
    const sample = value.subarray(0, Math.min(value.length, 128));
    return sample.includes(0) ? value.toString("utf16le") : value.toString("utf8");
  }).join("\n");
}

async function main() {
  const projectRoot = path.resolve(__dirname, "..");
  const sourceMetadata = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
  const expectedVersion = sourceMetadata.version;
  const expectedLicense = sourceMetadata.license;
  const expectedElectronVersion = sourceMetadata.devDependencies?.electron;
  assert.match(expectedVersion, /^\d+\.\d+\.\d+$/, "Source package version is invalid.");
  assert.equal(expectedLicense, "AGPL-3.0-or-later", "Source package license is not AGPL-3.0-or-later.");
  assert.match(expectedElectronVersion, /^\d+\.\d+\.\d+$/, "Pinned Electron version is missing.");
  assert.equal(sourceMetadata.build?.appId, "local.excelsis.view", "Source upgrade identity changed.");
  assert.equal(sourceMetadata.build?.nsis?.perMachine, true, "Source installer is not machine-wide.");
  assert.equal(
    Object.hasOwn(sourceMetadata.build?.nsis || {}, "packElevateHelper"),
    false,
    "Source metadata contains an ignored per-machine elevation-helper override.",
  );
  const executablePath = path.resolve(
    process.argv[2] || path.join(projectRoot, "..", `dist-${expectedVersion}`, "win-unpacked", "ExcelsisView.exe"),
  );
  assert.ok(fs.existsSync(executablePath) && fs.statSync(executablePath).isFile(), "Pass a packaged ExcelsisView executable.");
  const executable = fs.readFileSync(executablePath);
  assert.ok(
    executable.includes(Buffer.from(`Electron/${expectedElectronVersion}`, "ascii")),
    `Packaged runtime is not Electron ${expectedElectronVersion}.`,
  );
  assert.ok(
    executable.includes(Buffer.from(`Chrome/${EXPECTED_CHROMIUM_VERSION}`, "ascii")),
    `Packaged runtime is not Chromium ${EXPECTED_CHROMIUM_VERSION}.`,
  );
  const fuseWire = readFuseWire(executable);
  for (let i = 0; i < EXPECTED_FUSES.length; i++) {
    assert.equal(fuseWire[i], EXPECTED_FUSES[i], `${FUSE_NAMES[i]} fuse has an unexpected state.`);
  }

  const asarPath = path.join(path.dirname(executablePath), "resources", "app.asar");
  assert.ok(fs.statSync(asarPath).isFile(), "Packaged app.asar is missing.");
  const integrity = readIntegrityResource(executable);
  const appIntegrity = integrity.find((entry) => String(entry.file || "").toLowerCase().endsWith("resources\\app.asar"));
  assert.ok(appIntegrity, "app.asar is absent from the integrity resource.");
  assert.equal(String(appIntegrity.alg || "").toUpperCase(), "SHA256", "Unexpected ASAR integrity algorithm.");
  const { header } = await readAsarHeader(asarPath);
  const actualHash = crypto.createHash("sha256").update(header).digest("hex");
  assert.equal(
    String(appIntegrity.value || "").toLowerCase(),
    actualHash,
    "Embedded app.asar header hash does not match.",
  );
  const packagedMetadata = JSON.parse(asar.extractFile(asarPath, "package.json").toString("utf8"));
  assert.equal(packagedMetadata.version, expectedVersion, `Packaged version is not ${expectedVersion}.`);
  assert.equal(packagedMetadata.license, expectedLicense, "Packaged AGPL metadata is missing.");
  assert.equal(
    packagedMetadata.allowScripts?.[`electron@${expectedElectronVersion}`],
    true,
    `Packaged metadata does not identify the pinned Electron ${expectedElectronVersion} runtime.`,
  );
  const packagedMain = asar.extractFile(asarPath, "main.cjs").toString("utf8");
  assert.doesNotMatch(packagedMain, /sandbox\s*:\s*false/, "Packaged renderer sandbox is disabled.");
  assert.match(packagedMain, /app\.enableSandbox\(\)/, "Packaged sandbox initialization is missing.");
  assert.match(packagedMain, /assertTrustedSender/, "Packaged IPC sender validation is missing.");
  assert.doesNotMatch(packagedMain, /app:open-path/, "Packaged arbitrary-path shell IPC returned.");
  assert.match(packagedMain, /protocol\.handle\(APP_SCHEME/, "Packaged custom protocol is missing.");
  assert.doesNotMatch(packagedMain, /unsafe-inline/, "Packaged CSP allows inline code.");
  assert.doesNotMatch(packagedMain, /protocol === "file:"/, "Packaged renderer can request file URLs.");

  const resourcesPath = path.join(path.dirname(executablePath), "resources");
  const externalIntegrity = JSON.parse(
    asar.extractFile(asarPath, "external-integrity.json").toString("utf8"),
  );
  assert.equal(externalIntegrity.format, "Excelsis external runtime integrity 1");
  assert.equal(externalIntegrity.version, expectedVersion);
  assert.ok(externalIntegrity.files.length >= 12, "External runtime manifest is incomplete.");
  for (const entry of externalIntegrity.files) {
    const packagedPath = path.join(resourcesPath, ...entry.path.split("/"));
    assert.ok(fs.statSync(packagedPath).isFile(), `External runtime is missing: ${entry.path}`);
    assert.equal(fs.statSync(packagedPath).size, entry.bytes, `External runtime size differs: ${entry.path}`);
    assert.equal(
      crypto.createHash("sha256").update(fs.readFileSync(packagedPath)).digest("hex"),
      entry.sha256,
      `External runtime integrity differs: ${entry.path}`,
    );
  }
  assert.equal(
    fs.existsSync(path.join(resourcesPath, "app-modules")),
    false,
    "Mutable external application modules are still packaged.",
  );

  const packagedProviderPath = path.join(
    path.dirname(executablePath),
    "resources",
    "shell",
    "ExcelsisDxfThumbnailProvider.dll",
  );
  assert.ok(fs.statSync(packagedProviderPath).isFile(), "Packaged Explorer thumbnail provider is missing.");
  const sourceProviderPath = path.join(
    projectRoot,
    "shell",
    "thumbnail-provider",
    "bin",
    "x64",
    "ExcelsisDxfThumbnailProvider.dll",
  );
  assert.equal(
    crypto.createHash("sha256").update(fs.readFileSync(packagedProviderPath)).digest("hex"),
    crypto.createHash("sha256").update(fs.readFileSync(sourceProviderPath)).digest("hex"),
    "Packaged thumbnail provider differs from the tested build output.",
  );
  execFileSync(process.execPath, [
    path.join(projectRoot, "scripts", "audit-thumbnail-provider.cjs"),
    packagedProviderPath,
  ], { stdio: "inherit" });

  const packagedAppSource = path.join(
    resourcesPath,
    "third_party",
    "source",
    "app",
    `ExcelsisView-${expectedVersion}-source.zip`,
  );
  const requiredResourceFiles = [
    "LICENSE.txt",
    "README.md",
    "SOURCE.md",
    "THIRD_PARTY_NOTICES.md",
    "DISTRIBUTION-RISK-ACCEPTANCE.md",
    path.join("native", "process-guard.exe"),
    path.join("native", "nano_prc_app_export.exe"),
    path.join("native", "u3d", "u3d_app_export.exe"),
    path.join("native", "u3d", "IFXCore.dll"),
    path.join("native", "u3d", "IFXImporting.dll"),
    path.join("native", "u3d", "libwinpthread-1.dll"),
    path.join("third_party", "licenses", "three-0.160.0.txt"),
    path.join("third_party", "licenses", "pako-2.1.0.txt"),
    path.join("third_party", "licenses", "buffer-6.0.3.txt"),
    path.join("third_party", "licenses", "ieee754-1.2.1.txt"),
    path.join("third_party", "licenses", "base64-js-1.5.1.txt"),
    path.join("third_party", "licenses", "electron-builder-26.15.3.txt"),
    path.join("third_party", "licenses", "nsis-3.0.4.1.txt"),
    path.join("third_party", "libredwg", "dwg2dxf.exe"),
    path.join("third_party", "libredwg", "libredwg-0.dll"),
    path.join("third_party", "libredwg", "libredwg-0.14.8492-source.tar.gz"),
    path.join("third_party", "libredwg", "NOTICE.txt"),
    path.join("third_party", "licenses", "u3d", "LICENSE-U3D-Apache-2.0.txt"),
    path.join("third_party", "licenses", "u3d", "LICENSE-libwinpthread.txt"),
    path.join("third_party", "licenses", "u3d", "LICENSE-libpng.txt"),
    path.join("third_party", "licenses", "u3d", "LICENSE-zlib.txt"),
    path.join("third_party", "licenses", "u3d", "LICENSE-libjpeg-turbo.md"),
    path.join("third_party", "source", "u3d", "u3d-modified-source-5c141d9f.zip"),
    path.join("third_party", "source", "app", `ExcelsisView-${expectedVersion}-source.zip`),
  ];
  for (const relativePath of requiredResourceFiles) {
    assert.ok(
      fs.statSync(path.join(resourcesPath, relativePath)).isFile(),
      `Packaged compliance/security resource is missing: ${relativePath}`,
    );
  }
  const packagedSourceDirectory = path.join(resourcesPath, "third_party", "source", "app");
  const packagedAppArchives = fs.readdirSync(packagedSourceDirectory)
    .filter((name) => /^ExcelsisView-.*-source\.zip$/i.test(name));
  assert.deepEqual(
    packagedAppArchives,
    [`ExcelsisView-${expectedVersion}-source.zip`],
    "Packaged resources contain a stale or unexpected ExcelsisView source archive.",
  );
  const sourceLicense = fs.readFileSync(path.join(projectRoot, "LICENSE.txt"));
  const packagedLicense = fs.readFileSync(path.join(resourcesPath, "LICENSE.txt"));
  assert.equal(
    crypto.createHash("sha256").update(packagedLicense).digest("hex"),
    crypto.createHash("sha256").update(sourceLicense).digest("hex"),
    "Packaged product license differs from the source license.",
  );
  assert.match(
    packagedLicense.toString("utf8"),
    /GNU AFFERO GENERAL PUBLIC LICENSE[\s\S]*Version 3, 19 November 2007/,
    "Packaged product license is not the complete GNU AGPLv3 text.",
  );
  assert.match(
    fs.readFileSync(path.join(resourcesPath, "THIRD_PARTY_NOTICES.md"), "utf8"),
    new RegExp(`NSIS 3\\.0\\.4\\.1[\\s\\S]*${EXPECTED_ELEVATE_HELPER_SHA256}`, "i"),
    "Packaged notices do not document the pinned per-machine elevation helper.",
  );
  for (const [sourcePath, packagedPath] of [
    [
      path.join(projectRoot, "native", "process-guard.exe"),
      path.join(resourcesPath, "native", "process-guard.exe"),
    ],
    [
      path.join(projectRoot, "third_party", "libredwg", "dwg2dxf.exe"),
      path.join(resourcesPath, "third_party", "libredwg", "dwg2dxf.exe"),
    ],
    [
      path.join(projectRoot, "third_party", "libredwg", "libredwg-0.dll"),
      path.join(resourcesPath, "third_party", "libredwg", "libredwg-0.dll"),
    ],
    [
      path.join(projectRoot, "modules", "3dpdf", "native", "nano_prc_app_export.exe"),
      path.join(resourcesPath, "native", "nano_prc_app_export.exe"),
    ],
    ...[
      "u3d_app_export.exe",
      "IFXCore.dll",
      "IFXImporting.dll",
      "libwinpthread-1.dll",
    ].map((name) => [
      path.join(projectRoot, "modules", "3dpdf", "native", "u3d", name),
      path.join(resourcesPath, "native", "u3d", name),
    ]),
  ]) {
    assert.equal(
      crypto.createHash("sha256").update(fs.readFileSync(packagedPath)).digest("hex"),
      crypto.createHash("sha256").update(fs.readFileSync(sourcePath)).digest("hex"),
      `Packaged native file differs from the tested source: ${path.basename(packagedPath)}`,
    );
  }
  assert.equal(
    crypto.createHash("sha256").update(fs.readFileSync(
      path.join(resourcesPath, "third_party", "libredwg", "libredwg-0.14.8492-source.tar.gz"),
    )).digest("hex"),
    "9935245817278c944c681527ef52eee81ccf720fce09f9fb467d0d6a926ae3ce",
    "Packaged LibreDWG corresponding source has the wrong hash.",
  );
  const packagedPdfHtml = asar.extractFile(
    asarPath,
    path.join("modules", "3dpdf", "index.html"),
  ).toString("utf8");
  const packagedPdfApp = asar.extractFile(
    asarPath,
    path.join("modules", "3dpdf", "app.mjs"),
  ).toString("utf8");
  const packagedNanoWorker = asar.extractFile(
    asarPath,
    path.join("modules", "3dpdf", "nano-prc-worker.mjs"),
  ).toString("utf8");
  const packagedU3dWorker = asar.extractFile(
    asarPath,
    path.join("modules", "3dpdf", "u3d-pdf-worker.mjs"),
  ).toString("utf8");
  const packagedPdfEditor = asar.extractFile(
    asarPath,
    path.join("modules", "3dpdf", "pdf-editor.mjs"),
  ).toString("utf8");
  const packagedImageWorker = asar.extractFile(
    asarPath,
    path.join("modules", "3dpdf", "pdf-image-worker.js"),
  ).toString("utf8");
  const packagedWorkerClient = asar.extractFile(
    asarPath,
    path.join("modules", "shared", "worker-client.mjs"),
  ).toString("utf8");
  const packagedNanoExporter = path.join(
    resourcesPath,
    "native",
    "nano_prc_app_export.exe",
  );
  const packagedProcessGuard = path.join(
    resourcesPath,
    "native",
    "process-guard.exe",
  );
  const packagedU3dRoot = path.join(resourcesPath, "native", "u3d");
  const packagedU3dExporter = path.join(packagedU3dRoot, "u3d_app_export.exe");
  const packagedU3dCore = path.join(packagedU3dRoot, "IFXCore.dll");
  const packagedU3dImporting = path.join(packagedU3dRoot, "IFXImporting.dll");
  const packagedU3dWinpthreads = path.join(packagedU3dRoot, "libwinpthread-1.dll");
  const packagedElevateHelper = path.join(resourcesPath, "elevate.exe");
  const packagedNanoLicense = asar.extractFile(
    asarPath,
    path.join("modules", "3dpdf", "native", "LICENSE-nanoPRC.txt"),
  );
  const packagedNanoSource = path.join(
    resourcesPath,
    "third_party",
    "source",
    "nanoprc",
    "nanoPRC-modified-source-66cacb70.zip",
  );
  const packagedU3dSource = path.join(
    resourcesPath,
    "third_party",
    "source",
    "u3d",
    "u3d-modified-source-5c141d9f.zip",
  );
  for (const requiredPath of [
    packagedProcessGuard,
    packagedNanoExporter,
    packagedNanoSource,
    packagedU3dExporter,
    packagedU3dCore,
    packagedU3dImporting,
    packagedU3dWinpthreads,
    packagedU3dSource,
    packagedElevateHelper,
  ]) {
    assert.ok(fs.statSync(requiredPath).isFile(), `Packaged native/compliance asset is missing: ${requiredPath}`);
  }
  const nativeMitigations = {
    processGuard: assertPeMitigations(packagedProcessGuard, "Packaged process guard"),
    nanoPrcExporter: assertPeMitigations(packagedNanoExporter, "Packaged nanoPRC exporter"),
    u3dExporter: assertPeMitigations(packagedU3dExporter, "Packaged U3D exporter"),
    u3dCore: assertPeMitigations(packagedU3dCore, "Packaged U3D core"),
    u3dImporting: assertPeMitigations(packagedU3dImporting, "Packaged U3D importer"),
    u3dWinpthreads: assertPeMitigations(packagedU3dWinpthreads, "Packaged U3D threading runtime"),
    electronBuilderElevateHelper: assertPeMitigations(
      packagedElevateHelper,
      "Packaged electron-builder elevation helper",
    ),
  };
  assert.equal(
    crypto.createHash("sha256").update(fs.readFileSync(packagedElevateHelper)).digest("hex"),
    EXPECTED_ELEVATE_HELPER_SHA256,
    "Packaged elevation helper differs from the pinned NSIS 3.0.4.1 helper.",
  );
  assert.ok(packagedNanoLicense.length > 100, "Packaged nanoPRC license is missing.");
  assert.match(
    packagedPdfApp,
    /createWorkerTaskClient\([\s\S]{0,250}nano-prc-worker\.mjs/,
    "Packaged 3D PDF UI does not route nanoPRC work through its dedicated worker.",
  );
  assert.match(
    packagedNanoWorker,
    /decodeNanoDocument[\s\S]{0,8000}decode-nanoprc/,
    "Packaged nanoPRC worker does not contain the decoder task route.",
  );
  assert.match(
    packagedPdfApp,
    /createWorkerTaskClient\([\s\S]{0,250}u3d-pdf-worker\.mjs/,
    "Packaged 3D PDF UI does not route U3D PDF extraction through its dedicated worker.",
  );
  assert.match(
    packagedU3dWorker,
    /decodePDFRawStream[\s\S]{0,8000}extract-u3d/,
    "Packaged U3D PDF worker does not contain the stream extraction route.",
  );
  assert.match(
    packagedPdfEditor,
    /createWorkerTaskClient\([\s\S]{0,250}pdf-image-worker\.js/,
    "Packaged PDF UI does not route image processing through its dedicated worker.",
  );
  assert.match(packagedImageWorker, /\bcv\.inpaint\b/, "Packaged PDF image worker omits inpainting.");
  assert.match(packagedWorkerClient, /\bnew Worker\b/, "Packaged worker client cannot start background workers.");
  assert.doesNotMatch(
    `${packagedPdfHtml}\n${packagedPdfApp}\n${packagedNanoWorker}`,
    /prcDoubleTable|meshwalk_exact|extractPRCFromPDF|decodeDocumentScene/,
    "The previous embedded decoder leaked into the packaged PDF module.",
  );
  const sourceNanoExporter = path.join(
    projectRoot,
    "modules",
    "3dpdf",
    "native",
    "nano_prc_app_export.exe",
  );
  assert.equal(
    crypto.createHash("sha256").update(fs.readFileSync(packagedNanoExporter)).digest("hex"),
    crypto.createHash("sha256").update(fs.readFileSync(sourceNanoExporter)).digest("hex"),
    "Packaged nanoPRC exporter differs from the tested build output.",
  );
  const nanoArchiveEntries = execFileSync("tar.exe", ["-tf", packagedNanoSource], {
    encoding: "utf8",
  });
  for (const expectedEntry of [
    "probe.c",
    "build.ps1",
    "README.md",
    "MODIFICATIONS.md",
    "generated/prc_version.h",
    "upstream/src/prc_api.c",
    "upstream/demos/json_export/src/json_export.c",
    "upstream/demos/teapot_write/src/teapot_write.c",
  ]) {
    assert.ok(
      nanoArchiveEntries.split(/\r?\n/).includes(expectedEntry),
      `nanoPRC corresponding source omits ${expectedEntry}.`,
    );
  }
  const u3dArchiveEntries = execFileSync("tar.exe", ["-tf", packagedU3dSource], {
    encoding: "utf8",
  }).split(/\r?\n/);
  for (const expectedEntry of [
    "UPSTREAM-COMMIT.txt",
    "build.ps1",
    "README.md",
    "PATCHES.md",
    "bridge/u3d_app_export.cpp",
    "upstream/COPYING",
    "upstream/RTL/Component/Include/IFXVoidStar.h",
    "upstream/RTL/Kernel/IFXCom/CIFXComponentManager.cpp",
    "upstream/Samples/TestScenes/box_group.pdf",
    "upstream/Samples/TestScenes/box_group.u3d",
  ]) {
    assert.ok(
      u3dArchiveEntries.includes(expectedEntry),
      `U3D corresponding source omits ${expectedEntry}.`,
    );
  }
  const appArchiveEntries = execFileSync("tar.exe", ["-tf", packagedAppSource], {
    encoding: "utf8",
  }).split(/\r?\n/);
  const sourcePrefix = `ExcelsisView-${expectedVersion}-source`;
  const appPrefix = `${sourcePrefix}/ExcelsisView-${expectedVersion}/app-asar-extract`;
  for (const expectedEntry of [
    `${appPrefix}/main.cjs`,
    `${appPrefix}/package-lock.json`,
    `${appPrefix}/README.md`,
    `${appPrefix}/scripts/test-nanoprc-bridge.cjs`,
    `${appPrefix}/scripts/test-u3d-bridge.cjs`,
    `${appPrefix}/native/process-guard.cpp`,
    `${appPrefix}/shell/thumbnail-provider/src/thumbnail_provider.cpp`,
    `${appPrefix}/DISTRIBUTION-RISK-ACCEPTANCE.md`,
    `${sourcePrefix}/prc/nanoprc/probe.c`,
    `${sourcePrefix}/prc/nanoprc/generated/prc_version.h`,
    `${sourcePrefix}/prc/nanoprc/upstream/demos/teapot_write/src/teapot_write.c`,
    `${sourcePrefix}/u3d/bridge/u3d_app_export.cpp`,
    `${sourcePrefix}/u3d/upstream/RTL/Component/Include/IFXVoidStar.h`,
    `${sourcePrefix}/u3d/upstream/Samples/TestScenes/box_group.u3d`,
  ]) {
    assert.ok(appArchiveEntries.includes(expectedEntry), `Application source archive omits ${expectedEntry}.`);
  }
  assert.ok(
    !appArchiveEntries.some((entry) => /(?:^|\/)(?:node_modules|obj)(?:\/|$)/i.test(entry)),
    "Application source archive contains dependency/build caches.",
  );
  assert.ok(
    !appArchiveEntries.some((entry) => (
      /\.(?:pdf|prc|u3d)$/i.test(entry)
      && !entry.startsWith(`${sourcePrefix}/prc/nanoprc/upstream/`)
      && !entry.startsWith(`${sourcePrefix}/u3d/upstream/`)
    )),
    "Application source archive unexpectedly contains a non-upstream PDF/PRC fixture.",
  );

  const releaseOutput = path.dirname(path.dirname(executablePath));
  const installerPath = path.join(releaseOutput, `ExcelsisView-Setup-${expectedVersion}.exe`);
  assert.ok(fs.existsSync(installerPath) && fs.statSync(installerPath).isFile(), "Version-matching installer is missing.");
  assert.match(
    readManifest(installerPath),
    /requestedExecutionLevel[^>]+level=(?:"|')requireAdministrator(?:"|')/i,
    "Installer does not request administrator rights before showing its wizard.",
  );
  for (const [releaseName, packagedSource] of [
    [`SOURCE-ExcelsisView-${expectedVersion}.zip`, packagedAppSource],
    ["SOURCE-nanoPRC-66cacb70.zip", packagedNanoSource],
    ["SOURCE-U3D-5c141d9f.zip", packagedU3dSource],
    [
      "SOURCE-LibreDWG-0.14.8492.tar.gz",
      path.join(resourcesPath, "third_party", "libredwg", "libredwg-0.14.8492-source.tar.gz"),
    ],
    ["LICENSE.txt", path.join(resourcesPath, "LICENSE.txt")],
    ["README.md", path.join(resourcesPath, "README.md")],
    ["SOURCE.md", path.join(resourcesPath, "SOURCE.md")],
    ["THIRD_PARTY_NOTICES.md", path.join(resourcesPath, "THIRD_PARTY_NOTICES.md")],
    [
      "DISTRIBUTION-RISK-ACCEPTANCE.md",
      path.join(resourcesPath, "DISTRIBUTION-RISK-ACCEPTANCE.md"),
    ],
  ]) {
    const adjacentPath = path.join(releaseOutput, releaseName);
    assert.ok(fs.statSync(adjacentPath).isFile(), `Installer-adjacent material is missing: ${releaseName}`);
    assert.equal(
      crypto.createHash("sha256").update(fs.readFileSync(adjacentPath)).digest("hex"),
      crypto.createHash("sha256").update(fs.readFileSync(packagedSource)).digest("hex"),
      `Installer-adjacent material differs from the packaged copy: ${releaseName}`,
    );
  }
  console.log(JSON.stringify({
    executablePath,
    installerPath,
    version: expectedVersion,
    runtime: {
      electron: expectedElectronVersion,
      chromium: EXPECTED_CHROMIUM_VERSION,
    },
    fuses: Object.fromEntries(FUSE_NAMES.map((name, index) => [name, fuseWire[index]])),
    asarIntegrity: { algorithm: "SHA256", hash: actualHash },
    nanoPrc: {
      exporterPath: packagedNanoExporter,
      sourceArchivePath: packagedNanoSource,
    },
    u3d: {
      exporterPath: packagedU3dExporter,
      sourceArchivePath: packagedU3dSource,
      upstreamCommit: "5c141d9f0d366357e2b7cf93af2eade284a334be",
    },
    libredwg: {
      version: "0.14.8492",
      commit: "c34d1efb8fce8dfcd5bd7b4308c0d5e0b9de0a30",
    },
    nativeMitigations,
    authenticode: "unsigned distribution risk accepted by owner",
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
