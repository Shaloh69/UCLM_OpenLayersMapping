//main.js
const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs");

// Load any saved URL from config file
let savedConfig = { url: "http://localhost:3000" };
try {
  if (fs.existsSync("./config.json")) {
    savedConfig = JSON.parse(fs.readFileSync("./config.json", "utf8"));
  }
} catch (error) {
  console.error("Error loading config:", error);
}

// Keep a global reference of the window objects
let mainWindow;
let configWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    fullscreen: true,
    kiosk: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the URL
  mainWindow.loadURL(savedConfig.url);

  // Inject CSS fix for styling issues
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.insertCSS(`
      /* Fix text colors */
      body, p, h1, h2, h3, h4, h5, h6, span, label, button {
        color: #1f2937 !important;
      }
      
      input, select, textarea {
        background-color: #f9fafb !important;
        color: #1f2937 !important;
      }
      
      /* Fix button text */
      button, .btn {
        color: inherit !important;
      }
      
      button.bg-blue-500, button.bg-blue-600, .btn-primary {
        color: white !important;
      }
      
      /* Fix container backgrounds */
      .bg-white {
        background-color: white !important;
      }
    `);
  });

  // Hide menu bar
  mainWindow.setMenuBarVisibility(false);
}

function createConfigWindow() {
  if (configWindow) {
    configWindow.focus();
    return;
  }

  configWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  configWindow.loadFile("config.html");

  configWindow.on("closed", () => {
    configWindow = null;
  });
}

// When Electron is ready
app.whenReady().then(() => {
  createMainWindow();

  // Set up keyboard shortcuts for kiosk operation
  globalShortcut.register("CommandOrControl+Shift+C", createConfigWindow);
  globalShortcut.register("CommandOrControl+Shift+R", () => {
    if (mainWindow) mainWindow.reload();
  });
  globalShortcut.register("CommandOrControl+Shift+F", () => {
    if (mainWindow) {
      const isFullScreen = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!isFullScreen);
    }
  });
  globalShortcut.register("CommandOrControl+Shift+Q", () => {
    app.quit();
  });
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

// IPC handlers for configuration (use the same command names as in preload.js)
ipcMain.handle("get-server-url", () => {
  return savedConfig.url;
});

ipcMain.handle("set-server-url", (event, url) => {
  savedConfig.url = url;

  // Save to config file
  fs.writeFileSync("./config.json", JSON.stringify(savedConfig, null, 2));

  // Reload main window with new URL
  if (mainWindow) mainWindow.loadURL(url);

  return true;
});

// Reload main window
ipcMain.on("reload-main-window", () => {
  if (mainWindow) mainWindow.reload();
});
