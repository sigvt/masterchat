import { FetchError } from "node-fetch";
import { Base } from "../../base";
import { EP_GLC, EP_GLCR } from "../../constants";
import { rlc } from "../../protobuf/assembler";
import { YTAction, YTChatErrorStatus, YTChatResponse } from "../../yt/chat";
import { debugLog, timeoutThen, withContext } from "../../utils";
import { parseChatAction } from "./parser";
import {
  Action,
  FailedChatResponse,
  FetchChatErrorStatus,
  SucceededChatResponse,
} from "./types";
import { getTimedContinuation, omitTrackingParams } from "./utils";

export interface ChatService extends Base {}

export class ChatService {
  public async fetchChat({
    continuation,
  }: {
    continuation: string;
  }): Promise<SucceededChatResponse | FailedChatResponse> {
    const queryUrl = this.isReplay ? EP_GLCR : EP_GLC;

    const body = withContext({
      continuation,
    });

    let res: YTChatResponse;
    let retryRemaining = 3;
    const retryInterval = 1000;

    loop: while (true) {
      try {
        res = await this.postJson<YTChatResponse>(queryUrl, {
          body: JSON.stringify(body),
          retry: 0,
        });

        if (res.error) {
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
           *
           * @see https://developers.google.com/youtube/v3/live/docs/liveChatMessages/list
           */

          const { status, message } = res.error;

          debugLog(`fetchChat(${this.videoId}): ${status} (${message})`);

          switch (status) {
            case YTChatErrorStatus.Invalid: // ?
            case YTChatErrorStatus.PermissionDenied: // stream privated
            case YTChatErrorStatus.NotFound: // stream deleted
              debugLog(
                `[action required] ${this.videoId}: ${status} - ${message}`
              );
              return {
                actions: [],
                continuation: undefined,
                error: null,
              };

            case YTChatErrorStatus.Unavailable:
            case YTChatErrorStatus.Internal:
              // it might be temporary issue so should retry immediately
              throw new Error(`${status}: ${message}`);

            default:
              debugLog(
                `[action required] fetchChat(${this.videoId}): Unrecognized error code`,
                JSON.stringify(res)
              );
              return {
                error: {
                  status,
                  message,
                },
              };
          }
        }

        break loop;
      } catch (err) {
        // logging
        if (err instanceof FetchError) {
          debugLog(
            `fetchChat(${this.videoId}): FetchError`,
            err.message,
            err.code,
            err.type
          );

          switch (err.type) {
            case "invalid-json": {
              // NOTE: rarely occurs
              debugLog(`[action required] ${this.videoId}: invalid-json`);
            }
            case "system": {
              // ECONNRESET, ETIMEOUT, etc
              // Currently unavailable
            }
          }
        }

        if (retryInterval > 0) {
          retryRemaining -= 1;
          debugLog(
            `fetchChat(${this.videoId}): Retrying remaining=${retryRemaining} interval=${retryInterval}`
          );
          await timeoutThen(retryInterval);
          continue loop;
        }

        throw err;
      }
    }

    const { continuationContents } = res;

    if (!continuationContents) {
      /** there's several possibilities lied here:
       * 1. live chat is over (primary)
       * 2. turned into membership-only stream
       * 3. given video is neither a live stream nor an archived stream
       * 4. chat got disabled
       */
      const obj = Object.assign({}, res) as any;
      delete obj["responseContext"];

      // {} => Live stream ended
      // {"contents": {"messageRenderer": {"text": {"runs": [{"text": "Sorry, live chat is currently unavailable"}]}}}} => Turned into members-only stream
      // "Chat is disabled for this live stream." => Replay chat or pre-chat disabled
      // {"trackingParams": ...} => ?
      if ("contents" in obj) {
        debugLog(
          `fetchChat(${this.videoId}): continuationNotFound(with contents)`,
          JSON.stringify(obj)
        );
        return {
          error: {
            status: FetchChatErrorStatus.LiveChatDisabled,
            message: "live chat might have turned into membership-only stream",
          },
        };
      }
      if ("trackingParams" in obj) {
        debugLog(
          `fetchChat(${this.videoId}): continuationNotFound(with trackingParams)`,
          JSON.stringify(obj)
        );
        return {
          error: {
            status: FetchChatErrorStatus.LiveChatDisabled,
            message: "continuation contents cannot be found",
          },
        };
      }

      // Live stream ended
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
    if (this.isReplay) {
      rawActions = this.unwrapReplayActions(rawActions);
    }

    const actions = rawActions
      .map(parseChatAction)
      .filter((a): a is Action => a !== undefined);

    const chat: SucceededChatResponse = {
      actions,
      continuation: newContinuation,
      error: null,
    };

    return chat;
  }

  /**
   * Iterate chat until live stream ends
   */
  public async *iterateChat({
    topChat = false,
    ignoreFirstResponse = false,
    ignoreReplayTimeout = false,
  }: {
    topChat?: boolean;
    ignoreFirstResponse?: boolean;
    ignoreReplayTimeout?: boolean;
  } = {}): AsyncGenerator<SucceededChatResponse | FailedChatResponse> {
    // let token = this.continuation[tokenType].token;
    let token = rlc(
      { videoId: this.videoId, channelId: this.channelId },
      { top: topChat }
    );
    debugLog("iterateChat(${this.videoId}): rcnt", token);
    let treatedFirstResponse = false;

    // continuously fetch chat fragments
    while (true) {
      const chatResponse = await this.fetchChat({
        continuation: token,
      });

      // handle errors
      if (chatResponse.error) {
        yield chatResponse;
        continue;
      }

      // handle chats
      if (!(ignoreFirstResponse && !treatedFirstResponse)) {
        yield chatResponse;
      }

      treatedFirstResponse = true;

      // refresh continuation token
      const { continuation } = chatResponse;

      if (!continuation) {
        debugLog(
          `iterateChat(${this.videoId}): will break loop as continuation not found`
        );
        break;
      }

      token = continuation.token;

      if (!(this.isReplay && ignoreReplayTimeout)) {
        await timeoutThen(continuation.timeoutMs);
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
          debugLog(
            `[action required] ${this.videoId}: replayCount` +
              replayAction.actions.length
          );
        }

        return replayAction.actions[0];
      }
    );
  }
}
