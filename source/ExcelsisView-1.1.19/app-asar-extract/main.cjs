const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  nativeImage,
  protocol,
  session,
} = require("electron");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");
const { convertedDxfPath, isDwgPath } = require("./dwg-converter.cjs");
const { decodeDxfBuffer, encodeDxfTextForWrite } = require("./dxf-encoding.cjs");
const { decodePrcFile, fileContainsPrcMarker } = require("./nano-prc-bridge.cjs");
const { decodeU3dStream, detectEmbedded3dMarker } = require("./u3d-bridge.cjs");

const APP_ID = "local.excelsis.view";
const APP_NAME = "ExcelsisView";
const APP_SCHEME = "excelsis";
const WINDOW_ICON_PROFILES = Object.freeze({
  launcher: Object.freeze({
    appId: APP_ID,
    label: "Launcher",
    png: "icon-dxf-256.png",
    ico: "icon-dxf.ico",
  }),
  dxf: Object.freeze({
    appId: `${APP_ID}.dxf`,
    label: "DXF",
    png: "icon-file-dxf-256.png",
    ico: "icon-file-dxf.ico",
  }),
  dwg: Object.freeze({
    appId: `${APP_ID}.dwg`,
    label: "DWG",
    png: "icon-file-dwg-256.png",
    ico: "icon-file-dwg.ico",
  }),
  pdf: Object.freeze({
    appId: `${APP_ID}.pdf`,
    label: "PDF",
    png: "icon-file-pdf-256.png",
    ico: "icon-file-pdf.ico",
  }),
});
const MAX_CAD_INPUT_BYTES = 256 * 1024 * 1024;
const MAX_DXF_SAVE_BYTES = 512 * 1024 * 1024;
const MAX_PDF_INPUT_BYTES = 512 * 1024 * 1024;
const MAX_PDF_SAVE_BYTES = 512 * 1024 * 1024;
const TRUSTED_MODULES = Object.freeze([
  "launcher",
  "dxf",
  "3dpdf",
  "batch-print",
  "batch-print-document",
]);
const MAX_BATCH_PRINT_FILES = 100;
const BATCH_PRINT_SETTINGS_FILE = "BatchPrintSettings.json";
const DEFAULT_BATCH_PRINT_SETTINGS = Object.freeze({
  deviceName: "",
  paperSize: "A4",
  orientation: "auto",
  margins: "minimum",
  scaleMode: "fit",
  customScale: 100,
  copies: 1,
  qualityDpi: 600,
  color: true,
  duplexMode: "simplex",
  pageRanges: "all",
});
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-src 'none'",
  "form-action 'none'",
  "script-src 'self' 'wasm-unsafe-eval' blob:",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  "connect-src 'self' data: blob:",
].join("; ");

protocol.registerSchemesAsPrivileged([{
  scheme: APP_SCHEME,
  privileges: {
    standard: true,
    secure: true,
    supportFetchAPI: true,
    stream: true,
  },
}]);

const APP_WEB_ROOTS = Object.freeze({
  launcher: path.join(__dirname, "launcher"),
  modules: path.join(__dirname, "modules"),
  build: path.join(__dirname, "build"),
});

const CONTENT_TYPES = Object.freeze({
  ".bcmap": "application/octet-stream",
  ".bin": "application/octet-stream",
  ".css": "text/css; charset=utf-8",
  ".gz": "application/gzip",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".otf": "font/otf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
});

function isPathInside(rootPath, candidatePath) {
  const relative = path.relative(path.resolve(rootPath), path.resolve(candidatePath));
  return relative === "" || (
    !relative.startsWith(`..${path.sep}`) &&
    relative !== ".." &&
    !path.isAbsolute(relative)
  );
}

function applicationUrl(rootName, ...pathParts) {
  if (!Object.hasOwn(APP_WEB_ROOTS, rootName)) {
    throw new Error("Unknown application asset root.");
  }
  // Version the protected URLs so Chromium can safely retain parsed scripts,
  // fonts, and other immutable application assets between windows. A new
  // installer version gets a new URL namespace and therefore a clean cache.
  const encodedPath = [`v${app.getVersion()}`, rootName, ...pathParts]
    .map((part) => encodeURIComponent(String(part)))
    .join("/");
  return `${APP_SCHEME}://app/${encodedPath}`;
}

function resolveApplicationRequest(requestUrl) {
  const parsed = new URL(requestUrl);
  if (parsed.protocol !== `${APP_SCHEME}:` || parsed.hostname !== "app" ||
      parsed.username || parsed.password || parsed.port || parsed.search) {
    throw new Error("Invalid application asset URL.");
  }
  const encodedParts = parsed.pathname.split("/").filter(Boolean);
  const parts = encodedParts.map((part) => decodeURIComponent(part));
  if (parts.length < 3 || parts.some((part) => (
    !part || part === "." || part === ".." || part.includes("\\") || part.includes("\0")
  ))) {
    throw new Error("Invalid application asset path.");
  }
  const [versionSegment, rootName, ...relativeParts] = parts;
  if (versionSegment !== `v${app.getVersion()}`) {
    throw new Error("Application asset version is unavailable.");
  }
  const rootPath = APP_WEB_ROOTS[rootName];
  if (!rootPath) throw new Error("Application asset root is unavailable.");
  const assetPath = path.resolve(rootPath, ...relativeParts);
  if (!isPathInside(rootPath, assetPath)) {
    throw new Error("Application asset escaped its root.");
  }
  return assetPath;
}

