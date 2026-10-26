const assert = require("node:assert/strict");
const crypto = require("node:crypto");
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
const updaterUtils = read("update-center-utils.cjs");
const guardedProcess = read("guarded-process.cjs");
const processGuard = read("native/process-guard.cpp");
const thumbnailProvider = read("shell/thumbnail-provider/src/thumbnail_provider.cpp");
const nanoBuild = read("../../prc/nanoprc/build.ps1");
const u3dBuild = read("../../u3d/build.ps1");
const nanoTest = read("scripts/test-nanoprc-bridge.cjs");
const u3dTest = read("scripts/test-u3d-bridge.cjs");
const u3dHardeningTest = read("scripts/test-u3d-hardening.cjs");
const sourcePackager = read("scripts/package-corresponding-source.ps1");
const nanoSourcePackager = read("scripts/package-nanoprc-source.ps1");
const runtimeBuilder = read("scripts/build-3d-runtime.mjs");
const runtimeTest = read("scripts/test-3d-runtime.mjs");
const installerScript = read("build/installer.nsh");
const rootLicense = read("LICENSE.txt");
const launcher = read("launcher/index.html");
const updateCenterPage = read("launcher/update-center.html");
const sourceDocument = read("SOURCE.md");
const notices = read("THIRD_PARTY_NOTICES.md");
const readme = read("README.md");
const pdfJsRuntime = read("modules/3dpdf/vendor/pdfjs/pdf.min.mjs");
const threeRuntime = read("modules/3dpdf/vendor/runtime.mjs");
const nanoImageConfig = read("../../prc/nanoprc/upstream/src/prc_stb_image_config.h");
const nanoImageSource = read("../../prc/nanoprc/upstream/src/stb_image.h");
const nanoGeometrySource = read("../../prc/nanoprc/upstream/src/prc_parse_extra_geometry.c");
const nanoZlibSource = read("../../prc/nanoprc/upstream/thirdparty/zlib/zutil.c");
const nanoExporterBytes = fs.readFileSync(
  path.join(projectRoot, "modules", "3dpdf", "native", "nano_prc_app_export.exe"),
);
const lock = JSON.parse(read("package-lock.json"));
const pdfLoaders = [
  "modules/3dpdf/regular-pdf.mjs",
  "modules/3dpdf/batch-print.mjs",
  "modules/3dpdf/print-document.mjs",
  "modules/3dpdf/pdf-merge.mjs",
  "modules/3dpdf/pdf-thumbnail.mjs",
];
const pkg = JSON.parse(read("package.json"));

