import { Base } from "../../base";
import { YTChatResponse } from "../../types/chat";
import { YTInitialData } from "../../types/context";
import { convertRunsToString, debugLog } from "../../util";
import { ReloadContinuationItems } from "../chat/exports";
import { Context, LiveChatContext, Metadata } from "./exports";

function findApiKey(data: string): string | undefined {
  const apiKey = data.match(/"innertubeApiKey":"(.+?)"/)?.[1];
  return apiKey;
}

// returns undefined if sending chat function is unavailable
function findSendMessageParams(res: YTChatResponse): string | undefined {
  // NOTE: liveChatMessageInputRenderer set to undefined during subscribers-only mode
  // NOTE: serviceEndpoint set to undefined for unauthorized access
  return res.continuationContents?.liveChatContinuation.actionPanel
    ?.liveChatMessageInputRenderer?.sendButton.buttonRenderer.serviceEndpoint
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

export interface ContextService extends Base {}
export class ContextService {
  protected async populateMetadata() {
    const ctx = await this.fetchContext(this.videoId);
    if (!ctx) {
      throw new Error("Context not found");
    }
    if (!ctx.continuations) {
      throw new Error("Continuation not found");
    }
    this.metadata = ctx.metadata;
    this.isReplay = !this.metadata.isLive;
    this.continuation = ctx?.continuations;
    this.apiKey = ctx.apiKey;
  }

  protected async populateLiveChatContext() {
    const token = this.continuation.top.token;
    const ctx = await this.fetchLiveChatContext(token);
    this.liveChatContext = ctx;
  }

  private async fetchContext(id: string): Promise<Context | undefined> {
    const res = await this.get("/watch?v=" + id);
    if (res.status === 429) {
      debugLog("429", res.status, res.statusText, id);

      const err = new Error("BAN detected");
      err.name = "EYTBAN";
      throw err;
    }

    const watchHtml = await res.text();

    const initialData = findInitialData(watchHtml);
    const apiKey = findApiKey(watchHtml);

    if (!apiKey || !initialData) {
      debugLog("!apiKey", res.status, res.statusText, id);
      // TODO: when does this happen?
      debugLog("!initialData: " + initialData);

      const err = new Error(
        `Unrecognized error(${res.status}): ${res.statusText}`
      );
      throw err;
    }

    const metadata = findMetadata(initialData);
    if (!metadata) {
      debugLog("invalid video id, private, deleted: " + id);
      return undefined;
    }

    const continuations = findReloadContinuation(initialData);
    if (!continuations) {
      debugLog("archived with no replay, unarchived: " + id);
    }

    const context: Context = {
      apiKey,
      metadata,
      continuations,
    };

    return context;
  }

  private async fetchLiveChatContext(
    continuation: string,
    { isReplay = false }: { isReplay?: boolean } = {}
  ): Promise<LiveChatContext | undefined> {
    const endpoint = isReplay ? "live_chat_replay" : "live_chat";
    const url = `/${endpoint}?continuation=` + continuation;

    const res = await this.get(url).then((res) => res.text());
    const initialData = findInitialData(res);
    if (!initialData) {
      // happens when accessing to replay chat
      debugLog("!liveChatInitialData", initialData, url);
      return { sendMessageParams: undefined };
    }

    const sendMessageParams = findSendMessageParams(initialData);
    return {
      sendMessageParams,
    };
  }
}
