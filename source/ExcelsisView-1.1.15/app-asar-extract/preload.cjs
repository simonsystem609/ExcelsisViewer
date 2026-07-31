const { contextBridge, ipcRenderer, webUtils } = require("electron");

function onAppChannel(channel, callback) {
  const listener = (_event, state) => callback(state);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

function toArrayBuffer(value) {
  if (value instanceof ArrayBuffer) return value;
  const bytes = value instanceof Uint8Array
    ? value
    : Uint8Array.from(value?.data || value || []);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function grantPathForFile(file) {
  const filePath = webUtils.getPathForFile(file);
  if (!filePath) return null;
  return ipcRenderer.invoke("fs:grant-local-file", filePath);
}

contextBridge.exposeInMainWorld("excelsisApp", {
  isDesktop: true,
  getAppVersion: () => ipcRenderer.invoke("app:get-version"),
  openModule: (moduleName, options) => ipcRenderer.invoke("app:open-module", moduleName, options),
});

contextBridge.exposeInMainWorld("dxfApp", {
  isDesktop: true,
  getAppVersion: () => ipcRenderer.invoke("app:get-version"),
  getInitialFileSet: () => ipcRenderer.invoke("app:get-initial-file-set"),
  claimFile: (filePath) => ipcRenderer.invoke("fs:claim-dxf", filePath),
  releaseFile: () => ipcRenderer.invoke("fs:release-dxf"),
  readFile: (filePath) => ipcRenderer.invoke("fs:read-dxf", filePath),
  writeFile: (filePath, text) => ipcRenderer.invoke("fs:write-dxf", filePath, text),
  saveAs: (filePath, text) => ipcRenderer.invoke("fs:save-dxf-as", filePath, text),
  writeFixedCopy: (filePath, text) => ipcRenderer.invoke("fs:write-dxf-fixed-copy", filePath, text),
  writeFixedALCopy: (filePath, text) => ipcRenderer.invoke("fs:write-dxf-fixed-al-copy", filePath, text),
  writeMirrorCopy: (filePath, text) => ipcRenderer.invoke("fs:write-dxf-mirror-copy", filePath, text),
  writeScaleCopy: (filePath, text) => ipcRenderer.invoke("fs:write-dxf-scale-copy", filePath, text),
  listDxfFolder: (filePath) => ipcRenderer.invoke("fs:list-dxf-folder", filePath),
  isFileOpenElsewhere: (filePath) => ipcRenderer.invoke("fs:is-file-open-elsewhere", filePath),
  openFileInWindow: (filePath) => ipcRenderer.invoke("app:open-file-in-window", filePath),
  getPathForFile: grantPathForFile,
  onFileState: (callback) => onAppChannel("app:file-state", callback),
  onFileSaved: (callback) => onAppChannel("app:file-saved", callback),
});

contextBridge.exposeInMainWorld("pdfApp", {
  isDesktop: true,
  getAppVersion: () => ipcRenderer.invoke("app:get-version"),
  getInitialFileSet: () => ipcRenderer.invoke("app:get-initial-file-set"),
  claimFile: (filePath) => ipcRenderer.invoke("fs:claim-file", filePath),
  releaseFile: () => ipcRenderer.invoke("fs:release-file"),
  readFile: async (filePath) => toArrayBuffer(await ipcRenderer.invoke("fs:read-binary-file", filePath)),
  detect3d: (filePath) => ipcRenderer.invoke("3d:detect-file", filePath),
  isPrc: (filePath) => ipcRenderer.invoke("prc:is-file", filePath),
  decodePrc: async (filePath) => {
    const result = await ipcRenderer.invoke("prc:decode-file", filePath);
    return { ...result, mesh: toArrayBuffer(result.mesh) };
  },
  decodeU3d: async (filePath, u3dBytes) => {
    const result = await ipcRenderer.invoke("u3d:decode-stream", filePath, u3dBytes);
    return { ...result, mesh: toArrayBuffer(result.mesh) };
  },
  writeFile: (filePath, bytes) => ipcRenderer.invoke("fs:write-pdf", filePath, bytes),
  saveAs: (filePath, bytes, suggestedName) => ipcRenderer.invoke(
    "fs:save-pdf-as",
    filePath,
    bytes,
    suggestedName,
  ),
  getPathForFile: grantPathForFile,
  openFileInWindow: (filePath) => ipcRenderer.invoke("app:open-file-in-window", filePath),
  onFileState: (callback) => onAppChannel("app:file-state", callback),
  onFileSaved: (callback) => onAppChannel("app:file-saved", callback),
});
