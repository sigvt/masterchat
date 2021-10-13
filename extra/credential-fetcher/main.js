// https://www.electronjs.org/docs/api/session

const { app, BrowserWindow } = require("electron");

const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}

// NOTE: why tho?
app.disableHardwareAcceleration();

let mainWindow = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    webPreferences: {
      center: true,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.on("did-finish-load", async (e) => {
    const url = e.sender.getURL();
    if (url === "https://www.youtube.com/") {
      const match = await mainWindow.webContents.executeJavaScript(
        "/ytcfg\\.set\\(({.+?})\\);/.exec(document.head.innerHTML)",
        true
      );
      const sessionId = match
        ? JSON.parse(match[1])["DELEGATED_SESSION_ID"]
        : undefined;

      const ses = e.sender.session;
      const cookies = await ses.cookies.get({});
      const creds = Object.fromEntries(
        cookies
          .filter((cookie) =>
            ["APISID", "HSID", "SAPISID", "SID", "SSID"].includes(cookie.name)
          )
          .map((cookie) => [cookie.name, cookie.value])
      );
      console.log("Login succeeded. Use credential token below:");
      console.log(
        Buffer.from(
          JSON.stringify({ ...creds, DELEGATED_SESSION_ID: sessionId })
        ).toString("base64")
      );

      app.quit();
    }
  });

  await mainWindow.loadURL(
    "https://accounts.google.com/ServiceLogin?service=youtube&passive=true&continue=https://www.youtube.com/signin?action_handle_signin=true",
    { userAgent: "Chrome" }
  );
}

app.on("session-created", (session) => {
  session.clearStorageData();
});

app.on("second-instance", () => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app
  .whenReady()
  .then(createWindow)
  .catch((e) => console.error("Failed create window:", e));
