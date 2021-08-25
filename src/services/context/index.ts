import { Base } from "../../base";
import { MasterchatError } from "../../error";
import { YTChatResponse } from "../../types/chat";
import { YTInitialData, YTPlayabilityStatus } from "../../types/context";
import { convertRunsToString, debugLog } from "../../util";
import { ReloadContinuationItems } from "../chat/exports";
import { Context, LiveChatContext, Metadata } from "./exports";

function findApiKey(data: string): string | undefined {
  const apiKey = data.match(/"innertubeApiKey":"(.+?)"/)?.[1];
  return apiKey;
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

// returns undefined if sending chat function is unavailable
function findSendMessageParams(res: YTChatResponse): string | undefined {
  // NOTE: liveChatMessageInputRenderer set to undefined during subscribers-only mode
  // NOTE: serviceEndpoint set to undefined for unauthorized access
  return res.continuationContents?.liveChatContinuation.actionPanel
    ?.liveChatMessageInputRenderer?.sendButton.buttonRenderer.serviceEndpoint
    ?.sendLiveChatMessageEndpoint.params;
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

  // protected async populateLiveChatContext() {
  //   const token = this.continuation.top.token;
  //   const ctx = await this.fetchLiveChatContext(token);
  //   this.liveChatContext = ctx;
  // }

  private async fetchContext(id: string): Promise<Context> {
    const res = await this.get("/watch?v=" + id);

    // Check ban status
    if (res.status === 429) {
      throw new MasterchatError("denied", "Rate limit exceeded: " + id);
    }

    const watchHtml = await res.text();
    const apiKey = findApiKey(watchHtml);
    const initialData = findInitialData(watchHtml);
    const playabilityStatus = findPlayabilityStatus(watchHtml);

    if (!apiKey || !initialData) {
      const apiKeyPresent = apiKey != undefined;
      const initialDataPresent = initialData != undefined;
      throw new MasterchatError(
        "unknown",
        `Unrecognized error: id=${id} status=${res.status} (${res.statusText}) apiKey=${apiKeyPresent} initialData=${initialDataPresent}`
      );
    }

    // TODO
    // initialData.contents.twoColumnWatchNextResults.conversationBar.conversationBarRenderer.availabilityMessage.messageRenderer.text.runs[0].text === 'Chat is disabled for this live stream.'

    // Check live stream availability
    if (!playabilityStatus) {
      throw new MasterchatError("unknown", "Missing playabilityStatus: " + id);
    }
    switch (playabilityStatus.status) {
      case "ERROR":
        throw new MasterchatError("unavailable", playabilityStatus.reason!);
      case "LOGIN_REQUIRED":
        throw new MasterchatError("private", playabilityStatus.reason!);
      case "UNPLAYABLE": {
        if (
          "playerLegacyDesktopYpcOfferRenderer" in
          playabilityStatus.errorScreen!
        ) {
          throw new MasterchatError("membersOnly", playabilityStatus.reason!);
        }
        throw new MasterchatError("unarchived", playabilityStatus.reason!);
      }
      case "LIVE_STREAM_OFFLINE":
      case "OK":
    }

    // Check live chat availability
    const continuations = findReloadContinuation(initialData);

    if (!continuations) {
      throw new MasterchatError("disabled", `Missing continuations: ` + id);
    }

    const results =
      initialData.contents?.twoColumnWatchNextResults?.results.results;
    if (!results) {
      throw new MasterchatError(
        "unknown",
        "Missing initialData.contents.twoColumnWatchNextResults: " + id
      );
    }

    const primaryInfo = results.contents[0].videoPrimaryInfoRenderer;
    const videoOwner =
      results.contents[1].videoSecondaryInfoRenderer.owner.videoOwnerRenderer;

    // const isMembersOnly =
    //   primaryInfo.badges?.some(
    //     (badge) => badge.metadataBadgeRenderer.label === "Members only"
    //   ) ?? false;

    // if (isMembersOnly) {
    //   throw new MasterchatError(
    //     "unknown",
    //     "Detects members-only stream, contradicting pre-condition check"
    //   );
    // }

    const metadata: Metadata = {
      id: initialData.currentVideoEndpoint.watchEndpoint.videoId,
      title: convertRunsToString(primaryInfo.title.runs),
      channelName: convertRunsToString(videoOwner.title.runs),
      channelId: videoOwner.navigationEndpoint.browseEndpoint.browseId,
      isLive: primaryInfo.viewCount!.videoViewCountRenderer.isLive ?? false,
    };

    return {
      metadata,
      continuations,
      apiKey,
    };
  }

  private async fetchLiveChatContext(
    continuation: string
  ): Promise<LiveChatContext> {
    const endpoint = this.isReplay ? "live_chat_replay" : "live_chat";
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
