import electron, { ipcMain } from "electron";
import masterchat from "masterchat";

type CastFunction = (channel: string, data: unknown) => void;

function createMasterchatInstance(videoId: string, cast: CastFunction) {
  return new Promise(async () => {
    const context = await masterchat.fetchContext(videoId);
    const token = context.continuations.all.token;
    const iter = masterchat.iterateChat({
      ...context.auth,
      token,
    });
    for await (const res of iter) {
      cast("newEvent", res);
    }
    cast("streamEnded", videoId);
  });
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
    if (this.subs.has(videoId)) {
      this.subs.get(videoId).delete(replyFunc); // ?: check if it's working
    }
  }
  castFactory(videoId: string): CastFunction {
    return (channel: string, data: any) => {
      if (!this.subs.has(videoId)) return;
      const pool = this.subs.get(videoId);
      for (const replyFunc of pool) {
        replyFunc(channel, data);
      }
    };
  }
  getConnections() {
    return Array.from(this.conns.keys());
  }
}

const connManager = new ConnectionManager();

ipcMain.on("addVideo", (event, args) => {
  console.log(event, args); // prints "ping"
  const { videoId } = args;
  const result = connManager.add(videoId);
  event.reply("addVideo_result", result);
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
