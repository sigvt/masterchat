import { InvalidArgumentError, UnavailableError } from "../../error";
import { Base } from "../../base";
import { EP_GLC, EP_GLCR } from "../../constants";
import {
  DisabledChatError,
  MembersOnlyError,
  NoPermissionError,
} from "../../error";
import { lrc, rtc } from "../../protobuf/assembler";
import { runsToString, timeoutThen, withContext } from "../../utils";
import { YTAction, YTChatErrorStatus, YTChatResponse } from "../../yt/chat";
import { parseChatAction } from "./parser";
import {
  Action,
  FetchChatOptions,
  ChatResponse,
  IterateChatOptions,
} from "./types";
import { getTimedContinuation, omitTrackingParams } from "./utils";

export interface ChatService extends Base {}

export class ChatService {
  public async fetch(options?: FetchChatOptions): Promise<ChatResponse>;
  public async fetch(
    token: string,
    options?: FetchChatOptions
  ): Promise<ChatResponse>;
  public async fetch(
    tokenOrOptions?: string | FetchChatOptions,
    maybeOptions?: FetchChatOptions
  ): Promise<ChatResponse> {
    const options =
      (typeof tokenOrOptions === "string" ? maybeOptions : tokenOrOptions) ??
      {};

    const topChat = options.topChat ?? false;
    const target = { videoId: this.videoId, channelId: this.channelId };
    let retryRemaining = 3;
    const retryInterval = 3000;
    let requestUrl: string = "";
    let requestBody;
    let response: YTChatResponse;

    function applyNewLiveStatus(isLive: boolean) {
      requestUrl = isLive ? EP_GLC : EP_GLCR;

      const continuation =
        typeof tokenOrOptions === "string"
          ? tokenOrOptions
          : isLive
          ? lrc(target, { top: topChat })
          : rtc(target, { top: topChat });

      requestBody = withContext({
        continuation,
      });
    }

    applyNewLiveStatus(this.isLive ?? true);

    loop: while (true) {
      try {
        response = await this.postWithRetry<YTChatResponse>(requestUrl, {
          body: JSON.stringify(requestBody),
          retry: 0,
        });

        if (response.error) {
          /** error.code ->
           * 400: request contains an invalid argument
           *   - when attempting to access livechat while it is already in replay mode
           * 403: no permission
           *   - video was made private by uploader
           *   - something went wrong (server-side)
           * 404: not found
           *   - removed by uploader
           * 500: internal error
           *   - server-side failure
           * 503: The service is currently unavailable
           *   - temporary server-side failure
           * @see https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list
           */

          const { status, message } = response.error;

          switch (status) {
            // stream went privated or deleted
            // TODO: should we break loop normally as if the stream ended or throw errors to tell users?
            case YTChatErrorStatus.PermissionDenied:
              retryRemaining = 0;
              throw new NoPermissionError(message);
            case YTChatErrorStatus.NotFound:
              retryRemaining = 0;
              throw new UnavailableError(message);

            // stream already turned to archive OR completely malformed token
            case YTChatErrorStatus.Invalid:
              retryRemaining = 0;
              throw new InvalidArgumentError(message);

            // it might be temporary issue so should retry immediately
            case YTChatErrorStatus.Unavailable:
            case YTChatErrorStatus.Internal:
              throw response.error;

            default:
              this.log(
                `<!>fetch`,
                `Unrecognized error code`,
                JSON.stringify(response)
              );
              throw response.error;
          }
        }
      } catch (err) {
        if (retryRemaining > 0) {
          retryRemaining -= 1;
          this.log(
            `fetch`,
            `Retrying remaining=${retryRemaining} interval=${retryInterval} source=${
              (err as any).name
            }`
          );
          await timeoutThen(retryInterval);
          continue loop;
        }

        /**
         * type:
         * "invalid-json"
         * "system" => ECONNRESET, ETIMEOUT, etc (Currently unavailable)
         */
        this.log(
          `fetch`,
          `Unrecoverable Error:`,
          `${(err as any).message} (${(err as any).code ?? ""}|${
            (err as any).type ?? ""
          })`
        );

        throw err;
      }

      const { continuationContents } = response;

      if (!continuationContents) {
        /** there's several possibilities lied here:
         * 1. live chat is over (primary)
         * 2. turned into membership-only stream
         * 3. given video is neither a live stream nor an archived stream
         * 4. chat got disabled
         */
        const obj = Object.assign({}, response) as any;
        delete obj["responseContext"];

        if ("contents" in obj) {
          const reason = runsToString(obj.contents.messageRenderer.text.runs);
          if (/disabled/.test(reason)) {
            // {contents: "Chat is disabled for this live stream."} => pre-chat unavailable
            // or accessing replay chat with live chat token

            // retry with replay endpoint if isLive is unknown
            if (this.isLive === undefined) {
              this.log("fetch", "switched to replay endpoint");
              this.isLive = false;
              applyNewLiveStatus(false);
              continue loop;
            }

            throw new DisabledChatError(reason);
          } else if (/currently unavailable/.test(reason)) {
            // {contents: "Sorry, live chat is currently unavailable"} =>
            // - Turned into members-only stream
            // - No stream recordings
            throw new MembersOnlyError(reason);
          }
          this.log(`fetch`, `continuationNotFound(with contents)`, reason);
        } else if ("trackingParams" in obj) {
          // {trackingParams} => ?
          this.log(
            `fetch`,
            `<!>continuationNotFound(with trackingParams)`,
            JSON.stringify(obj)
          );
        }

        // {} => Live stream ended
        return {
          actions: [],
          continuation: undefined,
          error: null,
        };
      }

      const newContinuation = getTimedContinuation(continuationContents);

      let rawActions = continuationContents.liveChatContinuation.actions;

      // this means no chat available between the time window
      if (!rawActions) {
        return {
          actions: [],
          continuation: newContinuation,
          error: null,
        };
      }

      // unwrap replay actions into YTActions
      if (!(this.isLive ?? true)) {
        rawActions = this.unwrapReplayActions(rawActions);
      }

      const actions = rawActions
        .map(parseChatAction)
        .filter((a): a is Action => a !== undefined);

      const chat: ChatResponse = {
        actions,
        continuation: newContinuation,
        error: null,
      };

      return chat;
    }
  }

