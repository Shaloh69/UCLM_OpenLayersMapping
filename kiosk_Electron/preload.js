const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  getNgrokUrl: () => ipcRenderer.invoke("get-server-url"),
  updateNgrokUrl: (url) => ipcRenderer.invoke("set-server-url", url),
  reloadApp: () => ipcRenderer.send("reload-main-window"),
  isElectron: true,

  getCurrentLocation: () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    }),
});
