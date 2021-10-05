import { YTTimedContinuationData } from "./yt/chat";
import { YTReloadContinuationData } from "./yt/context";

export interface ClientInfo {
  clientName: string;
  clientVersion: string;
}

export type ContinuationData =
  | YTReloadContinuationData
  | YTTimedContinuationData;

export interface LiveChatContext {
  sendMessageParams: string | undefined;
}
