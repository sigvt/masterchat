declare interface Window {
  electron: Readonly<import("..").ElectronApi>;
  electronRequire?: NodeRequire;
}
