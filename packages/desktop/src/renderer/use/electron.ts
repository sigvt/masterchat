import { useEffect } from "react";

export enum IpcEvent {
  AddVideo = "addVideo",
  AddVideoResult = "addVideo_result",
}

export function useElectron() {
  return window.electron;
}

const API = useElectron();

export function useIpcListen(channel: string, cb: (...args: any) => void) {
  useEffect(() => {
    const listnerKey = API.onResponse(channel, (...args) => cb(...args));

    return () => {
      API.removeResponseHandler(listnerKey);
    };
  }, []);
}

export function addVideo(videoId: string) {
  API.send(IpcEvent.AddVideo, { videoId });
}
