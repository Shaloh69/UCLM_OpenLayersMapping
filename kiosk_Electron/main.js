const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs");

// Load any saved URL from config file
let savedConfig = {
  url: "http://localhost:3000",
  hasCustomFiles: false
};
try {
  if (fs.existsSync("./config.json")) {
    savedConfig = JSON.parse(fs.readFileSync("./config.json", "utf8"));
  }
} catch (error) {
  console.error("Error loading config:", error);
}

// Paths for custom GeoJSON files
const customFilesDir = path.join(__dirname, "custom_geojson");
const buildingsFilePath = path.join(customFilesDir, "Buildings.geojson");
const roadSystemFilePath = path.join(customFilesDir, "RoadSystem.geojson");
const pointsFilePath = path.join(customFilesDir, "Points.geojson");

// Ensure custom files directory exists
if (!fs.existsSync(customFilesDir)) {
  fs.mkdirSync(customFilesDir, { recursive: true });
}

// Keep a global reference of the window objects
let mainWindow;
let configWindow;

// IMPORTANT: Set permission handler before creating any windows
app.whenReady().then(() => {
  const { session } = require("electron");
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      if (permission === "geolocation") {
        console.log("📍 [DEBUG] Geolocation permission request: GRANTED");
        callback(true);
      } else {
        console.log(`📍 [DEBUG] Permission request '${permission}': DENIED`);
        callback(false);
      }
    }
  );

  createMainWindow();
  setupShortcuts();
});

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: true,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(savedConfig.url);

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.insertCSS(`
      body, p, h1, h2, h3, h4, h5, h6, span, label, button {
        color: #1f2937 !important;
      }
      
      input, select, textarea {
        background-color: #f9fafb !important;
        color: #1f2937 !important;
      }
      
      button.bg-blue-500, button.bg-blue-600, .btn-primary {
        color: white !important;
      }
    `);

    // Request geolocation
    mainWindow.webContents.executeJavaScript(`
      navigator.geolocation.getCurrentPosition(
        (position) => console.log('📍 Location:', position.coords),
        (error) => console.error('📍 Error:', error.message)
      );
    `);
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.webContents.openDevTools({ mode: "detach" });
}

function createConfigWindow() {
  if (configWindow) {
    configWindow.focus();
    return;
  }

  configWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  configWindow.loadFile("config.html");
  configWindow.on("closed", () => {
    configWindow = null;
  });
}

function setupShortcuts() {
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
  globalShortcut.register("CommandOrControl+Shift+I", () => {
    if (mainWindow) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

// IPC handlers for configuration
ipcMain.handle("get-config", () => {
  return savedConfig;
});

ipcMain.handle("save-config", async (event, config) => {
  try {
    if (config.url) {
      savedConfig.url = config.url;
    }

    if (config.buildingsFile) {
      fs.writeFileSync(buildingsFilePath, JSON.stringify(config.buildingsFile, null, 2));
      savedConfig.hasCustomFiles = true;
    }

    if (config.roadSystemFile) {
      fs.writeFileSync(roadSystemFilePath, JSON.stringify(config.roadSystemFile, null, 2));
      savedConfig.hasCustomFiles = true;
    }

    if (config.pointsFile) {
      fs.writeFileSync(pointsFilePath, JSON.stringify(config.pointsFile, null, 2));
    }

    fs.writeFileSync("./config.json", JSON.stringify(savedConfig, null, 2));
    console.log("✅ Configuration saved");
    return true;
  } catch (error) {
    console.error("❌ Error saving config:", error);
    throw error;
  }
});

ipcMain.handle("get-server-url", () => savedConfig.url);
ipcMain.handle("set-server-url", (event, url) => {
  savedConfig.url = url;
  fs.writeFileSync("./config.json", JSON.stringify(savedConfig, null, 2));
  if (mainWindow) mainWindow.loadURL(url);
  return true;
});

ipcMain.on("reload-main-window", () => {
  if (mainWindow) mainWindow.reload();
});

ipcMain.handle("get-custom-geojson", async (event, filename) => {
  try {
    let filePath;
    switch (filename) {
      case "Buildings.geojson":
        filePath = buildingsFilePath;
        break;
      case "RoadSystem.geojson":
        filePath = roadSystemFilePath;
        break;
      case "Points.geojson":
        filePath = pointsFilePath;
        break;
      default:
        return null;
    }

    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
});
