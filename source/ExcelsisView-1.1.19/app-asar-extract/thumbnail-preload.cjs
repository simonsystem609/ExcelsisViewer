const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("thumbnailApp", {
  request: () => ipcRenderer.invoke("thumbnail:request"),
  complete: (pngBytes) => ipcRenderer.invoke("thumbnail:complete", pngBytes),
  fail: (message) => ipcRenderer.invoke("thumbnail:fail", String(message || "PDF thumbnail failed.")),
});
