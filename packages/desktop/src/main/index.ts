import { ipcMain } from "electron";
import { app, BrowserWindow } from "electron";
import { join } from "path";
import { format } from "url";
import { fetchContext, iterateChat } from "masterchat";

type CastFunction = (channel: string, data: unknown) => void;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}

class ConnectionManager {
  private conns = new Map<string, any>();
  private subs = new Map<string, Set<Function>>();
  constructor() {}
  add(videoId: string) {
    if (this.conns.has(videoId)) return;

    const instance = createMasterchatInstance(
      videoId,
      this.castFactory(videoId)
    )
      .then(() => {
        this.remove(videoId);
      })
      .catch((err) => {
        console.log(`Error: ${err}`);
        this.remove(videoId);
      });
    this.conns.set(videoId, instance);
  }
  remove(videoId: string) {
    // ?: abort Promise to avoid zombie, if needed
    this.conns.delete(videoId);
  }
  subscribe(videoId: string, replyFunc: Function) {
    let pool = this.subs.get(videoId);
    if (!pool) {
      pool = new Set();
      this.subs.set(videoId, pool);
    }
    pool.add(replyFunc);
  }
  unsubscribe(videoId: string, replyFunc: Function) {
    this.subs.get(videoId)?.delete(replyFunc); // ?: check if it's working
  }
  castFactory(videoId: string): CastFunction {
    return (channel: string, data: any) => {
      const pool = this.subs.get(videoId);
      if (!pool) return;

      for (const replyFunc of pool) {
        replyFunc(channel, data);
      }
    };
  }
  getConnections() {
    return Array.from(this.conns.keys());
  }
}

/**
 * Workaround for TypeScript bug
 * @see https://github.com/microsoft/TypeScript/issues/41468#issuecomment-727543400
 */
const env = import.meta.env;

// Install "Vue.js devtools BETA"
if (env.MODE === "development") {
  app
    .whenReady()
    .then(() => import("electron-devtools-installer"))
    .then(({ default: installExtension }) => {
      const REACT_DEVELOPER_TOOLS = "fmkadmapgofadopljbjfkapdkoienihi";
      /** @see https://chrome.google.com/webstore/detail/vuejs-devtools/ljjemllljcmogpfapbkkighbhhppjdbg */
      return installExtension(REACT_DEVELOPER_TOOLS);
    })
    .catch((e) => console.error("Failed install extension:", e));
}

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs.js"),
      contextIsolation: env.MODE !== "test", // Spectron tests can't work with contextIsolation: true
      enableRemoteModule: env.MODE === "test",
      // sandbox: true, // Spectron tests can't work with enableRemoteModule: false
    },
  });

  const connManager = new ConnectionManager();

  ipcMain.on("addVideo", (event, args) => {
    console.log(event, args); // prints "ping"
    const { videoId } = args;
    const result = connManager.add(videoId);
    event.reply("addVideo_result", connManager.getConnections());
  });

  ipcMain.on("removeVideo", (event, args) => {
    console.log(event, args); // prints "ping"
    const { videoId } = args;
    const result = connManager.remove(videoId);
    event.reply("removeVideo_result", result);
  });

  ipcMain.on("subVideo", (event, args) => {
    const { reply } = event;
    const { videoId } = args;
    const result = connManager.subscribe(videoId, reply);
    event.reply("subVideo_result", result);
  });

  ipcMain.on("unsubVideo", (event, args) => {
    const { reply } = event;
    const { videoId } = args;
    const result = connManager.unsubscribe(videoId, reply);
    event.reply("unsubVideo_result", result);
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const URL =
    env.MODE === "development"
      ? env.VITE_DEV_SERVER_URL
      : format({
          protocol: "file",
          pathname: join(__dirname, "../renderer/index.html"),
          slashes: true,
        });

  await mainWindow.loadURL(URL);
  mainWindow.maximize();
  mainWindow.show();

  if (env.MODE === "development") {
    mainWindow.webContents.openDevTools();
  }
}

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

// Auto-updates
if (env.PROD) {
  app
    .whenReady()
    .then(() => import("electron-updater"))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error("Failed check updates:", e));
}

function createMasterchatInstance(videoId: string, cast: CastFunction) {
  return new Promise(async () => {
    const context = await fetchContext(videoId);
    const token = context.continuations!.all.token;
    const iter = iterateChat({
      ...context.auth,
      token,
    });
    for await (const res of iter) {
      cast("newEvent", res);
    }
    cast("streamEnded", videoId);
  });
}
