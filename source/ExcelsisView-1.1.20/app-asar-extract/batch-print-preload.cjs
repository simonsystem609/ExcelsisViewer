const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("batchPrintApp", {
  getJob: () => ipcRenderer.invoke("batch-print:get-job"),
  start: (settings) => ipcRenderer.invoke("batch-print:start", settings),
  saveSettings: (settings) => ipcRenderer.invoke("batch-print:save-settings", settings),
  cancel: () => ipcRenderer.invoke("batch-print:cancel"),
  onProgress: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on("batch-print:progress", listener);
    return () => ipcRenderer.removeListener("batch-print:progress", listener);
  },
});
