const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("printDocumentApp", {
  getJob: () => ipcRenderer.invoke("print-document:get-job"),
  ready: (details) => ipcRenderer.invoke("print-document:ready", details),
  fail: (message) => ipcRenderer.invoke("print-document:fail", message),
});
