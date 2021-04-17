import React, { useEffect } from "react";
import { addVideo, IpcEvent, useIpcListen } from "./use/electron";

const App: React.FC = () => {
  useEffect(() => {
    addVideo("aaaa");
  }, []);

  useIpcListen(IpcEvent.AddVideoResult, (result) => {
    console.log(result);
  });

  return <div>App</div>;
};

export default App;
