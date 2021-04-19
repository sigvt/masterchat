import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

const apiKey = "electron";
/**
 * @see https://github.com/electron/electron/issues/21437#issuecomment-573522360
 */

const listeners: any = {};
const api = {
  versions: process.versions,
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  onResponse: (channel: string, fn: (...args: any) => any) => {
    const saferFn = (event: IpcRendererEvent, ...args: any) => fn(...args);
    // Deliberately strip event as it includes `sender`
    ipcRenderer.on(channel, saferFn);
    const key = Symbol();
    listeners[key] = saferFn;
    return key;
  },
  removeResponseHandler: (key: symbol) => {
    const fn = listeners[key];
    delete listeners[key];
    ipcRenderer.removeListener("response", fn);
  },
};

export type ElectronApi = typeof api;

if (import.meta.env.MODE !== "test") {
  /**
   * The "Main World" is the JavaScript context that your main renderer code runs in.
   * By default, the page you load in your renderer executes code in this world.
   *
   * @see https://www.electronjs.org/docs/api/context-bridge
   */
  contextBridge.exposeInMainWorld(apiKey, api);
} else {
  /**
   * Recursively Object.freeze() on objects and functions
   * @see https://github.com/substack/deep-freeze
   * @param obj Object on which to lock the attributes
   */
  const deepFreeze = (obj: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    if (typeof obj === "object" && obj !== null) {
      Object.keys(obj).forEach((prop) => {
        const val = obj[prop];
        if (
          (typeof val === "object" || typeof val === "function") &&
          !Object.isFrozen(val)
        ) {
          deepFreeze(val);
        }
      });
    }

    return Object.freeze(obj);
  };

  deepFreeze(api);

  window[apiKey] = api;

  // Need for Spectron tests
  window.electronRequire = require;
}
