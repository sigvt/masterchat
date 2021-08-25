import { Base } from "../../base";
import { MasterchatError } from "../../error";
import { YTChatResponse } from "../../types/chat";
import { YTInitialData, YTPlayabilityStatus } from "../../types/context";
import { convertRunsToString, debugLog } from "../../util";
import { ReloadContinuationItems } from "../chat/exports";
import { Context, LiveChatContext } from "./exports";

const ABANDONED_DAY_THRESHOLD = 3;

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

function findPlayabilityStatus(data: string): YTPlayabilityStatus | undefined {
  const match = /var ytInitialPlayerResponse = (.+?);var meta/.exec(data);
  if (match) {
    return JSON.parse(match[1]).playabilityStatus;
  }
}

function findInitialData(data: string): YTInitialData | undefined {
  const match =
    /(?:var ytInitialData|window\["ytInitialData"\]) = (.+?);<\/script>/.exec(
      data
    );
  if (match) {
    return JSON.parse(match[1]);
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

function findMetadata(initialData: YTInitialData) {
  if (!initialData.contents) {
    // when initialData only contains responseContext
    // - invalid video id
    // - privated
    // - deleted
    // ↑ these should be handled already
    throw new MasterchatError("unknown", "Missing initialData.contents");
  }

  const results =
    initialData.contents.twoColumnWatchNextResults?.results.results;
  if (!results) {
    throw new MasterchatError(
      "unknown",
      "Missing initialData.contents.twoColumnWatchNextResults"
    );
  }

  const videoPrimaryInfoRenderer = results.contents[0].videoPrimaryInfoRenderer;
  const isMembersOnly =
    videoPrimaryInfoRenderer.badges?.some(
      (badge) => badge.metadataBadgeRenderer.label === "Members only"
    ) ?? false;
  if (isMembersOnly) {
    throw new MasterchatError("unknown", "Indicates members-only stream");
  }

  const viewCount = results.contents[0].videoPrimaryInfoRenderer.viewCount;
  if (!viewCount) {
    throw new MasterchatError("unknown", "Missing viewCount");
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
    this.metadata = ctx.metadata;
    this.isReplay = !this.metadata.isLive;
    this.continuation = ctx.continuations;
    this.apiKey = ctx.apiKey;
  }

  protected async populateLiveChatContext() {
    const token = this.continuation.top.token;
    const ctx = await this.fetchLiveChatContext(token);
    this.liveChatContext = ctx;
  }

  private async fetchContext(id: string): Promise<Context> {
    const res = await this.get("/watch?v=" + id);

    // Check ban status
    if (res.status === 429) {
      debugLog("429", res.status, res.statusText, id);
      throw new MasterchatError("denied", "Rate limit exceeded: " + id);
    }

    const watchHtml = await res.text();
    const initialData = findInitialData(watchHtml);
    const playabilityStatus = findPlayabilityStatus(watchHtml);

    // Check live stream availability
    if (!playabilityStatus) {
      throw new MasterchatError("invalid", "Missing playabilityStatus");
    }
    switch (playabilityStatus.status) {
      case "ERROR":
        throw new MasterchatError("unavailable", playabilityStatus.reason!);
      case "LOGIN_REQUIRED":
        throw new MasterchatError("private", playabilityStatus.reason!);
      case "UNPLAYABLE":
        if (
          "playerLegacyDesktopYpcOfferRenderer" in
          playabilityStatus.errorScreen!
        ) {
          throw new MasterchatError("membersOnly", playabilityStatus.reason!);
        }
        throw new MasterchatError("unarchived", playabilityStatus.reason!);
      case "LIVE_STREAM_OFFLINE": {
        const scheduledStartTime = parseInt(
          playabilityStatus.liveStreamability!.liveStreamabilityRenderer
            .offlineSlate.liveStreamOfflineSlateRenderer.scheduledStartTime,
          10
        );
        const daysPassed =
          (Date.now() - new Date(scheduledStartTime * 1000).getTime()) /
          1000 /
          60 /
          60 /
          24;
        if (daysPassed > ABANDONED_DAY_THRESHOLD) {
          throw new MasterchatError("abandoned", playabilityStatus.reason!);
        }
      }
    }
    const apiKey = findApiKey(watchHtml);

    // writeFileSync("./initialData.json", JSON.stringify(initialData, null, 2));

    if (!apiKey || !initialData) {
      const apiKeyPresent = apiKey != undefined;
      const initialDataPresent = initialData != undefined;
      throw new MasterchatError(
        "unknown",
        `Unrecognized error: status=${res.status} (${res.statusText}) apiKey=${apiKeyPresent} initialData=${initialDataPresent}`
      );
    }

    const metadata = findMetadata(initialData);
    const continuations = findReloadContinuation(initialData);

    // Check live chat availability
    if (!continuations) {
      throw new MasterchatError("disabled", `Missing continuations`);
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
