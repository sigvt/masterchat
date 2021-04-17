import React, { useEffect, useRef } from "react";
import { ipcRenderer } from "electron";

enum IpcEvent {
  AddVideo = "addVideo",
  AddVideoResult = "addVideo_result",
}

function useIpcListen(channel: string, cb: (...args: any) => void) {
  useEffect(() => {
    ipcRenderer.on(channel, (...args) => cb(...args));

    return () => {
      ipcRenderer.removeListener(channel, cb);
    };
  }, []);
}

function addVideo(videoId: string) {
  ipcRenderer.send(IpcEvent.AddVideo, videoId);
}

const App: React.FC = () => {
  useEffect(() => {
    addVideo("aaa");
  }, []);

  useIpcListen(IpcEvent.AddVideoResult, (result) => {
    console.log(result);
  });

  return <div>App</div>;
};

export default App;