  /**
   * Iterate chat until live stream ends
   */
  public async *iterate({
    topChat = false,
    ignoreFirstResponse = false,
    continuation,
  }: IterateChatOptions = {}): AsyncGenerator<ChatResponse> {
    let token: string =
      continuation ??
      lrc(
        { videoId: this.videoId, channelId: this.channelId },
        { top: topChat ?? false }
      );

    let treatedFirstResponse = false;

    // continuously fetch chat fragments
    while (true) {
      const res = await this.fetch(token);
      const startMs = Date.now();

      // handle chats
      if (!(ignoreFirstResponse && !treatedFirstResponse)) {
        yield res;
      }

      treatedFirstResponse = true;

      // refresh continuation token
      const { continuation } = res;

      if (!continuation) {
        this.log("iterate", "will break loop as missing continuation");
        break;
      }

      token = continuation.token;

      if (this.isLive ?? true) {
        const driftMs = Date.now() - startMs;
        await timeoutThen(Math.max(continuation.timeoutMs - driftMs, 0));
      }
    }
  }

  private unwrapReplayActions(rawActions: YTAction[]) {
    return rawActions.map(
      // TODO: verify that an action always holds a single item.
      (action): YTAction => {
        const replayAction = Object.values(
          omitTrackingParams(action)
        )[0] as any;

        if (replayAction.actions.length > 1) {
          this.log("<!>unwrapReplayActions", replayAction.actions.length);
        }

        return replayAction.actions[0];
      }
    );
  }
}
