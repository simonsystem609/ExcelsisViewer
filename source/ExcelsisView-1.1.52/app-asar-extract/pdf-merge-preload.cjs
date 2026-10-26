const{contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('pdfMergeApp',{
 getJob:()=>ipcRenderer.invoke('pdf-merge:get-job'),
 readFile:id=>ipcRenderer.invoke('pdf-merge:read-file',id),
 save:order=>ipcRenderer.invoke('pdf-merge:save',order),
 openResult:()=>ipcRenderer.invoke('pdf-merge:open-result'),
});