assert.equal(pkg.version, "1.1.52");
assert.equal(pkg.devDependencies.electron, "43.8.3");
assert.equal(pkg.devDependencies["pdfjs-dist"], "6.2.108");
assert.equal(pkg.devDependencies.three, "0.160.0");
assert.equal(pkg.devDependencies.pako, "2.1.0");
assert.equal(pkg.devDependencies.buffer, "6.0.3");
assert.equal(lock.packages["node_modules/three"].version, "0.160.0");
assert.equal(lock.packages["node_modules/pako"].version, "2.1.0");
assert.equal(lock.packages["node_modules/buffer"].version, "6.0.3");
assert.deepEqual(pkg.allowScripts, {
  "electron@43.8.3": true,
  "electron-winstaller@5.4.0": false,
  "esbuild@0.25.12": true,
  "tesseract.js@7.0.0": false,
});
assert.equal(pkg.build.appId, "local.excelsis.view");
assert.match(pdfJsRuntime, /pdfjsVersion = 6\.2\.108/, "The bundled PDF.js runtime is not 6.2.108.");
assert.match(pkg.scripts["test:pdf"], /npm run sync:pdfjs/, "PDF tests do not synchronize the pinned PDF.js runtime.");
assert.equal(pkg.scripts["build:3d-runtime"], "node scripts/build-3d-runtime.mjs");
assert.match(pkg.scripts["test:pdf"], /npm run build:3d-runtime/);
assert.match(pkg.scripts["test:pdf"], /node scripts\/test-3d-runtime\.mjs/);
assert.match(pkg.scripts["test:pdf"], /test-pdf-content-edit\.mjs/);
assert.match(pkg.scripts["test:pdf"], /test-pdf-editor-renderer\.cjs/);
assert.match(pkg.scripts["test:pdf"], /test-pdf-annotation-edit-renderer\.cjs/);
assert.match(pkg.scripts["test:pdf"], /test-pdf-navigation-io\.cjs/);
assert.match(pkg.scripts["test:pdf"], /test-pdf-print-renderer\.cjs/);
assert.match(pkg.scripts["test:pdf"], /test-pdf-merge\.cjs/);
assert.match(pkg.scripts["test:pdf"], /test-pdf-merge-renderer\.cjs/);
assert.match(pkg.scripts["test:pdf"], /test-explorer-verb-startup\.cjs/);
assert.match(pkg.scripts["test:dwg"], /test-dxf-thread-holes\.mjs/);
assert.match(pkg.scripts["test:dwg"], /test-dxf-hole-tools-renderer\.cjs/);
assert.match(pkg.scripts["test:dwg"], /test-dxf-feature-list-follow-renderer\.cjs/);
const threadHoles = read("modules/dxf/thread-holes.mjs");
assert.doesNotMatch(threadHoles, /\b(?:fetch|eval|Function|require|import)\s*\(/, "Thread-hole detection must stay a pure table/model.");
// A deleted view is settled by the next claim or an explicit release, not by
// a short timer that could close a tile while it opens the next folder file.
assert.doesNotMatch(main, /setTimeout\(\(\) => viewerWorkspaces\.changed\(/, "Delete must not remove views on a fixed short timer.");
assert.match(main, /pendingDeletedViews\.set\(event\.sender\.id, \{ path: sourcePath, timer \}\)/);
assert.match(main, /if \(updateWorkspace\) settleDeletedView\(webContentsId, false\);/);
assert.equal((main.match(/settleDeletedView\(event\.sender\.id, true\);/g) || []).length, 2, "Both release handlers settle deleted views.");
const pdfContentEdit = read("modules/3dpdf/pdf-content-edit.mjs");
assert.match(pdfContentEdit, /const LIMIT = 32 \* 1024 \* 1024/);
assert.match(pdfContentEdit, /depth>16\|\|\+\+visited>4096/);
assert.match(pdfContentEdit, /Original text could not|original text could not/);
assert.doesNotMatch(pdfContentEdit, /\b(?:fetch|eval|Function|require)\s*\(/);
assert.match(runtimeBuilder, /Expected exactly one Three\.js 0\.160\.0 UUID generator/);
assert.match(runtimeBuilder, /globalThis\.crypto\.getRandomValues/);
assert.match(threeRuntime, /crypto\.getRandomValues/);
assert.doesNotMatch(
  threeRuntime,
  /Math\.random\(\)\*4294967295/,
  "The generated Three.js UUID path still uses Math.random.",
);
assert.match(runtimeTest, /Three\.js UUID creation called Math\.random/);
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
assert.match(main, /handleTrusted\("recents:list", \["dxf", "3dpdf"\]/);
assert.match(main, /handleTrusted\("recents:open", \["dxf", "3dpdf"\]/);
assert.match(main, /getRecentFiles\(\).resolve\(section, id\)/, "Recents must resolve a stored section-bound id.");
assert.match(main, /requireBoundedFile\(entry.path, section === "pdf"/);
assert.match(preload, /open: \(id\) => ipcRenderer.invoke\("recents:open", id\)/);
assert.doesNotMatch(read("modules/shared/recents.mjs"), /innerHTML|insertAdjacentHTML/);
assert.match(pkg.scripts.dist, /npm run test:recents-racetrack/);
for (const action of ["rename", "delete"]) {
  assert(main.includes(`handleTrusted("fs:${action}-current-file", ["dxf", "3dpdf"]`));
}
assert.match(main, /const sourcePath = requireFileCapability\(event, filePath, rendererOwner\(event.sender\)/);
assert.match(main, /viewerWorkspaces.owner\(contents\) \|\| BrowserWindow.fromWebContents\(contents\)/);
assert.match(main, /event.senderFrame !== event.sender.mainFrame/);
assert.match(main, /senderUrl !== win.excelsisEntryUrl/);
const workspace = read("viewer-workspace.cjs");
assert.doesNotMatch(workspace, /sandbox\s*:\s*false|nodeIntegration\s*:\s*true/);
assert.match(main, /register: \(handle, fileSet\)[\s\S]{0,160}secureWebContents\(handle, moduleEntryUrl/);
assert.match(workspace, /if \(!item\) throw new Error/);
assert.match(workspace, /if \(!item.root\)[\s\S]{0,500}menu.documentId !== item.doc.id \|\| !item.doc.shown/);
assert.match(workspace, /\['menu-select', 'menu-close'\].includes\(action\) && menu.folder.files.some\(file => file.id === id\)/);
assert.match(workspace, /else throw new Error\('Only the workspace title bar/);
assert.match(workspace, /menuGeneration !== null && \(!ws.menuOpen \|\| ws.menuGeneration !== menuGeneration\)/);
const folderContext = workspace.slice(workspace.indexOf("if (action === 'folder-context')"), workspace.indexOf("if (action === 'menu')"));
assert(workspace.indexOf("if (!item.root)") < workspace.indexOf("if (action === 'folder-context')"), "Folder context actions must pass the root-only titlebar guard.");
assert.match(folderContext, /state\(ws\).folders.find\(folder => folder.id === id\?\.folderId\)/);
assert.match(folderContext, /Number.isFinite\(id\?\.x\)/);
assert.match(folderContext, /Number.isFinite\(id\?\.y\)/);
assert.match(folderContext, /state\(ws\).folders.find\(entry => entry.id === folder.id\)/, "Revalidate the open folder when its menu item is clicked.");
assert.match(folderContext, /ws.window.isDestroyed\(\) \|\| !current/);
assert.match(folderContext, /await openFolder\(current.path\)/, "Shell opening must use main-owned folder metadata.");
assert.match(main, /id: "workspace-open-folder", label: "Open folder"/);
assert.match(main, /fs.stat\(folder\)\).isDirectory\(\)/);
assert.match(main, /shell.openPath\(folder\)/);
assert.match(read("modules/shared/workspace.mjs"), /if \(drop.contains\(event.target\)\) return/);
assert.match(workspace, /if \(method === 'status' && value\)[\s\S]{0,180}isBusy\(doc.handle.webContents.id\)/);
assert.match(main, /documentWrites.set\(id, channel\)/);
assert.match(main, /finally\(\(\) => \{\s*documentWrites.delete\(id\)/);
assert.match(main, /handleTrusted\("workspace:open", \["dxf", "3dpdf"\]/);
assert.match(main, /filePaths.map\(filePath => requireFileCapability/);
assert.match(main, /viewerWorkspaces.isOpenElsewhere\(resolved, event.sender\)/);
assert.doesNotMatch(read("modules/shared/workspace.mjs"), /innerHTML|insertAdjacentHTML/);
assert(pkg.build.files.includes("viewer-workspace.cjs"));
assert.match(sourcePackager, /"viewer-workspace.cjs"/);
assert.match(pkg.scripts.dist, /npm run test:workspace/);
assert.match(pkg.scripts['test:workspace'], /test-workspace-close-all.cjs/);
assert.match(pkg.scripts['test:recents-racetrack'], /test-dxf-embedded-metadata.mjs/);
assert.match(read('modules/dxf/embedded-metadata.mjs'), /MAX_METADATA_CHARS = 256 \* 1024/);
assert.match(read('modules/dxf/app.js'), /metadataFileName\.textContent/);
assert.match(read('modules/dxf/app.js'), /const fileActionDisabled = [^;]*state\.fileNavigationBusy/, "DXF Rename/Delete/Cut must wait while the next folder file loads.");
assert.match(read('modules/dxf/app.js'), /async function saveFile\(\) \{\n  while \(activeSave\) await activeSave\.catch/, "A DXF save must queue behind one still being written.");
assert.match(main, /fileActions.run\(event.sender.id, sourcePath, action, newName\)/);
assert.match(main, /shell.trashItem\(filePath\)/);
assert.match(main, /claim.normalizedPath !== normalizePath\(sourcePath\)/);
assert.match(read("file-actions.cjs"), /assertCurrent\(owner, sourcePath, destination\) !== claim/);
const fileActionSource = read("file-actions.cjs");
assert.doesNotMatch(fileActionSource, /\b(rm|rmdir)\s*\(|recursive\s*:/, "File Delete must never use recursive or directory removal.");
assert.equal((fileActionSource.match(/\bunlink\s*\(/g) || []).length, 1, "Only the one-path unlink boundary is allowed.");
assert.match(fileActionSource, /permanentlyDelete = filePath => io.unlink\(filePath\)/);
assert.match(fileActionSource, /await confirmPermanentDelete\(owner, sourcePath, recycleError\) !== true/);
assert.match(fileActionSource, /await recheck\(\);[\s\S]{0,220}await permanentlyDelete\(sourcePath\)/);
assert.match(fileActionSource, /current.isFile\(\).*current.isSymbolicLink\(\)/);
assert.match(main, /buttons: \["Cancel", "Permanently delete file"\], defaultId: 0, cancelId: 0/);
assert.match(main, /const win = handle\?\.nativeWindow \|\| handle/, "Child editor warnings must use the containing native window.");
assert.match(main, /if \(result.canceled\) return result/);
assert.doesNotMatch(preload, /confirmPermanentDelete|permanentlyDelete|permanent-delete/, "No renderer bypass of the native confirmation.");
assert.doesNotMatch(read("modules/shared/file-action-dialog.mjs"), /innerHTML|insertAdjacentHTML/);
assert(pkg.build.files.includes("file-actions.cjs"));
assert.match(sourcePackager, /"file-actions.cjs"/);
const cutSource = read('file-clipboard.cjs');
const clipboardNative = read('native/file-clipboard.cpp');
assert.doesNotMatch(cutSource, /\b(rm|rmdir)\s*\(|recursive\s*:/, 'Cut must never remove a directory tree.');
assert.match(cutSource, /session.performed === 2 && session.paste === 2/);
assert.match(cutSource, /await io.unlink\(session.path\)/);
assert.match(cutSource, /recheck.isFile\(\).*recheck.isSymbolicLink\(\)/);
assert.match(cutSource, /await io.readdir\(path.dirname\(session.path\)\)/, 'A missing NAS path alone must not close a file.');
assert.match(main, /handleTrusted\("fs:cut-current-file", \["dxf", "3dpdf"\]/);
assert.match(main, /clipboardCuts.isLocked\(String\(args\[0\]\)\)/);
assert.match(workspace, /buttons: \['Save and Cut', 'Discard changes and Cut', 'Cancel'\]/);
assert.match(workspace, /const doc = ws.model.find\(filePath\)/);
assert.doesNotMatch(preload, /receipt|pasteSucceeded|performedDropEffect/, 'Renderers cannot forge paste completion.');
assert.match(clipboardNative, /OleSetClipboard\(object\)/);
assert.match(clipboardNative, /CF_HDROP/);
assert.match(clipboardNative, /Preferred DropEffect/);
assert.match(clipboardNative, /JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE/);
assert.match(clipboardNative, /JOB_OBJECT_LIMIT_ACTIVE_PROCESS/);
assert.match(clipboardNative, /JOB_OBJECT_LIMIT_PROCESS_MEMORY/);
assert.doesNotMatch(clipboardNative, /\b(DeleteFile|RemoveDirectory|SHFileOperation|MoveFile|CopyFile)(?:W|A)?\s*\(/);
assert.doesNotMatch(read('modules/shared/file-cut.mjs'), /innerHTML|insertAdjacentHTML/);
assert(pkg.build.files.includes('file-clipboard.cjs'));
assert(pkg.build.files.includes('file-clipboard-transport.cjs'));
assert(pkg.build.extraResources.some(entry => entry.from === 'native/file-clipboard.exe'));
assert.match(sourcePackager, /native\\file-clipboard.cpp/);
assert.match(pkg.scripts['test:recents-racetrack'], /test-file-clipboard-renderer.cjs/);
assert.match(pkg.scripts["test:recents-racetrack"], /test-file-actions.cjs/);
assert.match(pkg.scripts["test:recents-racetrack"], /test-folder-navigation.cjs/);
assert.match(pkg.scripts["test:shell"], /test-network-thumbnail-policy.cjs/);
assert(pkg.build.files.includes("network-thumbnail-policy.cjs"));
assert.match(sourcePackager, /"network-thumbnail-policy.cjs"/);
assert.match(thumbnailProvider, /DllInstall\(BOOL install, LPCWSTR command\)/);
assert.match(installerScript, /\/s \/n \/i:network-thumbnail-cache/);
assert.match(installerScript, /\$\{IfNot\} \$\{isUpdated\}/);
assert.match(installerScript, /\/s \/u \/n \/i:network-thumbnail-cache/);
const networkPolicy = read("shell/thumbnail-provider/src/network_thumbnail_policy.h");
assert.match(networkPolicy, /DisableThumbsDBOnNetworkFolders/);
assert.doesNotMatch(networkPolicy, /DisableThumbnails|RegDeleteTree|SHFileOperation|TerminateProcess/);
assert.doesNotMatch(preload, /network-thumbnail/);
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
assert.match(
  main,
  /handleTrusted\("update:get-catalog", \["update-center"\]/,
  "Update lookup is not confined to the update-center page.",
);
assert.match(
  main,
  /productForKey\(requestedProductKey\)\.key/,
  "Update installation accepts something broader than a fixed product key.",
);
assert.match(main, /app\.getPath\("downloads"\)/, "Updates are not confined to Downloads.");
assert.match(main, /fileHasExpectedInstaller/, "Update installers are not verified before launch.");
assert.match(main, /crypto\.timingSafeEqual/, "Update SHA-256 comparison is not timing-safe.");
assert.match(main, /shell\.openPath\(installerPath\)/, "The verified installer is not opened through Windows.");
assert.doesNotMatch(main, /shell\.openExternal/, "The main process can open arbitrary external URLs.");
assert.match(preload, /install: \(productKey\).*update:download-and-run/, "Updater IPC is missing.");
assert.doesNotMatch(preload, /downloadUrl|installerPath/, "Updater preload exposes a URL or path capability.");
assert.match(updaterUtils, /simonsystem609/, "Updater owner is not fixed.");
assert.match(updaterUtils, /repository: "ExcelsisViewer"/, "Viewer update repository is not fixed.");
assert.match(updaterUtils, /repository: "ExcelsisHelper"/, "Helper update repository is not fixed.");
assert.match(
  updaterUtils,
  /uninstallGuid: "9542c8ef-f59a-55a8-bf9f-0ca14a456236"/,
  "Viewer installed-version lookup is not pinned to its NSIS identity.",
);
assert.match(
  updaterUtils,
  /uninstallGuid: "9902802a-b027-5709-9ce3-7a9d4fdcc95c"/,
  "Helper installed-version lookup is not pinned to its NSIS identity.",
);
assert.match(updaterUtils, /release\.immutable !== true/, "Mutable releases are not rejected.");
assert.match(updaterUtils, /sha256:/i, "GitHub SHA-256 release digests are not required.");
assert.match(main, /registryQueryExecutable\(\), \[/, "Installed versions are not read with a fixed executable.");
assert.match(main, /"DisplayVersion"/, "Installed versions are not read from the uninstall registry.");
assert.match(
  main,
  /updateStatusForVersions\(installedVersion, update\.version\)/,
  "Installer launch does not re-check the installed version.",
);
assert.match(main, /is newer than the latest public version/, "Updater does not prevent downgrades.");
assert.ok(pkg.build.files.includes("update-center-utils.cjs"), "Updater validation is omitted from the ASAR.");
assert.ok(pkg.build.files.includes("macro-update-files.cjs"), "Macro update transaction is omitted from the ASAR.");
assert.match(main, /handleTrusted\("update:install-macros", \["update-center"\]/,
  "Macro installation is not confined to Update Center.");
assert.match(main, /replaceInstalledMacros\(app\.getPath\("documents"\)/,
  "Macro installation does not use the current user's Documents path.");
assert.match(preload, /installMacros: \(\) => ipcRenderer\.invoke\("update:install-macros"\)/,
  "The opt-in macro action is not exposed through the trusted preload.");
const dxfSaveAsHandler = main.slice(
  main.indexOf('handleTrusted("fs:save-dxf-as"'),
  main.indexOf("for (const [channel, suffix]"),
);
assert.match(dxfSaveAsHandler, /requireFileCapability/, "DXF Save As does not require a source capability.");
assert.match(dxfSaveAsHandler, /requireBoundedDxfText/, "DXF Save As output is not size-bounded.");
assert.match(dxfSaveAsHandler, /dialog\.showSaveDialog/, "DXF Save As is not user-authorized by a save dialog.");
assert.match(dxfSaveAsHandler, /extensions:\s*\["dxf"\]/, "DXF Save As is not restricted to DXF output.");
assert.match(dxfSaveAsHandler, /ownerForPath/, "DXF Save As can overwrite a file owned by another window.");
assert.match(dxfSaveAsHandler, /viewerWorkspaces.isOpenElsewhere/, "Unloaded open DXF tabs must retain Save As overwrite protection.");
const pdfWriteHandler = main.slice(
  main.indexOf('handleTrusted("fs:write-pdf"'),
  main.indexOf('async function savePdfAs('),
);
assert.match(pdfWriteHandler, /requireFileCapability/, "PDF Save does not require a source capability.");
assert.match(pdfWriteHandler, /requireWriteClaim/, "PDF Save can overwrite a file not owned by its window.");
assert.match(pdfWriteHandler, /boundedPdfOutput/, "PDF Save output is not size-bounded.");
assert.match(pdfWriteHandler, /broadcastFileSaved/, "PDF Save does not notify other viewers.");
const pdfSaveAsHandler = main.slice(
  main.indexOf('async function savePdfAs('),
  main.indexOf('handleTrusted("fs:list-dxf-folder"'),
);
assert.match(pdfSaveAsHandler, /requireFileCapability/, "PDF Save As does not require a source capability.");
assert.match(pdfSaveAsHandler, /boundedPdfOutput/, "PDF Save As output is not size-bounded.");
assert.match(pdfSaveAsHandler, /dialog\.showSaveDialog/, "PDF Save As is not user-authorized by a save dialog.");
assert.match(pdfSaveAsHandler, /extensions:\s*\["pdf"\]/, "PDF Save As is not restricted to PDF output.");
assert.match(pdfSaveAsHandler, /ownerForPath/, "PDF Save As can overwrite a file owned by another window.");
assert.match(pdfSaveAsHandler, /viewerWorkspaces.isOpenElsewhere/, "Unloaded open PDF tabs must retain Save As overwrite protection.");
assert.match(pdfSaveAsHandler, /claimFileForWebContents/, "PDF Save As does not transfer the window's file claim.");
assert.match(pdfSaveAsHandler, /grantFileSet/, "PDF Save As does not grant the newly selected PDF path.");
assert.match(pdfSaveAsHandler, /copyOnly \? \{ flag: "wx" \}/, "Transformed PDF copies must never replace an existing target.");
assert.match(pdfSaveAsHandler, /normalizePath\(outputPath\) === normalizePath\(sourcePath\)/, "Transforms must reject overwriting the original PDF.");
assert.match(pdfSaveAsHandler, /token !== initialClaim.token/, "Transforms must recheck the current source after the save dialog.");
assert.match(pdfSaveAsHandler, /handleTrusted\("fs:save-pdf-transformed-copy", \["3dpdf"\]/, "The transformed-copy IPC must be PDF-only.");
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
// Explorer passes no file list through %* to a command-line verb, and Player
// passes one invocation only. Document + "%1" yields one process per PDF.
for (const [verb, marker] of [["BatchPrint", "--batch-print"], ["MergePDFs", "--merge-pdf"]]) {
  assert.match(
    installerScript,
    new RegExp(`SystemFileAssociations\\\\\\.pdf\\\\shell\\\\ExcelsisView\\.${verb}" "MultiSelectModel" "Document"`),
    `The Explorer ${verb} verb is not invoked once per selected PDF.`,
  );
  assert.ok(
    installerScript.includes(`ExcelsisView.${verb}\\command" "" "$\\"$INSTDIR\\ExcelsisView.exe$\\" ${marker} $\\"%1$\\""`),
    `The Explorer ${verb} command is not the quoted installed executable with one quoted PDF.`,
  );
}
assert.doesNotMatch(installerScript, /%\*/, "A command-line Explorer verb relies on an empty %* file list.");
assert.doesNotMatch(installerScript, /"MultiSelectModel" "Player"/, "A command-line verb uses the single-invocation Player model.");
assert.match(main, /await startupGate;[\s\S]{0,120}if \(queuedMergeTimer\) return;/, "Merge bursts can split before startup finishes.");
assert.match(main, /await startupGate;[\s\S]{0,120}if \(queuedBatchPrintTimer\) return;/, "Batch-print bursts can split before startup finishes.");
assert.ok(
  main.indexOf("explorerVerb = routeMergeArgs(process.argv.slice(1));") < main.indexOf("await verifyExternalRuntimeIntegrity()")
    && main.indexOf("await ensureNetworkThumbnailPolicy(") < main.indexOf("openStartupGate();"),
  "Explorer verb files must be queued before, and windows opened after, startup checks.",
);
const pdfMerge = read("pdf-merge.cjs");
const pdfMergePreload = read("pdf-merge-preload.cjs");
for (const channel of ["get-job", "read-file", "save", "open-result"]) {
  assert(
    main.includes(`handleTrusted("pdf-merge:${channel}", ["pdf-merge"]`),
    `pdf-merge:${channel} is not restricted to the trusted merge window.`,
  );
}
assert.deepEqual(
  [...pdfMergePreload.matchAll(/ipcRenderer\.invoke\('([^']+)'/g)].map((match) => match[1]),
  ["pdf-merge:get-job", "pdf-merge:read-file", "pdf-merge:save", "pdf-merge:open-result"],
  "The merge preload exposes an unexpected IPC capability.",
);
assert.doesNotMatch(
  pdfMergePreload,
  /fs:|shell\.|openPath|ipcRenderer\.(?:send|on|sendSync)\b/,
  "The merge preload exposes a filesystem, shell or event capability.",
);
assert.match(
  main,
  /preload: path\.join\(__dirname, "pdf-merge-preload\.cjs"\), contextIsolation: true,\s+nodeIntegration: false, sandbox: true, webSecurity: true/,
  "The merge window is not sandboxed and isolated.",
);
assert.match(
  pdfMerge,
  /MAX_FILES=64,MAX_FILE_BYTES=64\*1024\*1024,MAX_TOTAL_BYTES=256\*1024\*1024,MAX_PAGES=2000/,
  "Merge inputs are not bounded.",
);
assert.match(pdfMerge, /All selected PDFs must be in the same folder/, "Merge does not require one source folder.");
assert.match(pdfMerge, /renderer submits only ordered opaque IDs/, "Merge renderer input is not limited to opaque IDs.");
assert.match(pdfMerge, /fs\.open\(target,'wx'\)/, "Merged output must be created exclusively, never overwriting.");
assert.equal(
  (pdfMerge.match(/\bunlink\s*\(/g) || []).length,
  1,
  "Merge may only remove its own exclusively created incomplete output.",
);
assert.match(
  pdfMerge,
  /catch\(error\)\{await handle\.close\(\);await fs\.unlink\(target\)/,
  "Merge cleanup is not limited to the failed exclusive output.",
);
assert.doesNotMatch(
  pdfMerge,
  /showSaveDialog|\.rename\s*\(|\.rm\s*\(|rmdir|\beval\s*\(|\bfetch\s*\(/,
  "Merge contains a save prompt, rename/removal or dynamic-code capability.",
);
assert.match(pdfMerge, /resourceLimits:\{maxOldGenerationSizeMb:512\}/, "Merge worker memory is not bounded.");
assert.equal(
  (main.match(/\bquitIfWindowless\(\)/g) || []).length,
  4,
  "Explorer merge/batch-print failures can leave a hidden primary instance.",
);
assert.match(
  installerScript,
  /customUnInstall[\s\S]*DeleteRegKey HKLM "Software\\Classes\\SystemFileAssociations\\\.pdf\\shell\\ExcelsisView\.MergePDFs"/,
  "Uninstall does not remove the Explorer merge verb.",
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
assert.match(pkg.scripts.dist, /npm run test:build-downloader &&/,
  "The builder download/checksum compatibility test is not a mandatory build gate.");
assert.equal(pkg.scripts["test:build-downloader"], "node scripts/test-build-downloader.cjs");
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
assert.match(
  sourcePackager,
  /third_party\\source\\web-runtime/,
  "The application source package omits the exact 3D web runtime sources.",
);
for (const [name, expectedHash] of Object.entries({
  "base64-js-1.5.1.tgz": "b1b7a945b52685269083425216d6597e33d97bf21699d656e92fdb3eb5210a85",
  "buffer-6.0.3.tgz": "555b6f49224afcf6b2c5a9aea7cd34a7f443f395b10532bc5580022d57aa51f5",
  "ieee754-1.2.1.tgz": "8ef14b9b397e339db89db97881fb714f49319d8f0eb1275901f45567b28f9dac",
  "pako-2.1.0.tgz": "49fedc8866b4abfc8e71dc7fe75ad4ef1ff1ac9601b0642cff88ee5bf2338709",
  "three-0.160.0.tgz": "1ee2f935c4f555814b388e87b5ef78a44856bd2e9d0feb88643a6e193fb42856",
})) {
  const bytes = fs.readFileSync(
    path.join(projectRoot, "third_party", "source", "web-runtime", name),
  );
  assert.equal(
    crypto.createHash("sha256").update(bytes).digest("hex"),
    expectedHash,
    `Unexpected 3D web runtime source tarball: ${name}`,
  );
}
for (const requiredMacro of [
  "STBI_ONLY_JPEG",
  "STBI_ONLY_PNG",
  "STBI_NO_LINEAR",
  "STBI_NO_STDIO",
]) {
  assert.match(nanoImageConfig, new RegExp(`#define ${requiredMacro}\\b`));
}
assert.match(nanoImageSource, /stbi__malloc_mad4\(req_comp, \(int\) x, \(int\) y, 2, 0\)/);
assert.match(nanoImageSource, /memcpy\(dest, cur, \(size_t\) x \* \(size_t\) img_n\)/);
assert.match(nanoGeometrySource, /size_t interior_count/);
assert.match(nanoGeometrySource, /ctx, interior_count,/);
assert.match(nanoZlibSource, /\(size_t\)items > \(size_t\)-1 \/ \(size_t\)size/);
assert.match(nanoBuild, /stb_image_hardening_test/);
assert.match(nanoBuild, /"-g0"/);
assert.match(nanoBuild, /-ffile-prefix-map=/);
assert.match(nanoBuild, /-fdebug-prefix-map=/);
assert.match(nanoBuild, /-fmacro-prefix-map=/);
assert.doesNotMatch(
  nanoExporterBytes.toString("latin1"),
  /[A-Z]:\\(?:Users\\|GITHUB\\|E_(?:VIEWER|HELPER|CAD)\\)/i,
  "The nanoPRC release executable discloses a private local build path.",
);
assert.match(nanoSourcePackager, /Join-Path \$NanoRoot "tests"/);
assert.match(u3dBuild, /-DU3D_SHARED=ON/);
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
  /SOURCE-ExcelsisView-1\.1\.52\.zip/,
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
  "@xmldom/xmldom": "0.8.15",
  "@electron/get": {
    ".": "5.0.0",
    "undici": "7.30.1",
  },
  "brace-expansion": "5.0.12",
  "fast-uri": "3.1.9",
  "js-yaml": "4.3.2",
  "node-gyp": {
    "undici": "6.29.1",
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
  "launcher/update-center.html",
  "modules/3dpdf/index.html",
  "modules/3dpdf/batch-print.html",
  "modules/3dpdf/print-document.html",
  "modules/3dpdf/pdf-merge.html",
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
