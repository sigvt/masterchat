import { ReloadContinuationItems } from "../chat/exports";
import { YTTimedContinuationData } from "../../types/chat";
import { YTReloadContinuationData } from "../../types/context";

export interface Context {
  apiKey: string;
  metadata: Metadata;
  continuations?: ReloadContinuationItems;
}

export interface ClientInfo {
  clientName: string;
  clientVersion: string;
}

export interface Metadata {
  id: string;
  title: string;
  channelId: string;
  channelName: string;
  isLive: boolean;
}

export type ContinuationData =
  | YTReloadContinuationData
  | YTTimedContinuationData;

export interface LiveChatContext {
  sendMessageParams: string | undefined;
}
