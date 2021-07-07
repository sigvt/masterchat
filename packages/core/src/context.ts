import { fstat, writeFileSync } from "fs";
import fetch from "node-fetch";
import { Credentials, withAuthHeader } from "./auth";
import { ReloadContinuationItems } from "./chat";
import { YTChatResponse, YTTimedContinuationData } from "./types/chat";
import { YTInitialData, YTReloadContinuationData } from "./types/context";
import { convertRunsToString, log, normalizeVideoId } from "./util";

export interface Context {
  apiKey: string;
  metadata: Metadata;
  chat?: {
    continuations: ReloadContinuationItems;
    params: LiveChatParams;
  };
}

export interface LiveChatParams {
  sendMessageParams: string | undefined;
}

export interface ClientInfo {
  clientName: string;
  clientVersion: string;
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

// returns undefined if sending chat function is unavailable
function findSendMessageParams(res: YTChatResponse): string | undefined {
  return res.continuationContents?.liveChatContinuation.actionPanel
    ?.liveChatMessageInputRenderer.sendButton.buttonRenderer.serviceEndpoint
    ?.sendLiveChatMessageEndpoint.params;
}

function findInitialData(data: string): YTInitialData | undefined {
  const ytInitialDataMatch =
    /(?:var ytInitialData|window\["ytInitialData"\]) = (.+?);<\/script>/.exec(
      data
    );
  if (ytInitialDataMatch) {
    return JSON.parse(ytInitialDataMatch[1]);
  }
}

function findReloadContinuation(
  initialData: YTInitialData
): ReloadContinuationItems | undefined {
  if (!initialData.contents) {
    return undefined;
  }

  const conversationBar =
    initialData.contents.twoColumnWatchNextResults?.conversationBar;
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
 * Returns undefined if it is a membership-only stream
 */
function findMetadata(initialData: YTInitialData): Metadata | undefined {
  if (!initialData.contents) return undefined;

  const results =
    initialData.contents.twoColumnWatchNextResults?.results.results;
  if (!results) {
    // maybe empty videoId
    return undefined;
  }

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

async function fetchLiveChatParams(
  continuation: string,
  { credentials }: { credentials?: Credentials } = {}
): Promise<LiveChatParams | undefined> {
  const url = "https://www.youtube.com/live_chat?continuation=" + continuation;
  const headers = withAuthHeader(credentials);
  const res = await fetch(url, { headers }).then((res) => res.text());
  const initialData = findInitialData(res);
  if (!initialData) {
    // TODO: is this even possible?
    log("!liveChatInitialData: " + url, initialData);
    return undefined;
  }
  const sendMessageParams = findSendMessageParams(initialData);
  return {
    sendMessageParams,
  };
}

export async function fetchContext(
  idOrUrl: string,
  { credentials }: { credentials?: Credentials } = {}
): Promise<Context | undefined> {
  const id = normalizeVideoId(idOrUrl);
  const res = await fetch("https://www.youtube.com/watch?v=" + id, {
    headers: withAuthHeader(credentials),
  });
  const watchHtml = await res.text();

  const initialData = findInitialData(watchHtml);
  const apiKey = findApiKey(watchHtml);

  if (!apiKey || !initialData) {
    log(
      "!apiKey",
      res.status,
      res.statusText,
      "https://www.youtube.com/watch?v=" + id
    );
    // TODO: when this happens?
    log("!initialData: " + initialData);

    const err = new Error("Possible YouTube BAN detected");
    err.name = "EYTBAN";
    throw err;
  }

  const metadata = findMetadata(initialData);
  if (!metadata) {
    log("invalid video id, private, deleted: " + id);
    return undefined;
  }

  const context: Context = {
    apiKey,
    metadata,
    chat: undefined,
  };

  const continuations = findReloadContinuation(initialData);
  if (!continuations) {
    log("archived with no replay, unarchived: " + id);
  }

  if (continuations) {
    const params = await fetchLiveChatParams(continuations.top.token, {
      credentials,
    });

    if (params) {
      context.chat = {
        continuations,
        params,
      };
    }
  }

  return context;
}
