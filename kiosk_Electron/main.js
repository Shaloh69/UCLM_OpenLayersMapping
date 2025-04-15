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

// IMPORTANT: Set permission handler before creating any windows
app.whenReady().then(() => {
  // ✅✅ Set geolocation permission handler EARLY - before window creation
  const { session } = require("electron");
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      if (permission === "geolocation") {
        console.log("📍 [DEBUG] Geolocation permission request: GRANTED");
        callback(true); // ✅ Allow location
      } else {
        console.log(`📍 [DEBUG] Permission request '${permission}': DENIED`);
        callback(false); // ❌ Deny all others
      }
    }
  );

  createMainWindow();

  // Set up keyboard shortcuts and other initialization
  setupShortcuts();
});

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    fullscreen: true,
    // kiosk: true, // Disable kiosk temporarily for DevTools access
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: true, // Enable DevTools
      // Add these to ensure permissions work properly
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the URL
  mainWindow.loadURL(savedConfig.url);

  const loadedUrl = savedConfig.url;
  console.log("📍 [DEBUG] Loading URL:", loadedUrl); // Log loaded URL

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

    // Explicitly request geolocation permission as soon as page loads
    mainWindow.webContents.executeJavaScript(`
      console.log("📍 [DEBUG] Requesting geolocation permission...");
      navigator.permissions.query({ name: 'geolocation' })
        .then(function(result) {
          console.log('📍 [DEBUG] Geolocation permission state:', result.state);
          if (result.state !== 'granted') {
            console.log('📍 [DEBUG] Attempting to get current position to trigger permission request');
            navigator.geolocation.getCurrentPosition(
              function(position) {
                console.log('📍 [DEBUG] Position obtained successfully', position.coords.latitude, position.coords.longitude);
              },
              function(error) {
                console.error('📍 [DEBUG] Error getting position:', error.code, error.message);
                alert("Please allow location access to use navigation features.");
              },
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          } else {
            console.log('📍 [DEBUG] Permission already granted, testing location access');
            navigator.geolocation.getCurrentPosition(
              function(position) {
                console.log('📍 [DEBUG] Current position test successful');
              },
              function(error) {
                console.error('📍 [DEBUG] Current position test failed:', error.code, error.message);
              }
            );
          }
        })
        .catch(function(error) {
          console.error("📍 [DEBUG] Geolocation permission error:", error);
        });
    `);
  });

  // Hide menu bar
  mainWindow.setMenuBarVisibility(false);

  // Debug events
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error("📍 [DEBUG] Page failed to load:", errorDescription);
    }
  );

  // Enable DevTools in development
  mainWindow.webContents.openDevTools({ mode: "detach" });
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

function setupShortcuts() {
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

  globalShortcut.register("CommandOrControl+Shift+I", () => {
    if (mainWindow) {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  });
}

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

// Add a new IPC handler to check geolocation permission status
ipcMain.handle("check-geolocation-permission", async () => {
  if (!mainWindow) return { granted: false, error: "No main window" };

  try {
    const permissionStatus = await mainWindow.webContents.executeJavaScript(`
      new Promise((resolve, reject) => {
        navigator.permissions.query({ name: 'geolocation' })
          .then(status => {
            resolve({
              state: status.state,
              granted: status.state === 'granted'
            });
          })
          .catch(err => {
            reject({ error: err.toString() });
          });
      });
    `);
    return permissionStatus;
  } catch (error) {
    return { granted: false, error: error.toString() };
  }
});

// Add a new IPC handler to test geolocation
ipcMain.handle("test-geolocation", async () => {
  if (!mainWindow) return { success: false, error: "No main window" };

  try {
    const result = await mainWindow.webContents.executeJavaScript(`
      new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              success: true,
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              }
            });
          },
          (error) => {
            resolve({
              success: false,
              errorCode: error.code,
              errorMessage: error.message
            });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    `);
    return result;
  } catch (error) {
    return { success: false, error: error.toString() };
  }
});
