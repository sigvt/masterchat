import fetch, { RequestInit } from "node-fetch";
import { ReloadContinuationItems, ReloadContinuationType } from "./chat";
import { YTTimedContinuationData } from "./types/chat";
import {
  YTContextConfig,
  YTInitialData,
  YTReloadContinuationData,
  YTWebPlayerContext,
} from "./types/context";
import { JSDOM } from "jsdom";
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

/**
 * get the initial data from YouTube page
 *
 * @param {string} id video id
 * @param {RequestInit} [requestInit]
 */
export async function fetchWebPlayerContext(
  id: string,
  requestInit?: RequestInit
): Promise<YTWebPlayerContext> {
  const context: YTWebPlayerContext = {};

  const res = await fetch("https://www.youtube.com/watch?v=" + id, requestInit);
  const data = await res.text();

  // 1. web_player_context_config
  const ytplayerMatch = data.match(
    /ytplayer\.web_player_context_config = (.+?);/
  );
  if (ytplayerMatch) {
    context.config = JSON.parse(ytplayerMatch[1]);
  }

  // 2. ytInitialData
  const ytInitialDataMatch = /var ytInitialData = (.+?);<\/script>/.exec(data);
  if (ytInitialDataMatch) {
    context.initialData = JSON.parse(ytInitialDataMatch[1]);
  }

  if (!context.config || !context.initialData) {
    const dom = new JSDOM(data);
    const bodyText = dom.window.document.body.textContent || "";
    log(
      "!config || !initialData",
      res.statusText,
      "https://www.youtube.com/watch?v=" + id,
      res.headers,
      bodyText.slice(0, 10000)
    );
  }

  return context;
}

export function getClientFromContextConfig(
  config: YTContextConfig
): ClientInfo {
  return {
    clientName: config.device.interfaceName,
    clientVersion: config.device.interfaceVersion,
    // TODO: use value from YTContextConfig
    utcOffsetMinutes: 540,
    timeZone: "Asia/Tokyo",
  };
}

export function getAPIKeyFromContextConfig(config: YTContextConfig): string {
  if (!config?.innertubeApiKey) {
    log(config);
  }
  return config.innertubeApiKey;
}

export function getContinuationFromInitialData(
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
    [ReloadContinuationType.Top]: {
      token: top.continuation.reloadContinuationData.continuation,
    },
    [ReloadContinuationType.All]: {
      token: all.continuation.reloadContinuationData.continuation,
    },
  };
}

/**
 * Returns undefined if membership-only stream
 */
export function getMetadataFromInitialData(
  initialData: YTInitialData
): Metadata | undefined {
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

  const context = await fetchWebPlayerContext(id);
  if (!context.config || !context.initialData) {
    return undefined;
  }

  const apiKey = getAPIKeyFromContextConfig(context.config);
  const client = getClientFromContextConfig(context.config);
  const metadata = getMetadataFromInitialData(context.initialData);
  const continuations = getContinuationFromInitialData(context.initialData);

  return {
    auth: { apiKey, client },
    continuations,
    metadata,
  };
}
