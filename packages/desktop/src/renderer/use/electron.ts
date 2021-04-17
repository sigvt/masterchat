import { useEffect } from "react";
import { ElectronApi } from "../../preload";

export function useElectron(): Readonly<ElectronApi> {
  return (window as any).electron;
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

export enum IpcEvent {
  AddVideo = "addVideo",
  AddVideoResult = "addVideo_result",
}

export function addVideo(videoId: string) {
  API.send(IpcEvent.AddVideo, { videoId });
}
