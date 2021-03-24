import fetch from "node-fetch";
import {
  ReloadContinuationData,
  ReloadContinuationItems,
  ReloadContinuationType,
  TimedContinuationData,
} from "./types/chat";
import { ContextConfig, InitialData, WebPlayerContext } from "./types/context";
import { convertRunsToString } from "./util";

export interface Context {
  apiKey: string;
  client: Client;
  metadata?: Metadata;
}

export interface Client {
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
  continuations?: ReloadContinuationItems;
}

export type ContinuationData = ReloadContinuationData | TimedContinuationData;
/**
 * get the initial data from YouTube page
 *
 * @param {string} id video id
 */

export async function fetchWebPlayerContext(
  id: string
): Promise<WebPlayerContext> {
  const context = {} as WebPlayerContext;

  const res = await fetch("https://www.youtube.com/watch?v=" + id);
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

  return context;
}

export function getClientFromContextConfig(config: ContextConfig): Client {
  return {
    clientName: config.device.interfaceName,
    clientVersion: config.device.interfaceVersion,
    utcOffsetMinutes: 540,
    timeZone: "Asia/Tokyo",
  };
}

export function getAPIKeyFromContextConfig(config: ContextConfig): string {
  if (!config?.innertubeApiKey) {
    console.log(config);
  }
  return config.innertubeApiKey;
}

export function getContinuationFromInitialData(
  initialData: InitialData
): ReloadContinuationItems | undefined {
  const conversationBar =
    initialData.contents.twoColumnWatchNextResults.conversationBar;
  if (!conversationBar || !conversationBar.liveChatRenderer) {
    return undefined;
  }

  const [
    top,
    all,
  ] = conversationBar.liveChatRenderer.header.liveChatHeaderRenderer.viewSelector.sortFilterSubMenuRenderer.subMenuItems;

  return {
    [ReloadContinuationType.Top]: {
      token: top.continuation.reloadContinuationData.continuation,
    },
    [ReloadContinuationType.All]: {
      token: all.continuation.reloadContinuationData.continuation,
    },
  };
}

export function getMetadataFromInitialData(
  initialData: InitialData
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
    continuations: getContinuationFromInitialData(initialData),
  };
}

export async function fetchContext(id: string): Promise<Context> {
  const context = await fetchWebPlayerContext(id);

  const apiKey = getAPIKeyFromContextConfig(context.config);
  const client = getClientFromContextConfig(context.config);
  const metadata = getMetadataFromInitialData(context.initialData);

  return {
    apiKey,
    client,
    metadata,
  };
}
