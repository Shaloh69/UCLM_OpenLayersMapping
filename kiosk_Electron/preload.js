//preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Expose APIs to renderer process
contextBridge.exposeInMainWorld("electron", {
  // Get the ngrok URL (using the function name your code is expecting)
  getNgrokUrl: () => ipcRenderer.invoke("get-server-url"),

  // Set the ngrok URL
  updateNgrokUrl: (url) => ipcRenderer.invoke("set-server-url", url),

  // Reload the main window
  reloadApp: () => ipcRenderer.send("reload-main-window"),

  // Flag to indicate we're running in Electron
  isElectron: true,
});