function registerApplicationProtocol() {
  protocol.handle(APP_SCHEME, async (request) => {
    try {
      if (request.method !== "GET") {
        return new Response("Method not allowed", { status: 405 });
      }
      const requestedPath = resolveApplicationRequest(request.url);
      const stat = await fs.stat(requestedPath);
      if (!stat.isFile()) return new Response("Not found", { status: 404 });
      const body = await fs.readFile(requestedPath);
      return new Response(body, {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Security-Policy": CONTENT_SECURITY_POLICY,
          "Content-Length": String(stat.size),
          "Content-Type": CONTENT_TYPES[path.extname(requestedPath).toLowerCase()] ||
            "application/octet-stream",
          "Cross-Origin-Resource-Policy": "same-origin",
          "Last-Modified": stat.mtime.toUTCString(),
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  });
}

async function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  const stream = fsSync.createReadStream(filePath);
  for await (const chunk of stream) hash.update(chunk);
  return hash.digest("hex");
}

async function verifyExternalRuntimeIntegrity() {
  if (!app.isPackaged) return;
  const manifestPath = path.join(__dirname, "external-integrity.json");
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  if (manifest?.format !== "Excelsis external runtime integrity 1" ||
      !Array.isArray(manifest.files) || manifest.files.length < 4) {
    throw new Error("The external runtime integrity manifest is invalid.");
  }
  const entries = manifest.files.map((entry) => {
    const relativePath = String(entry?.path || "");
    if (!/^[a-zA-Z0-9._/-]+$/.test(relativePath) ||
        relativePath.startsWith("/") || relativePath.split("/").includes("..") ||
        !/^[a-f0-9]{64}$/.test(String(entry?.sha256 || ""))) {
      throw new Error("The external runtime integrity manifest contains an invalid entry.");
    }
    const resolvedPath = path.resolve(process.resourcesPath, ...relativePath.split("/"));
    if (!isPathInside(process.resourcesPath, resolvedPath)) {
      throw new Error("An external runtime integrity path escaped the resources directory.");
    }
    return { entry, relativePath, resolvedPath };
  });
  // Hash independent native resources concurrently. Integrity still gates all
  // application windows, but SSD reads and crypto work no longer serialize.
  await Promise.all(entries.map(async ({ entry, relativePath, resolvedPath }) => {
    const actualHash = await sha256File(resolvedPath);
    const expectedBytes = Buffer.from(entry.sha256, "hex");
    const actualBytes = Buffer.from(actualHash, "hex");
    if (!crypto.timingSafeEqual(expectedBytes, actualBytes)) {
      throw new Error(`External runtime integrity verification failed for ${relativePath}.`);
    }
  }));
}

function commandLineValue(name) {
  const prefix = `${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] || "" : "";
}

const pdfThumbnailRequest = (() => {
  const input = commandLineValue("--pdf-thumbnail-input");
  const output = commandLineValue("--pdf-thumbnail-output");
  if (!input || !output) return null;
  return {
    input: path.resolve(input),
    output: path.resolve(output),
    pixels: Math.max(32, Math.min(2048, Number(commandLineValue("--pdf-thumbnail-size")) || 256)),
  };
})();

const MODULES = new Set(["dxf", "3dpdf"]);
const pendingFileSets = new Map();
const activeClaims = new Map();
const grantedFilePaths = new Map();
const batchPrintJobs = new Map();
const printDocumentJobs = new Map();
let claimSeq = 1;
let thumbnailWebContentsId = null;
let queuedBatchPrintPaths = new Map();
let queuedBatchPrintTimer = null;

app.setName(APP_NAME);
app.enableSandbox();
if (pdfThumbnailRequest) {
  // Windows' Chromium sandbox can broker the normal AppData profile tree but
  // rejects an arbitrary profile rooted beside Explorer's temporary output.
  app.setPath("userData", path.join(app.getPath("appData"), APP_NAME, "ThumbnailRuntime"));
  app.commandLine.appendSwitch("disable-http-cache");
} else {
  app.setPath("userData", path.join(app.getPath("appData"), APP_NAME));
}
app.setAppUserModelId(APP_ID);

const gotLock = pdfThumbnailRequest ? true : app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

function bitmapToBmp(image) {
  const { width, height } = image.getSize();
  const pixels = image.toBitmap();
  const headerSize = 54;
  const bitmap = Buffer.alloc(headerSize + pixels.length);
  bitmap.write("BM", 0, 2, "ascii");
  bitmap.writeUInt32LE(bitmap.length, 2);
  bitmap.writeUInt32LE(headerSize, 10);
  bitmap.writeUInt32LE(40, 14);
  bitmap.writeInt32LE(width, 18);
  bitmap.writeInt32LE(-height, 22);
  bitmap.writeUInt16LE(1, 26);
  bitmap.writeUInt16LE(32, 28);
  bitmap.writeUInt32LE(pixels.length, 34);
  pixels.copy(bitmap, headerSize);
  return bitmap;
}

async function renderPdfThumbnail(request) {
  const completion = Promise.withResolvers();
  const timeout = setTimeout(
    () => completion.reject(new Error("PDF thumbnail rendering timed out.")),
    30000,
  );
  const assertThumbnailSender = (event) => {
    if (!thumbnailWebContentsId || event.sender.id !== thumbnailWebContentsId ||
        event.senderFrame !== event.sender.mainFrame) {
      throw new Error("Untrusted thumbnail IPC sender.");
    }
  };
  ipcMain.handle("thumbnail:request", async (event) => {
    assertThumbnailSender(event);
    const inputStat = await fs.stat(request.input);
    if (!inputStat.isFile() || inputStat.size > MAX_PDF_INPUT_BYTES) {
      throw new Error("PDF thumbnail input exceeds the safety limit.");
    }
    return {
      bytes: await fs.readFile(request.input),
      pixels: request.pixels,
    };
  });
  ipcMain.handle("thumbnail:complete", async (event, pngBytes) => {
    assertThumbnailSender(event);
    if (!ArrayBuffer.isView(pngBytes) && !(pngBytes instanceof ArrayBuffer)) {
      throw new Error("Invalid thumbnail byte payload.");
    }
    if (pngBytes.byteLength > 64 * 1024 * 1024) {
      throw new Error("PDF thumbnail output exceeds the safety limit.");
    }
    const image = nativeImage.createFromBuffer(Buffer.from(pngBytes));
    if (image.isEmpty()) throw new Error("PDF thumbnail PNG was empty.");
    await fs.writeFile(request.output, bitmapToBmp(image));
    completion.resolve();
    return { ok: true };
  });
  ipcMain.handle("thumbnail:fail", (event, message) => {
    assertThumbnailSender(event);
    completion.reject(new Error(String(message || "PDF thumbnail rendering failed.")));
    return { ok: false };
  });
  const window = new BrowserWindow({
    show: false,
    width: request.pixels,
    height: request.pixels,
    webPreferences: {
      preload: path.join(__dirname, "thumbnail-preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: false,
    },
  });
  thumbnailWebContentsId = window.webContents.id;
  const thumbnailEntryUrl = applicationUrl("modules", "3dpdf", "pdf-thumbnail.html");
  secureWebContents(window, thumbnailEntryUrl);
  try {
    await window.loadURL(thumbnailEntryUrl);
    await completion.promise;
  } finally {
    clearTimeout(timeout);
    ipcMain.removeHandler("thumbnail:request");
    ipcMain.removeHandler("thumbnail:complete");
    ipcMain.removeHandler("thumbnail:fail");
    thumbnailWebContentsId = null;
    if (!window.isDestroyed()) window.destroy();
  }
}

function assetPath(...parts) {
  return app.isPackaged
    ? path.join(process.resourcesPath, ...parts)
    : path.join(__dirname, ...parts);
}

function windowIconKind(moduleName, filePath = null) {
  if (moduleName === "launcher") return "launcher";
  if (moduleName === "3dpdf" || moduleName === "batch-print") return "pdf";
  if (moduleName === "dxf" && isDwgPath(filePath)) return "dwg";
  return "dxf";
}

function windowIconProfile(iconKind) {
  return WINDOW_ICON_PROFILES[iconKind] || WINDOW_ICON_PROFILES.launcher;
}

function windowIconPath(iconKind, format) {
  const profile = windowIconProfile(iconKind);
  return assetPath("build", format === "ico" ? profile.ico : profile.png);
}

function applyWindowIcon(win, iconKind) {
  if (!win || win.isDestroyed()) return;
  const profile = windowIconProfile(iconKind);
  const icon = nativeImage.createFromPath(windowIconPath(iconKind, "png"));
  if (!icon.isEmpty()) win.setIcon(icon);
  if (process.platform === "win32" && typeof win.setAppDetails === "function") {
    win.setAppDetails({
      appId: profile.appId,
      appIconPath: windowIconPath(iconKind, "ico"),
      appIconIndex: 0,
      relaunchDisplayName: iconKind === "launcher" ? APP_NAME : `${APP_NAME} ${profile.label}`,
    });
  }
  win.excelsisIconKind = iconKind;
}

function firstExistingPath(paths) {
  return paths.find((entryPath) => fsSync.existsSync(entryPath)) || null;
}

function nanoPrcExporterPath() {
  return firstExistingPath([
    app.isPackaged
      ? path.join(process.resourcesPath, "native", "nano_prc_app_export.exe")
      : null,
    path.join(__dirname, "modules", "3dpdf", "native", "nano_prc_app_export.exe"),
  ].filter(Boolean));
}

function u3dRuntimePaths() {
  const runtimeRoot = firstExistingPath([
    app.isPackaged
      ? path.join(process.resourcesPath, "native", "u3d")
      : null,
    path.join(__dirname, "modules", "3dpdf", "native", "u3d"),
  ].filter(Boolean));
  if (!runtimeRoot) return null;
  return {
    exporterPath: path.join(runtimeRoot, "u3d_app_export.exe"),
    dependencyPaths: [
      path.join(runtimeRoot, "IFXCore.dll"),
      path.join(runtimeRoot, "IFXImporting.dll"),
      path.join(runtimeRoot, "libwinpthread-1.dll"),
    ],
  };
}

function nativeProcessGuardPath() {
  return firstExistingPath([
    app.isPackaged
      ? path.join(process.resourcesPath, "native", "process-guard.exe")
      : null,
    path.join(__dirname, "native", "process-guard.exe"),
  ].filter(Boolean));
}

function moduleEntryPath(moduleName) {
  const bundledModule = path.join(__dirname, "modules", moduleName, "index.html");
  const legacyDxfRoot = moduleName === "dxf" ? path.join(__dirname, "index.html") : null;
  return firstExistingPath([bundledModule, legacyDxfRoot].filter(Boolean));
}

function moduleEntryUrl(moduleName) {
  const entryPath = moduleEntryPath(moduleName);
  if (!entryPath) return null;
  if (isPathInside(APP_WEB_ROOTS.modules, entryPath)) {
    return applicationUrl("modules", moduleName, "index.html");
  }
  throw new Error(`Module is outside the protected application roots: ${moduleName}`);
}

function launcherEntryPath() {
  return path.join(__dirname, "launcher", "index.html");
}

function launcherEntryUrl() {
  if (!fsSync.existsSync(launcherEntryPath())) return null;
  return applicationUrl("launcher", "index.html");
}

function secureWebContents(win, entryUrl) {
  win.excelsisEntryUrl = new URL(entryUrl).href;
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (event, targetUrl) => {
    let normalizedTargetUrl = null;
    try {
      normalizedTargetUrl = new URL(targetUrl).href;
    } catch {
      // Malformed navigation targets are never application pages.
    }
    if (!normalizedTargetUrl || normalizedTargetUrl !== win.excelsisEntryUrl) {
      event.preventDefault();
    }
  });
  win.webContents.on("will-attach-webview", (event) => event.preventDefault());
}

function normalizePath(filePath) {
  return path.resolve(filePath).toLowerCase();
}

function assertTrustedSender(event, allowedModules = TRUSTED_MODULES) {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win || win.isDestroyed() || event.senderFrame !== event.sender.mainFrame) {
    throw new Error("Untrusted IPC sender.");
  }
  if (!allowedModules.includes(win.excelsisModuleName)) {
    throw new Error(`IPC capability is unavailable to module '${win.excelsisModuleName || "unknown"}'.`);
  }
  let senderUrl;
  try {
    senderUrl = new URL(event.senderFrame.url).href;
  } catch {
    throw new Error("IPC sender did not originate from an application page.");
  }
  if (!win.excelsisEntryUrl || senderUrl !== win.excelsisEntryUrl) {
    throw new Error("IPC sender page is not trusted.");
  }
  return win;
}

function handleTrusted(channel, allowedModules, handler) {
  ipcMain.handle(channel, (event, ...args) => {
    assertTrustedSender(event, allowedModules);
    return handler(event, ...args);
  });
}

function grantsFor(webContentsId) {
  if (!grantedFilePaths.has(webContentsId)) {
    grantedFilePaths.set(webContentsId, new Set());
  }
  return grantedFilePaths.get(webContentsId);
}

function grantFilePath(webContentsId, filePath) {
  const resolved = path.resolve(filePath);
  grantsFor(webContentsId).add(normalizePath(resolved));
  return resolved;
}

function grantFileSet(webContentsId, fileSet) {
  if (!fileSet) return;
  if (fileSet.path) grantFilePath(webContentsId, fileSet.path);
  for (const file of fileSet.files || []) {
    if (file?.path) grantFilePath(webContentsId, file.path);
  }
}

function requireFileCapability(event, filePath, expectedModule) {
  const resolved = path.resolve(String(filePath || ""));
  if (expectedModule && moduleForPath(resolved) !== expectedModule) {
    throw new Error("Unsupported file type for this viewer.");
  }
  if (!grantsFor(event.sender.id).has(normalizePath(resolved))) {
    throw new Error("The renderer has no user-granted capability for this file.");
  }
  return resolved;
}

async function requireBoundedFile(filePath, maximumBytes, label) {
  const stat = await fs.stat(filePath);
  if (!stat.isFile()) throw new Error(`${label} is not a file.`);
  if (stat.size <= 0 || stat.size > maximumBytes) {
    throw new Error(`${label} exceeds the ${Math.round(maximumBytes / 1024 / 1024)} MiB safety limit.`);
  }
  return stat;
}

async function readPrintFileBytes(file, label) {
  if (Buffer.isBuffer(file?.bytes)) {
    if (!file.bytes.length || file.bytes.length > MAX_PDF_INPUT_BYTES) {
      throw new Error(`${label} exceeds the 512 MiB safety limit.`);
    }
    return file.bytes;
  }
  if (!file?.path) throw new Error(`${label} is unavailable.`);
  await requireBoundedFile(file.path, MAX_PDF_INPUT_BYTES, label);
  return fs.readFile(file.path);
}

function isDxfPath(filePath) {
  return typeof filePath === "string" && path.extname(filePath).toLowerCase() === ".dxf";
}

function isCadPath(filePath) {
  return isDxfPath(filePath) || isDwgPath(filePath);
}

function isPdfPath(filePath) {
  return typeof filePath === "string" && path.extname(filePath).toLowerCase() === ".pdf";
}

function moduleForPath(filePath) {
  if (isCadPath(filePath)) return "dxf";
  if (isPdfPath(filePath)) return "3dpdf";
  return null;
}

async function pathExists(filePath) {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findBatchPrintArgs(argv) {
  const marker = argv.indexOf("--batch-print");
  if (marker < 0) return [];
  const unique = new Map();
  for (const argument of argv.slice(marker + 1)) {
    if (!argument || argument.startsWith("--")) continue;
    const resolved = path.resolve(argument);
    if (!isPdfPath(resolved) || unique.has(normalizePath(resolved))) continue;
    if (await pathExists(resolved)) unique.set(normalizePath(resolved), resolved);
    if (unique.size >= MAX_BATCH_PRINT_FILES) break;
  }
  return [...unique.values()];
}

function validateBatchPrintSettings(value = {}) {
  const paperSizes = new Set(["A0", "A1", "A2", "A3", "A4", "A5", "A6", "Letter", "Legal", "Tabloid"]);
  const orientations = new Set(["auto", "portrait", "landscape"]);
  const margins = new Set(["none", "minimum", "normal"]);
  const scaleModes = new Set(["fit", "fit-border", "actual", "custom"]);
  const qualityDpis = new Set([150, 300, 600]);
  const duplexModes = new Set(["simplex", "longEdge", "shortEdge"]);
  const pageRanges = String(value.pageRanges || "all").trim().toLowerCase();
  if (pageRanges !== "all" && !/^\d+(?:\s*-\s*\d+)?(?:\s*,\s*\d+(?:\s*-\s*\d+)?)*$/.test(pageRanges)) {
    throw new Error("Page ranges must be 'all' or a list such as 1-3,5.");
  }
  const deviceName = String(value.deviceName || "").trim();
  if (deviceName.length > 512 || /[\0\r\n]/.test(deviceName)) {
    throw new Error("The selected printer name is invalid.");
  }
  return {
    deviceName,
    paperSize: paperSizes.has(value.paperSize) ? value.paperSize : DEFAULT_BATCH_PRINT_SETTINGS.paperSize,
    orientation: orientations.has(value.orientation) ? value.orientation : DEFAULT_BATCH_PRINT_SETTINGS.orientation,
    margins: margins.has(value.margins) ? value.margins : DEFAULT_BATCH_PRINT_SETTINGS.margins,
    scaleMode: scaleModes.has(value.scaleMode) ? value.scaleMode : DEFAULT_BATCH_PRINT_SETTINGS.scaleMode,
    customScale: Math.max(10, Math.min(200, Math.round(Number(value.customScale) || 100))),
    copies: Math.max(1, Math.min(99, Math.round(Number(value.copies) || 1))),
    qualityDpi: qualityDpis.has(Number(value.qualityDpi))
      ? Number(value.qualityDpi)
      : DEFAULT_BATCH_PRINT_SETTINGS.qualityDpi,
    color: value.color !== false,
    duplexMode: duplexModes.has(value.duplexMode) ? value.duplexMode : DEFAULT_BATCH_PRINT_SETTINGS.duplexMode,
    pageRanges,
  };
}

async function loadBatchPrintSettings() {
  try {
    const stored = JSON.parse(await fs.readFile(
      path.join(app.getPath("userData"), BATCH_PRINT_SETTINGS_FILE),
      "utf8",
    ));
    return validateBatchPrintSettings(stored);
  } catch {
    return { ...DEFAULT_BATCH_PRINT_SETTINGS };
  }
}

async function saveBatchPrintSettings(settings) {
  await fs.mkdir(app.getPath("userData"), { recursive: true });
  await fs.writeFile(
    path.join(app.getPath("userData"), BATCH_PRINT_SETTINGS_FILE),
    `${JSON.stringify(settings, null, 2)}\n`,
    { encoding: "utf8", mode: 0o600 },
  );
}

async function findOpenArg(argv) {
  for (const arg of argv) {
    if (!arg || arg.startsWith("--")) continue;
    const resolved = path.resolve(arg);
    const moduleName = moduleForPath(resolved);
    if (moduleName && await pathExists(resolved)) return { moduleName, filePath: resolved };
  }
  return null;
}

async function filesInFolder(folderPath, extensions) {
  const normalizedExtensions = (Array.isArray(extensions) ? extensions : [extensions])
    .map((extension) => extension.toLowerCase());
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  return entries
    .filter((entry) => (
      entry.isFile()
      && normalizedExtensions.some((extension) => entry.name.toLowerCase().endsWith(extension))
    ))
    .map((entry) => ({
      name: entry.name,
      path: path.join(folderPath, entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
}

async function dxfFilesInFolder(folderPath) {
  return filesInFolder(folderPath, [".dxf", ".dwg"]);
}

async function pdfFilesInFolder(folderPath) {
  return filesInFolder(folderPath, ".pdf");
}

async function fileSetForFile(filePath, moduleName = moduleForPath(filePath)) {
  const resolved = path.resolve(filePath);
  const files = moduleName === "3dpdf"
    ? await pdfFilesInFolder(path.dirname(resolved))
    : await dxfFilesInFolder(path.dirname(resolved));
  const index = Math.max(0, files.findIndex((file) => normalizePath(file.path) === normalizePath(resolved)));
  return { moduleName, path: resolved, files, index };
}

function ownerForPath(normalizedPath) {
  for (const claim of activeClaims.values()) {
    if (claim.normalizedPath === normalizedPath) return claim;
  }
  return null;
}

function lockStateFor(webContentsId, filePath) {
  const resolved = path.resolve(filePath);
  const normalizedPath = normalizePath(filePath);
  const owner = ownerForPath(normalizedPath);
  if (isDwgPath(resolved)) {
    return { path: resolved, readOnly: true, reason: "dwg-conversion", owner: null };
  }
  if (!owner || owner.webContentsId === webContentsId) {
    return { path: resolved, readOnly: false, owner: null };
  }
  return {
    path: resolved,
    readOnly: true,
    owner: {
      token: owner.token,
      filePath: owner.path,
      windowTitle: owner.windowTitle,
    },
  };
}

function broadcastLockStates() {
  for (const win of BrowserWindow.getAllWindows()) {
    const claim = activeClaims.get(win.webContents.id);
    if (!claim) continue;
    win.webContents.send("app:file-state", lockStateFor(win.webContents.id, claim.path));
  }
}

function broadcastFileSaved(filePath, writerWebContentsId) {
  const normalizedPath = normalizePath(filePath);
  for (const win of BrowserWindow.getAllWindows()) {
    if (win.webContents.id === writerWebContentsId) continue;
    const claim = activeClaims.get(win.webContents.id);
    if (claim?.normalizedPath === normalizedPath) {
      win.webContents.send("app:file-saved", { path: claim.path });
    }
  }
}

function requireWriteClaim(webContentsId, filePath) {
  if (isDwgPath(filePath)) {
    throw new Error("DWG files open as read-only converted views. The original DWG cannot be overwritten.");
  }
  const normalizedPath = normalizePath(filePath);
  const claim = activeClaims.get(webContentsId);
  const owner = ownerForPath(normalizedPath);
  if (!claim || claim.normalizedPath !== normalizedPath || !owner || owner.webContentsId !== webContentsId) {
    throw new Error("This file is read-only because it is open in another window.");
  }
}

async function writeDxfSiblingCopy(filePath, text, suffix) {
  const resolved = path.resolve(filePath);
  if (isDwgPath(resolved)) {
    throw new Error("DWG converted views are read-only.");
  }
  requireBoundedDxfText(text);
  const parsed = path.parse(resolved);
  const outPath = path.join(parsed.dir, `${parsed.name}${suffix}.dxf`);
  await fs.writeFile(outPath, encodeDxfTextForWrite(text));
  const files = await dxfFilesInFolder(parsed.dir);
  const index = Math.max(0, files.findIndex((file) => normalizePath(file.path) === normalizePath(outPath)));
  return { path: outPath, name: path.basename(outPath), files, index };
}

function requireBoundedDxfText(text) {
  if (typeof text !== "string" || !text.length ||
      Buffer.byteLength(text, "utf8") > MAX_DXF_SAVE_BYTES) {
    throw new Error("DXF output exceeds the 512 MiB safety limit.");
  }
}

function createModuleWindow(moduleName, fileSet = null) {
  const isLauncher = moduleName === "launcher";
  const entryUrl = isLauncher ? launcherEntryUrl() : moduleEntryUrl(moduleName);
  if (!entryUrl) throw new Error(`Module not found: ${moduleName}`);
  const iconKind = windowIconKind(moduleName, fileSet?.path);

  const win = new BrowserWindow({
    title: isLauncher ? `${APP_NAME} Launcher` : APP_NAME,
    width: isLauncher ? 560 : 1240,
    height: isLauncher ? 360 : 820,
    minWidth: isLauncher ? 460 : 900,
    minHeight: isLauncher ? 300 : 620,
    autoHideMenuBar: true,
    backgroundColor: isLauncher ? "#f4f7fb" : "#050607",
    icon: windowIconPath(iconKind, "png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: false,
      spellcheck: false,
    },
  });

  secureWebContents(win, entryUrl);
  win.setMenu(null);
  applyWindowIcon(win, iconKind);

  win.excelsisModuleName = moduleName;
  const webContentsId = win.webContents.id;
  if (fileSet) {
    pendingFileSets.set(webContentsId, fileSet);
    grantFileSet(webContentsId, fileSet);
  }
  win.on("closed", () => {
    activeClaims.delete(webContentsId);
    pendingFileSets.delete(webContentsId);
    grantedFilePaths.delete(webContentsId);
    broadcastLockStates();
  });

  win.loadURL(entryUrl);
  return win;
}

function createDxfWindow(fileSet = null) {
  return createModuleWindow("dxf", fileSet);
}

function create3dPdfWindow(fileSet = null) {
  return createModuleWindow("3dpdf", fileSet);
}

function normalizePrintFile(file) {
  if (typeof file === "string") {
    const filePath = path.resolve(file);
    return { path: filePath, name: path.basename(filePath), bytes: null };
  }
  const filePath = file?.path ? path.resolve(file.path) : null;
  const bytes = file?.bytes
    ? (Buffer.isBuffer(file.bytes) ? file.bytes : boundedPdfOutput(file.bytes))
    : null;
  if (!filePath && !bytes) throw new Error("The print PDF is unavailable.");
  const requestedName = path.basename(String(file?.name || (filePath && path.basename(filePath)) || "document.pdf"));
  const name = (requestedName || "document.pdf").slice(0, 260);
  return { path: filePath, name, bytes };
}

function createBatchPrintWindow(files, { mode = "batch" } = {}) {
  const entryUrl = applicationUrl("modules", "3dpdf", "batch-print.html");
  const win = new BrowserWindow({
    title: mode === "single" ? `${APP_NAME} Print` : `${APP_NAME} Batch Print`,
    width: 1120,
    height: 780,
    minWidth: 900,
    minHeight: 650,
    autoHideMenuBar: true,
    backgroundColor: "#171315",
    icon: windowIconPath("pdf", "png"),
    webPreferences: {
      preload: path.join(__dirname, "batch-print-preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: false,
      spellcheck: false,
    },
  });
  secureWebContents(win, entryUrl);
  win.setMenu(null);
  applyWindowIcon(win, "pdf");
  win.excelsisModuleName = "batch-print";
  const webContentsId = win.webContents.id;
  batchPrintJobs.set(webContentsId, {
    files: files.map(normalizePrintFile),
    mode: mode === "single" ? "single" : "batch",
    running: false,
    cancelRequested: false,
  });
  win.on("closed", () => {
    const job = batchPrintJobs.get(webContentsId);
    if (job) job.cancelRequested = true;
    batchPrintJobs.delete(webContentsId);
  });
  win.loadURL(entryUrl);
  return win;
}

function sendBatchPrintProgress(win, state) {
  if (!win?.isDestroyed()) win.webContents.send("batch-print:progress", state);
}

async function printOnePdf(owner, file, settings, batchIndex, batchTotal) {
  const entryUrl = applicationUrl("modules", "3dpdf", "print-document.html");
  const win = new BrowserWindow({
    show: false,
    width: 900,
    height: 1100,
    autoHideMenuBar: true,
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "print-document-preload.cjs"),
      backgroundThrottling: false,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: false,
      spellcheck: false,
    },
  });
  secureWebContents(win, entryUrl);
  win.setMenu(null);
  win.excelsisModuleName = "batch-print-document";
  const completion = Promise.withResolvers();
  const webContentsId = win.webContents.id;
  printDocumentJobs.set(webContentsId, {
    file,
    settings,
    completion,
  });
  const timeout = setTimeout(
    () => completion.reject(new Error(`Timed out preparing ${file.name} for printing.`)),
    180000,
  );
  try {
    await win.loadURL(entryUrl);
    const prepared = await completion.promise;
    const qualityMessage = prepared.reducedQuality
      ? ` at ${prepared.effectiveDpi} DPI (memory-safe reduction from ${prepared.requestedDpi} DPI)`
      : ` at ${prepared.effectiveDpi} DPI`;
    const orientationMessage = settings.orientation === "auto" && prepared.mixedOrientation
      ? " with per-page Auto orientation"
      : "";
    sendBatchPrintProgress(owner, {
      phase: "printing",
      index: batchIndex,
      total: batchTotal,
      fileName: file.name,
      message: `Sending ${file.name} to the printer${qualityMessage}${orientationMessage}...`,
    });
    const printOptions = {
      silent: true,
      printBackground: true,
      color: settings.color,
      landscape: !!prepared.landscape,
      scaleFactor: 100,
      copies: settings.copies,
      collate: true,
      duplexMode: settings.duplexMode,
      margins: { marginType: "none" },
      pageSize: settings.paperSize,
      dpi: {
        horizontal: prepared.effectiveDpi,
        vertical: prepared.effectiveDpi,
      },
    };
    if (settings.deviceName) printOptions.deviceName = settings.deviceName;
    await new Promise((resolve, reject) => {
      win.webContents.print(printOptions, (success, failureReason) => {
        if (success) resolve();
        else reject(new Error(failureReason || `The printer rejected ${file.name}.`));
      });
    });
  } finally {
    clearTimeout(timeout);
    printDocumentJobs.delete(webContentsId);
    if (!win.isDestroyed()) win.destroy();
  }
}

async function runBatchPrintJob(win, job, settings) {
  job.running = true;
  job.cancelRequested = false;
  const single = job.mode === "single";
  try {
    for (let index = 0; index < job.files.length; index += 1) {
      if (job.cancelRequested || win.isDestroyed()) break;
      const file = job.files[index];
      sendBatchPrintProgress(win, {
        phase: "preparing",
        index: index + 1,
        total: job.files.length,
        fileName: file.name,
        message: single
          ? `Preparing ${file.name} for printing...`
          : `Preparing ${file.name} (${index + 1} of ${job.files.length})...`,
      });
      await printOnePdf(win, file, settings, index + 1, job.files.length);
    }
    if (!win.isDestroyed()) {
      sendBatchPrintProgress(win, job.cancelRequested
        ? {
            phase: "canceled",
            index: 0,
            total: job.files.length,
            message: single
              ? "Printing was stopped."
              : "Batch printing stopped before the next document.",
          }
        : {
            phase: "complete",
            index: job.files.length,
            total: job.files.length,
            message: single
              ? `${job.files[0].name} was sent to the printer.`
              : `${job.files.length} PDF document(s) sent to the printer.`,
          });
    }
  } catch (error) {
    sendBatchPrintProgress(win, {
      phase: "error",
      index: 0,
      total: job.files.length,
      message: error?.message || "Batch printing failed.",
    });
  } finally {
    job.running = false;
  }
}

function queueBatchPrint(filePaths) {
  for (const filePath of filePaths) {
    queuedBatchPrintPaths.set(normalizePath(filePath), path.resolve(filePath));
  }
  clearTimeout(queuedBatchPrintTimer);
  queuedBatchPrintTimer = setTimeout(async () => {
    const paths = [...queuedBatchPrintPaths.values()].slice(0, MAX_BATCH_PRINT_FILES);
    queuedBatchPrintPaths = new Map();
    queuedBatchPrintTimer = null;
    try {
      for (const filePath of paths) {
        await requireBoundedFile(filePath, MAX_PDF_INPUT_BYTES, "Batch-print PDF");
      }
      if (paths.length) createBatchPrintWindow(paths);
    } catch (error) {
      dialog.showErrorBox(`${APP_NAME} batch print`, error?.message || "Could not open the selected PDFs.");
    }
  }, 350);
}

function showLauncherWindow() {
  const existing = BrowserWindow.getAllWindows().find((win) => win.excelsisModuleName === "launcher");
  if (existing) {
    existing.show();
    existing.focus();
    return existing;
  }
  return createModuleWindow("launcher");
}

function createWindowForModule(moduleName, fileSet = null) {
  if (moduleName === "dxf") return createDxfWindow(fileSet);
  if (moduleName === "3dpdf") return create3dPdfWindow(fileSet);
  return showLauncherWindow();
}

function windowForWebContentsId(webContentsId) {
  return BrowserWindow.getAllWindows().find((win) => win.webContents.id === webContentsId) || null;
}

// If the exact file is already open (loaded, or in the middle of loading) in
// some window, return that window so callers can focus it instead of opening
// a duplicate. Checks both confirmed claims and pendingFileSets (set
// synchronously at window creation, before the renderer has claimed the file)
// to close the race where a second open arrives while the first is still loading.
function findExistingWindowForFile(filePath) {
  const normalized = normalizePath(filePath);
  for (const win of BrowserWindow.getAllWindows()) {
    const claim = activeClaims.get(win.webContents.id);
    if (claim && claim.normalizedPath === normalized) return win;
    const pending = pendingFileSets.get(win.webContents.id);
    if (pending?.path && normalizePath(pending.path) === normalized) return win;
  }
  return null;
}

async function openFileInModule(moduleName, filePath) {
  const resolved = path.resolve(filePath);
  return createWindowForModule(moduleName, await fileSetForFile(resolved, moduleName));
}

handleTrusted("app:get-version", TRUSTED_MODULES, () => app.getVersion());
handleTrusted("app:get-initial-file-set", ["dxf", "3dpdf"], (event) => (
  pendingFileSets.get(event.sender.id) || null
));

handleTrusted("batch-print:get-job", ["batch-print"], async (event) => {
  const job = batchPrintJobs.get(event.sender.id);
  if (!job?.files?.length) throw new Error("The batch-print file list is unavailable.");
  const first = job.files[0];
  const printers = (await event.sender.getPrintersAsync()).map((printer) => ({
    name: String(printer.name || ""),
    displayName: String(printer.displayName || printer.name || ""),
    description: String(printer.description || ""),
    isDefault: !!printer.isDefault,
    status: Number(printer.status) || 0,
  }));
  return {
    files: job.files.map((file) => ({ name: file.name })),
    firstBytes: await readPrintFileBytes(first, "Print-preview PDF"),
    mode: job.mode,
    settings: await loadBatchPrintSettings(),
    printers,
  };
});

handleTrusted("print:open-preview", ["3dpdf"], async (event, filePath, bytes, label) => {
  let resolvedPath = null;
  if (filePath) {
    resolvedPath = requireFileCapability(event, filePath, "3dpdf");
    await requireBoundedFile(resolvedPath, MAX_PDF_INPUT_BYTES, "Print PDF");
  }
  const printBytes = bytes == null ? null : boundedPdfOutput(bytes);
  if (!resolvedPath && !printBytes) throw new Error("The print PDF is unavailable.");
  const requestedName = path.basename(String(label || (resolvedPath && path.basename(resolvedPath)) || "document.pdf"));
  const name = (requestedName || "document.pdf").slice(0, 260);
  createBatchPrintWindow([{
    path: resolvedPath,
    name,
    bytes: printBytes,
  }], { mode: "single" });
  return { ok: true };
});

handleTrusted("batch-print:start", ["batch-print"], async (event, requestedSettings) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const job = batchPrintJobs.get(event.sender.id);
  if (!job) throw new Error("The batch-print job is unavailable.");
  if (job.running) throw new Error("This batch is already printing.");
  const settings = validateBatchPrintSettings(requestedSettings);
  const printers = await event.sender.getPrintersAsync();
  if (settings.deviceName && !printers.some((printer) => printer.name === settings.deviceName)) {
    throw new Error("The selected printer is no longer available.");
  }
  await saveBatchPrintSettings(settings);
  setImmediate(() => runBatchPrintJob(win, job, settings));
  return { ok: true };
});

handleTrusted("batch-print:save-settings", ["batch-print"], async (_event, requestedSettings) => {
  const settings = validateBatchPrintSettings(requestedSettings);
  await saveBatchPrintSettings(settings);
  return { ok: true };
});

handleTrusted("batch-print:cancel", ["batch-print"], (event) => {
  const job = batchPrintJobs.get(event.sender.id);
  if (!job) return { ok: false };
  job.cancelRequested = true;
  return { ok: true };
});

handleTrusted("print-document:get-job", ["batch-print-document"], async (event) => {
  const job = printDocumentJobs.get(event.sender.id);
  if (!job) throw new Error("The print document is unavailable.");
  return {
    bytes: await readPrintFileBytes(job.file, "Print PDF"),
    label: job.file.name,
    settings: job.settings,
  };
});

handleTrusted("print-document:ready", ["batch-print-document"], (event, details = {}) => {
  const job = printDocumentJobs.get(event.sender.id);
  if (!job) return { ok: false };
  job.completion.resolve({
    landscape: !!details.landscape,
    pageCount: Math.max(1, Math.min(10000, Number(details.pageCount) || 1)),
    requestedDpi: Math.max(150, Math.min(600, Math.round(Number(details.requestedDpi) || 600))),
    effectiveDpi: Math.max(150, Math.min(600, Math.round(Number(details.effectiveDpi) || 300))),
    reducedQuality: !!details.reducedQuality,
    mixedOrientation: !!details.mixedOrientation,
  });
  return { ok: true };
});

handleTrusted("print-document:fail", ["batch-print-document"], (event, message) => {
  const job = printDocumentJobs.get(event.sender.id);
  if (!job) return { ok: false };
  job.completion.reject(new Error(String(message || "Could not prepare the PDF for printing.")));
  return { ok: true };
});

function claimFileForWebContents(webContentsId, filePath) {
  const resolved = path.resolve(filePath);
  const normalizedPath = normalizePath(resolved);
  const state = lockStateFor(webContentsId, resolved);
  const win = windowForWebContentsId(webContentsId);
  if (win) applyWindowIcon(win, windowIconKind(win.excelsisModuleName, resolved));
  activeClaims.set(webContentsId, {
    token: claimSeq++,
    webContentsId,
    path: resolved,
    normalizedPath,
    windowTitle: win?.getTitle() || APP_NAME,
  });
  broadcastLockStates();
  return state;
}

handleTrusted("app:open-module", ["launcher"], (event, moduleName, options = {}) => {
  if (!MODULES.has(moduleName)) return { ok: false, error: `Unknown module: ${moduleName}` };
  createWindowForModule(moduleName);
  if (options?.closeLauncher) BrowserWindow.fromWebContents(event.sender)?.close();
  return { ok: true };
});

handleTrusted("fs:grant-local-file", ["dxf", "3dpdf"], async (event, filePath) => {
  const resolved = path.resolve(String(filePath || ""));
  const win = BrowserWindow.fromWebContents(event.sender);
  if (moduleForPath(resolved) !== win.excelsisModuleName) {
    throw new Error("The selected file type does not match this viewer.");
  }
  await requireBoundedFile(
    resolved,
    win.excelsisModuleName === "dxf" ? MAX_CAD_INPUT_BYTES : MAX_PDF_INPUT_BYTES,
    "Selected file",
  );
  return grantFilePath(event.sender.id, resolved);
});

handleTrusted("fs:claim-file", ["3dpdf"], (event, filePath) => {
  const resolved = requireFileCapability(event, filePath, "3dpdf");
  return claimFileForWebContents(event.sender.id, resolved);
});

handleTrusted("fs:claim-dxf", ["dxf"], (event, filePath) => {
  const resolved = requireFileCapability(event, filePath, "dxf");
  return claimFileForWebContents(event.sender.id, resolved);
});

// Pure read, does not claim: lets a window ask "is this file open in some
// OTHER window right now" so prev/next can skip over it instead of loading
// it read-only.
handleTrusted("fs:is-file-open-elsewhere", ["dxf"], (event, filePath) => {
  const resolved = requireFileCapability(event, filePath, "dxf");
  const owner = ownerForPath(normalizePath(resolved));
  return !!owner && owner.webContentsId !== event.sender.id;
});

// Used by the renderer's drag-and-drop handler when the dropped file's folder
// differs from what this window already shows (a same-window navigation
// wouldn't make sense, since each window's prev/next is scoped to one folder).
// Focuses an existing window for that file if one is already open, otherwise
// opens a new one.
handleTrusted("app:open-file-in-window", ["dxf", "3dpdf"], async (event, filePath) => {
  const resolved = requireFileCapability(event, filePath);
  const moduleName = moduleForPath(resolved);
  if (!moduleName) return { ok: false, error: "Unsupported file type." };
  const win = BrowserWindow.fromWebContents(event.sender);
  if (moduleName !== win.excelsisModuleName) {
    return { ok: false, error: "The selected file belongs to another viewer." };
  }
  if (!(await pathExists(resolved))) return { ok: false, error: "File not found." };
  await openFileInModule(moduleName, resolved);
  return { ok: true };
});

function releaseFileForWebContents(webContentsId) {
  activeClaims.delete(webContentsId);
  broadcastLockStates();
  return { ok: true };
}

handleTrusted("fs:release-file", ["3dpdf"], (event) => {
  return releaseFileForWebContents(event.sender.id);
});

handleTrusted("fs:release-dxf", ["dxf"], (event) => {
  return releaseFileForWebContents(event.sender.id);
});

handleTrusted("fs:read-dxf", ["dxf"], async (event, filePath) => {
  const resolved = requireFileCapability(event, filePath, "dxf");
  await requireBoundedFile(resolved, MAX_CAD_INPUT_BYTES, "CAD input");
  if (!isDwgPath(resolved)) return decodeDxfBuffer(await fs.readFile(resolved));
  const convertedPath = await convertedDxfPath(resolved, {
    converterPath: assetPath("third_party", "libredwg", "dwg2dxf.exe"),
    cacheRoot: path.join(app.getPath("userData"), "DwgCache"),
    processGuardPath: nativeProcessGuardPath(),
  });
  await requireBoundedFile(convertedPath, 512 * 1024 * 1024, "Converted DXF");
  return decodeDxfBuffer(await fs.readFile(convertedPath));
});
handleTrusted("fs:read-binary-file", ["3dpdf"], async (event, filePath) => {
  const resolved = requireFileCapability(event, filePath, "3dpdf");
  await requireBoundedFile(resolved, MAX_PDF_INPUT_BYTES, "PDF input");
  return fs.readFile(resolved);
});
handleTrusted("prc:is-file", ["3dpdf"], async (event, filePath) => {
  const resolved = requireFileCapability(event, filePath, "3dpdf");
  await requireBoundedFile(resolved, MAX_PDF_INPUT_BYTES, "PDF input");
  return isPdfPath(resolved) && fileContainsPrcMarker(resolved);
});
handleTrusted("3d:detect-file", ["3dpdf"], async (event, filePath) => {
  const resolved = requireFileCapability(event, filePath, "3dpdf");
  await requireBoundedFile(resolved, MAX_PDF_INPUT_BYTES, "PDF input");
  return isPdfPath(resolved) ? detectEmbedded3dMarker(resolved) : null;
});
handleTrusted("prc:decode-file", ["3dpdf"], async (event, filePath) => {
  const resolved = requireFileCapability(event, filePath, "3dpdf");
  await requireBoundedFile(resolved, MAX_PDF_INPUT_BYTES, "3D PDF input");
  const exporterPath = nanoPrcExporterPath();
  if (!exporterPath) throw new Error("The nanoPRC decoder is not installed.");
  return decodePrcFile({
    filePath: resolved,
    exporterPath,
    cacheRoot: path.join(app.getPath("userData"), "NanoPrcCache"),
    processGuardPath: nativeProcessGuardPath(),
  });
});
handleTrusted("u3d:decode-stream", ["3dpdf"], async (event, filePath, u3dBytes) => {
  const resolved = requireFileCapability(event, filePath, "3dpdf");
  await requireBoundedFile(resolved, MAX_PDF_INPUT_BYTES, "3D PDF input");
  const runtimePaths = u3dRuntimePaths();
  if (!runtimePaths) throw new Error("The U3D decoder is not installed.");
  return decodeU3dStream({
    u3dBytes,
    runtimePaths,
    cacheRoot: path.join(app.getPath("userData"), "U3dCache"),
    processGuardPath: nativeProcessGuardPath(),
  });
});

function boundedPdfOutput(bytes) {
  const outputBytes = Buffer.from(bytes);
  if (!outputBytes.length || outputBytes.length > MAX_PDF_SAVE_BYTES) {
    throw new Error("PDF output exceeds the 512 MiB safety limit.");
  }
  return outputBytes;
}

handleTrusted("fs:write-pdf", ["3dpdf"], async (event, filePath, bytes) => {
  const resolved = requireFileCapability(event, filePath, "3dpdf");
  requireWriteClaim(event.sender.id, resolved);
  const outputBytes = boundedPdfOutput(bytes);
  await fs.writeFile(resolved, outputBytes);
  broadcastFileSaved(resolved, event.sender.id);
  return { ok: true, path: resolved, name: path.basename(resolved) };
});

handleTrusted("fs:save-pdf-as", ["3dpdf"], async (event, filePath, bytes, suggestedName) => {
  const sourcePath = requireFileCapability(event, filePath, "3dpdf");
  const outputBytes = boundedPdfOutput(bytes);
  const owner = BrowserWindow.fromWebContents(event.sender);
  const parsedSource = path.parse(sourcePath);
  const defaultName = path.basename(String(suggestedName || "document.pdf"));
  const result = await dialog.showSaveDialog(owner, {
    title: "Save PDF as",
    defaultPath: path.join(
      parsedSource.dir,
      defaultName.toLowerCase().endsWith(".pdf") ? defaultName : `${defaultName}.pdf`,
    ),
    filters: [{ name: "PDF documents", extensions: ["pdf"] }],
  });
  if (result.canceled || !result.filePath) return { ok: false, canceled: true };
  const requestedPath = result.filePath.toLowerCase().endsWith(".pdf")
    ? result.filePath
    : `${result.filePath}.pdf`;
  const outputPath = path.resolve(requestedPath);
  const existingOwner = ownerForPath(normalizePath(outputPath));
  if (existingOwner && existingOwner.webContentsId !== event.sender.id) {
    throw new Error("That PDF is open in another ExcelsisView window.");
  }
  const previousClaim = activeClaims.get(event.sender.id);
  const lockState = claimFileForWebContents(event.sender.id, outputPath);
  try {
    await fs.writeFile(outputPath, outputBytes);
  } catch (error) {
    if (previousClaim) activeClaims.set(event.sender.id, previousClaim);
    else activeClaims.delete(event.sender.id);
    broadcastLockStates();
    throw error;
  }
  broadcastFileSaved(outputPath, event.sender.id);
  const fileSet = await fileSetForFile(outputPath, "3dpdf");
  grantFileSet(event.sender.id, fileSet);
  return {
    ok: true,
    path: outputPath,
    name: path.basename(outputPath),
    files: fileSet.files,
    index: fileSet.index,
    lockState,
  };
});

handleTrusted("fs:list-dxf-folder", ["dxf"], async (event, filePath) => {
  const resolved = requireFileCapability(event, filePath, "dxf");
  const files = await dxfFilesInFolder(path.dirname(resolved));
  grantFileSet(event.sender.id, { path: resolved, files });
  const index = Math.max(0, files.findIndex((file) => normalizePath(file.path) === normalizePath(resolved)));
  return { files, index };
});

handleTrusted("fs:write-dxf", ["dxf"], async (event, filePath, text) => {
  const resolved = requireFileCapability(event, filePath, "dxf");
  requireWriteClaim(event.sender.id, resolved);
  requireBoundedDxfText(text);
  await fs.writeFile(resolved, encodeDxfTextForWrite(text));
  broadcastFileSaved(resolved, event.sender.id);
  return { ok: true };
});

handleTrusted("fs:save-dxf-as", ["dxf"], async (event, filePath, text) => {
  const sourcePath = requireFileCapability(event, filePath, "dxf");
  requireBoundedDxfText(text);
  const dialogOwner = BrowserWindow.fromWebContents(event.sender);
  const parsedSource = path.parse(sourcePath);
  const result = await dialog.showSaveDialog(dialogOwner, {
    title: "Save DXF as",
    defaultPath: path.join(parsedSource.dir, `${parsedSource.name}.dxf`),
    filters: [{ name: "DXF drawings", extensions: ["dxf"] }],
  });
  if (result.canceled || !result.filePath) return { ok: false, canceled: true };
  const requestedPath = result.filePath.toLowerCase().endsWith(".dxf")
    ? result.filePath
    : `${result.filePath}.dxf`;
  const outputPath = path.resolve(requestedPath);
  const existingOwner = ownerForPath(normalizePath(outputPath));
  if (existingOwner && existingOwner.webContentsId !== event.sender.id) {
    throw new Error("That DXF is open in another ExcelsisView window.");
  }
  const previousClaim = activeClaims.get(event.sender.id);
  claimFileForWebContents(event.sender.id, outputPath);
  try {
    await fs.writeFile(outputPath, encodeDxfTextForWrite(text));
  } catch (error) {
    if (previousClaim) activeClaims.set(event.sender.id, previousClaim);
    else activeClaims.delete(event.sender.id);
    broadcastLockStates();
    throw error;
  }
  broadcastFileSaved(outputPath, event.sender.id);
  const fileSet = await fileSetForFile(outputPath, "dxf");
  grantFileSet(event.sender.id, fileSet);
  return {
    ok: true,
    path: outputPath,
    name: path.basename(outputPath),
    files: fileSet.files,
    index: fileSet.index,
  };
});

for (const [channel, suffix] of [
  ["fs:write-dxf-fixed-copy", "_fixed"],
  ["fs:write-dxf-fixed-al-copy", "_fixedAL"],
  ["fs:write-dxf-scale-copy", "_scaled"],
]) {
  handleTrusted(channel, ["dxf"], async (event, filePath, text) => {
    const resolved = requireFileCapability(event, filePath, "dxf");
    requireWriteClaim(event.sender.id, resolved);
    const result = await writeDxfSiblingCopy(resolved, text, suffix);
    grantFileSet(event.sender.id, result);
    return result;
  });
}
handleTrusted("fs:write-dxf-mirror-copy", ["dxf"], async (event, filePath, text) => {
  const resolved = requireFileCapability(event, filePath, "dxf");
  requireWriteClaim(event.sender.id, resolved);
  requireBoundedDxfText(text);
  if (isDwgPath(resolved)) {
    throw new Error("DWG converted views are read-only.");
  }
  const parsed = path.parse(resolved);
  const mirrorPath = path.join(parsed.dir, `${parsed.name}_mirror.dxf`);
  await fs.writeFile(mirrorPath, encodeDxfTextForWrite(text));
  const files = await dxfFilesInFolder(parsed.dir);
  grantFileSet(event.sender.id, { path: mirrorPath, files });
  const index = Math.max(0, files.findIndex((file) => normalizePath(file.path) === normalizePath(mirrorPath)));
  return { path: mirrorPath, name: path.basename(mirrorPath), files, index };
});

function configureSessionSecurity() {
  const appSession = session.defaultSession;
  appSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  appSession.setPermissionCheckHandler(() => false);
  appSession.webRequest.onBeforeRequest((details, callback) => {
    let allowed = false;
    try {
      const protocol = new URL(details.url).protocol;
      allowed = protocol === `${APP_SCHEME}:` || protocol === "data:" || protocol === "blob:" ||
        protocol === "devtools:";
    } catch {
      allowed = false;
    }
    callback({ cancel: !allowed });
  });
  appSession.webRequest.onHeadersReceived((details, callback) => {
    if (!details.url.startsWith(`${APP_SCHEME}:`)) {
      callback({ responseHeaders: details.responseHeaders });
      return;
    }
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [CONTENT_SECURITY_POLICY],
      },
    });
  });
}

app.whenReady().then(async () => {
  registerApplicationProtocol();
  configureSessionSecurity();
  try {
    // The Explorer PDF-thumbnail helper only loads the ASAR-protected PDF.js
    // renderer. It never executes the external CAD/PRC runtimes, so hashing
    // those large binaries for every thumbnail request only delays Explorer.
    if (!pdfThumbnailRequest) await verifyExternalRuntimeIntegrity();
  } catch (error) {
    console.error(error);
    dialog.showErrorBox(
      `${APP_NAME} integrity check failed`,
      "The installed runtime files were changed or are incomplete. Reinstall ExcelsisView.",
    );
    app.exit(1);
    return;
  }
  if (pdfThumbnailRequest) {
    try {
      await renderPdfThumbnail(pdfThumbnailRequest);
      app.exit(0);
    } catch (error) {
      console.error(error);
      app.exit(1);
    }
    return;
  }
  Menu.setApplicationMenu(null);
  const batchPrintPaths = await findBatchPrintArgs(process.argv.slice(1));
  if (batchPrintPaths.length) {
    queueBatchPrint(batchPrintPaths);
    return;
  }
  const openArg = await findOpenArg(process.argv.slice(1));
  if (openArg) {
    await openFileInModule(openArg.moduleName, openArg.filePath);
  } else {
    showLauncherWindow();
  }
});

app.on("second-instance", async (_event, argv) => {
  const batchPrintPaths = await findBatchPrintArgs(argv);
  if (batchPrintPaths.length) {
    queueBatchPrint(batchPrintPaths);
    return;
  }
  const openArg = await findOpenArg(argv);
  if (openArg) await openFileInModule(openArg.moduleName, openArg.filePath);
  else showLauncherWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) showLauncherWindow();
});
