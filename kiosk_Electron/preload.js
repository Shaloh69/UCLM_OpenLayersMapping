const { contextBridge, ipcRenderer } = require("electron");

// Expose safe methods to renderer
contextBridge.exposeInMainWorld("electron", {
  isElectron: true,
  
  // Config methods
  getConfig: () => ipcRenderer.invoke("get-config"),
  saveConfig: (config) => ipcRenderer.invoke("save-config", config),
  
  // Legacy URL methods
  getNgrokUrl: () => ipcRenderer.invoke("get-server-url"),
  updateNgrokUrl: (url) => ipcRenderer.invoke("set-server-url", url),
  
  // Custom GeoJSON methods
  getCustomGeoJSON: (filename) => ipcRenderer.invoke("get-custom-geojson", filename),
  
  // App control
  reloadApp: () => ipcRenderer.send("reload-main-window"),
  
  // Geolocation methods
  checkGeolocationPermission: () => ipcRenderer.invoke("check-geolocation-permission"),
  testGeolocation: () => ipcRenderer.invoke("test-geolocation"),
});
