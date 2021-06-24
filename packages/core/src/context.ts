import fetch from "node-fetch";
import { ReloadContinuationItems } from "./chat";
import { YTTimedContinuationData } from "./types/chat";
import { YTInitialData, YTReloadContinuationData } from "./types/context";
import { convertRunsToString, log } from "./util";

export interface Context {
  auth: AuthParams;
  continuations?: ReloadContinuationItems;
  metadata?: Metadata;
}

export interface AuthParams {
  apiKey: string;
  client: ClientInfo;
}

export interface ClientInfo {
  clientName: string;
  clientVersion: string;
  utcOffsetMinutes: number;
  timeZone: string;
}

export interface Metadata {
  id: string;
  title: string | undefined;
  channelId: string;
  channelName: string;
  isLive: boolean;
}

export type ContinuationData =
  | YTReloadContinuationData
  | YTTimedContinuationData;

function findApiKey(data: string): string | undefined {
  const apiKey = data.match(/"innertubeApiKey":"(.+?)"/)?.[1];
  return apiKey;
}

async function findInitialData(
  data: string
): Promise<YTInitialData | undefined> {
  const ytInitialDataMatch = /var ytInitialData = (.+?);<\/script>/.exec(data);
  if (ytInitialDataMatch) {
    return JSON.parse(ytInitialDataMatch[1]);
  }
}

function findContinuation(
  initialData: YTInitialData
): ReloadContinuationItems | undefined {
  if (!initialData.contents) {
    return undefined;
  }

  const conversationBar =
    initialData.contents.twoColumnWatchNextResults.conversationBar;
  if (!conversationBar || !conversationBar.liveChatRenderer) {
    return undefined;
  }

  const [top, all] =
    conversationBar.liveChatRenderer.header.liveChatHeaderRenderer.viewSelector
      .sortFilterSubMenuRenderer.subMenuItems;

  return {
    top: {
      token: top.continuation.reloadContinuationData.continuation,
    },
    all: {
      token: all.continuation.reloadContinuationData.continuation,
    },
  };
}

/**
 * Returns undefined if membership-only stream
 */
function findMetadata(initialData: YTInitialData): Metadata | undefined {
  if (!initialData.contents) return undefined;

  const results =
    initialData.contents.twoColumnWatchNextResults.results.results;

  const viewCount = results.contents[0].videoPrimaryInfoRenderer.viewCount;
  if (!viewCount) {
    // membership only stream
    return undefined;
  }

  return {
    id: initialData.currentVideoEndpoint.watchEndpoint.videoId,
    title: convertRunsToString(
      results.contents[0].videoPrimaryInfoRenderer.title.runs
    ),
    channelName: convertRunsToString(
      results.contents[1].videoSecondaryInfoRenderer.owner.videoOwnerRenderer
        .title.runs
    ),
    channelId:
      results.contents[1].videoSecondaryInfoRenderer.owner.videoOwnerRenderer
        .navigationEndpoint.browseEndpoint.browseId,
    isLive: viewCount.videoViewCountRenderer.isLive ?? false,
  };
}

export async function fetchContext(id: string): Promise<Context | undefined> {
  // TODO: Distinguish YT IP ban and other errors.

  const res = await fetch("https://www.youtube.com/watch?v=" + id);
  const data = await res.text();

  const initialData = await findInitialData(data);
  const apiKey = findApiKey(data);
  const client = {
    clientName: "WEB",
    clientVersion: "2.20210618.05.00-canary_control",
    utcOffsetMinutes: 540,
    timeZone: "Asia/Tokyo",
  };

  if (!apiKey && !initialData) {
    log(
      "!apiKey && !initialData",
      res.status,
      res.statusText,
      "https://www.youtube.com/watch?v=" + id
    );
    const ytbanError = new Error("Possible YouTube BAN detected");
    ytbanError.name = "EYTBAN";
    throw ytbanError;
  }

  if (!apiKey || !initialData) {
    return undefined;
  }

  const metadata = findMetadata(initialData);
  const continuations = findContinuation(initialData);

  return {
    auth: { apiKey, client },
    continuations,
    metadata,
  };
}
