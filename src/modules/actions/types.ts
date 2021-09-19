export type ActionType =
  | "report"
  | "block"
  | "unblock"
  | "pin"
  | "unpin"
  | "remove"
  | "timeout"
  | "hide"
  | "unhide"
  | "addModerator"
  | "removeModerator";

export type ActionCatalog = {
  [key in ActionType]?: ActionInfo;
};

export interface ActionInfo {
  isPost: boolean;
  url: string;
  params: string;
}
