import { YTTimedContinuationData } from "../../yt/chat";
import { YTReloadContinuationData } from "../../yt/context";

export interface ClientInfo {
  clientName: string;
  clientVersion: string;
}

export interface Metadata {
  channelId: string;
  title: string;
  channelName: string;
  isLive: boolean;
}

export type ContinuationData =
  | YTReloadContinuationData
  | YTTimedContinuationData;

export interface LiveChatContext {
  sendMessageParams: string | undefined;
}
