const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  // Existing electron API functions
  getNgrokUrl: () => ipcRenderer.invoke("get-server-url"),
  updateNgrokUrl: (url) => ipcRenderer.invoke("set-server-url", url),
  isElectron: true,
});
