import { Base } from "../../base";
import {
  YTAction,
  YTAddLiveChatTickerItem,
  YTChatErrorStatus,
  YTChatResponse,
  YTContinuationContents,
  YTLiveChatPaidMessageRenderer,
} from "../../types/chat";
import {
  convertRunsToString,
  debugLog,
  timeoutThen,
  withContext,
} from "../../util";
import {
  Action,
  AddChatItemAction,
  AddSuperChatItemAction,
  Color,
  FailedChatResponse,
  FetchChatErrorStatus,
  LiveChatMode,
  Membership,
  OmitTrackingParams,
  ReloadContinuationItems,
  SucceededChatResponse,
  SUPERCHAT_COLOR_MAP,
  SUPERCHAT_SIGNIFICANCE_MAP,
  TimedContinuation,
  UnknownAction,
} from "./exports";

/** References
 * @see https://developers.google.com/youtube/v3/live/docs/liveChatMessages
 */

function parseColorCode(code: number): Color | undefined {
  if (code > 4294967295) {
    return undefined;
  }

  const b = code & 0xff;
  const g = (code >>> 8) & 0xff;
  const r = (code >>> 16) & 0xff;
  const opacity = code >>> 24;

  return { r, g, b, opacity };
}

function getTimedContinuation(
  continuationContents: YTContinuationContents
): TimedContinuation | undefined {
  /**
   * observed k: invalidationContinuationData | timedContinuationData | liveChatReplayContinuationData
   * continuations[1] would be playerSeekContinuationData
   */
  if (
    Object.keys(
      continuationContents.liveChatContinuation.continuations[0]
    )[0] === "playerSeekContinuationData"
  ) {
    // only playerSeekContinuationData
    return undefined;
  }

  const continuation = Object.values(
    continuationContents.liveChatContinuation.continuations[0]
  )[0];
  if (!continuation) {
    // no continuation
    return undefined;
  }
  return {
    token: continuation.continuation,
    timeoutMs: continuation.timeoutMs,
  };
}

/**
 * Remove `clickTrackingParams` and `trackingParams` from object
 */
function omitTrackingParams<T>(obj: T): OmitTrackingParams<T> {
  return Object.entries(obj)
    .filter(([k]) => k !== "clickTrackingParams" && k !== "trackingParams")
    .reduce(
      (sum, [k, v]) => ((sum[k as keyof OmitTrackingParams<T>] = v), sum),
      {} as OmitTrackingParams<T>
    );
}

function parseSuperChat(renderer: YTLiveChatPaidMessageRenderer) {
  const AMOUNT_REGEXP = /[\d.,]+/;

  const input = renderer.purchaseAmountText.simpleText;
  const amountString = AMOUNT_REGEXP.exec(input)![0].replace(/,/g, "");

  const amount = parseFloat(amountString);
  const currency = input.replace(AMOUNT_REGEXP, "").trim();
  const color =
    SUPERCHAT_COLOR_MAP[
      renderer.headerBackgroundColor.toString() as keyof typeof SUPERCHAT_COLOR_MAP
    ];
  const significance = SUPERCHAT_SIGNIFICANCE_MAP[color];

  return {
    amount,
    currency,
    color,
    significance,
    headerBackgroundColor: parseColorCode(renderer.headerBackgroundColor)!,
    headerTextColor: parseColorCode(renderer.headerTextColor)!,
    bodyBackgroundColor: parseColorCode(renderer.bodyBackgroundColor)!,
    bodyTextColor: parseColorCode(renderer.bodyTextColor)!,
  };
}

/**
 * Parse raw action object and returns Action
 */
function parseChatAction(action: YTAction): Action | UnknownAction {
  const filteredActions = omitTrackingParams(action);
  const type = Object.keys(filteredActions)[0] as keyof typeof filteredActions;

  switch (type) {
    case "addChatItemAction": {
      const { item } = action[type]!;

      if ("liveChatTextMessageRenderer" in item) {
        // Chat
        const renderer = item["liveChatTextMessageRenderer"]!;
        const {
          id,
          timestampUsec,
          authorExternalChannelId: authorChannelId,
        } = renderer;

        const timestamp = new Date(parseInt(timestampUsec, 10) / 1000);

        const authorPhoto =
          renderer.authorPhoto.thumbnails[
            renderer.authorPhoto.thumbnails.length - 1
          ].url;

        let isVerified = false,
          isOwner = false,
          isModerator = false,
          membership: Membership | undefined = undefined;

        if ("authorBadges" in renderer && renderer.authorBadges) {
          for (const badge of renderer.authorBadges) {
            const renderer = badge.liveChatAuthorBadgeRenderer;
            const iconType = renderer.icon?.iconType;
            switch (iconType) {
              case "VERIFIED":
                isVerified = true;
                break;
              case "OWNER":
                isOwner = true;
                break;
              case "MODERATOR":
                isModerator = true;
                break;
              case undefined:
                // membership
                if (renderer.customThumbnail) {
                  const match = /^(.+?)(?:\s\((.+)\))?$/.exec(renderer.tooltip);
                  if (match) {
                    const [_, status, since] = match;
                    membership = {
                      status,
                      since,
                      thumbnail:
                        renderer.customThumbnail.thumbnails[
                          renderer.customThumbnail.thumbnails.length - 1
                        ].url,
                    };
                  }
                }
                break;
              default:
                debugLog(
                  "[action required] Unrecognized iconType:",
                  iconType,
                  JSON.stringify(renderer)
                );
                throw new Error("Unrecognized iconType: " + iconType);
            }
          }
        }

        const contextMenuEndpointParams =
          renderer.contextMenuEndpoint!.liveChatItemContextMenuEndpoint.params;

        const raw: AddChatItemAction = {
          type: "addChatItemAction",
          id,
          timestamp,
          timestampUsec,
          rawMessage: renderer.message.runs,
          authorName: renderer.authorName?.simpleText,
          authorPhoto,
          authorChannelId,
          membership,
          isVerified,
          isOwner,
          isModerator,
          contextMenuEndpointParams,
        };

        return raw;
      } else if ("liveChatPaidMessageRenderer" in item) {
        // Super Chat
        const renderer = item["liveChatPaidMessageRenderer"]!;
        const { timestampUsec, authorExternalChannelId: authorChannelId } =
          renderer;

        const timestamp = new Date(parseInt(timestampUsec, 10) / 1000);

        const authorPhoto =
          renderer.authorPhoto.thumbnails[
            renderer.authorPhoto.thumbnails.length - 1
          ].url;

        const raw: AddSuperChatItemAction = {
          type: "addSuperChatItemAction",
          id: renderer.id,
          timestamp,
          timestampUsec,
          rawMessage: renderer.message?.runs,
          authorName: renderer.authorName?.simpleText,
          authorPhoto,
          authorChannelId,
          superchat: parseSuperChat(renderer),
        };

        return raw;
      } else if ("liveChatPaidStickerRenderer" in item) {
        // Super Sticker
        const renderer = item["liveChatPaidStickerRenderer"]!;
        return {
          type: "addSuperStickerItemAction",
          ...renderer,
        };
      } else if ("liveChatMembershipItemRenderer" in item) {
        // Membership updates
        const renderer = item["liveChatMembershipItemRenderer"]!;
        return {
          type: "addMembershipItemAction",
          ...renderer,
        };
      } else if ("liveChatPlaceholderItemRenderer" in item) {
        // Placeholder chat
        const renderer = item["liveChatPlaceholderItemRenderer"]!;
        return {
          type: "addPlaceholderItemAction",
          ...renderer,
        };
      } else if ("liveChatViewerEngagementMessageRenderer" in item) {
        // Engagement
        const renderer = item["liveChatViewerEngagementMessageRenderer"]!;
        return {
          type: "addViewerEngagementMessageAction",
          ...renderer,
        };
      } else if ("liveChatModeChangeMessageRenderer" in item) {
        // Mode Change Message (e.g. toggle members-only)
        const renderer = item["liveChatModeChangeMessageRenderer"]!;
        const text = convertRunsToString(renderer.text.runs);
        const subtext = convertRunsToString(renderer.subtext.runs);

        let mode = LiveChatMode.Unknown;
        if (/Slow mode/.test(text)) {
          mode = LiveChatMode.Slow;
        } else if (/Members-only mode/.test(text)) {
          mode = LiveChatMode.MembersOnly;
        } else if (/subscribers-only/.test(text)) {
          mode = LiveChatMode.SubscribersOnly;
        } else {
          debugLog(
            "[action required] Unrecognized mode (modeChangeAction):",
            JSON.stringify(renderer)
          );
        }

        const enabled = /(is|turned) on/.test(text);

        return {
          type: "modeChangeAction",
          mode,
          enabled,
          description: subtext,
        };
      } else {
        debugLog(
          "[action required] Unrecognized renderer type (addChatItemAction):",
          JSON.stringify(item)
        );
        break;
      }
    }

    case "markChatItemsByAuthorAsDeletedAction": {
      const payload = action[type]!;

      return {
        type: "markChatItemsByAuthorAsDeletedAction",
        channelId: payload.externalChannelId,
        timestamp: new Date(),
      };
    }

    case "markChatItemAsDeletedAction": {
      const payload = action[type]!;

      const statusText = payload.deletedStateMessage.runs[0].text;
      switch (statusText) {
        case "[message retracted]":
        case "[message deleted]":
          break;
        default:
          debugLog(
            "[action required] Unrecognized deletion status:",
            statusText,
            JSON.stringify(payload)
          );
          throw new Error(
            `Unrecognized deletion status: ${payload.deletedStateMessage}`
          );
      }

      const retracted = statusText === "[message retracted]";

      return {
        type: "markChatItemAsDeletedAction",
        retracted,
        targetId: payload.targetItemId,
        timestamp: new Date(),
      };
    }

    case "addLiveChatTickerItemAction": {
      const { item } = action[type]!;

      const rendererType = Object.keys(
        item
      )[0] as keyof YTAddLiveChatTickerItem;

      switch (rendererType) {
        case "liveChatTickerPaidMessageItemRenderer": {
          // SuperChat ticker
          const renderer = item[rendererType]!;
          return {
            type: "addSuperChatTickerAction",
            ...omitTrackingParams(renderer),
          };
        }
        case "liveChatTickerPaidStickerItemRenderer": {
          // Super Sticker
          const renderer = item[rendererType]!;
          return {
            type: "addSuperStickerTickerAction",
            ...omitTrackingParams(renderer),
          };
        }
        case "liveChatTickerSponsorItemRenderer": {
          // Membership
          const renderer = item[rendererType]!;
          return {
            type: "addMembershipTickerAction",
            ...omitTrackingParams(renderer),
          };
        }
        default:
          debugLog(
            "[action required] Unrecognized renderer type (addLiveChatTickerItemAction):",
            rendererType,
            JSON.stringify(item)
          );

          const _: never = rendererType;
          return _;
      }
    }

    case "replaceChatItemAction": {
      // Replace placeholder item?
      const payload = action[type]!;

      return {
        type: "replaceChatItemAction",
        ...payload,
      };
    }

    case "addBannerToLiveChatCommand": {
      // add pinned item
      const payload = action[type]!["bannerRenderer"]["liveChatBannerRenderer"];

      if (
        payload.header.liveChatBannerHeaderRenderer.icon.iconType !== "KEEP"
      ) {
        debugLog("addBannerToLiveChatCommand", JSON.stringify(payload));
      }

      return {
        type: "addBannerAction",
        ...payload,
      };
    }

    case "removeBannerForLiveChatCommand": {
      // remove pinned item
      const payload = action[type]!;

      return {
        type: "removeBannerAction",
        ...payload,
      };
    }

    case "showLiveChatTooltipCommand": {
      const payload = action[type]!;
      return {
        type: "showTooltipAction",
        ...payload["tooltip"]["tooltipRenderer"],
      };
    }

    case "updateLiveChatPollAction": {
      const payload = action[type]!;
      return {
        type: "updateLiveChatPollAction",
        ...payload["pollToUpdate"]["pollRenderer"],
      };
    }

    case "showLiveChatActionPanelAction": {
      const payload = action[type]!;
      return {
        type: "showLiveChatActionPanelAction",
        ...payload["panelToShow"]["liveChatActionPanelRenderer"],
      };
    }

    case "closeLiveChatActionPanelAction": {
      const payload = action[type]!;
      return {
        type: "closeLiveChatActionPanelAction",
        ...payload,
      };
    }

    default: {
      const _: never = type;
      debugLog(
        "[action required] Unrecognized action type:",
        JSON.stringify(action)
      );
    }
  }

  // TODO: remove unknown type in the future
  return {
    type: "unknown",
    payload: action,
  };
}

export interface ChatService extends Base {}
export class ChatService {
  async fetchChat({
    continuation,
  }: {
    continuation: string;
  }): Promise<SucceededChatResponse | FailedChatResponse> {
    const queryUrl = this.isReplay
      ? "/youtubei/v1/live_chat/get_live_chat_replay"
      : "/youtubei/v1/live_chat/get_live_chat";

    const body = withContext({
      continuation,
    });

    let res: YTChatResponse;

    try {
      res = await this.postJson<YTChatResponse>(queryUrl, {
        body: JSON.stringify(body),
        retry: 3,
        retryInterval: 5000,
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

        switch (status) {
          case YTChatErrorStatus.Invalid: {
            return {
              error: {
                status: FetchChatErrorStatus.Unavailable,
                message:
                  "requested live chat is already in reply mode: " + message,
              },
            };
          }
          case YTChatErrorStatus.PermissionDenied:
          case YTChatErrorStatus.NotFound: {
            return {
              error: {
                status: FetchChatErrorStatus.Unavailable,
                message,
              },
            };
          }
          case YTChatErrorStatus.Unavailable:
          case YTChatErrorStatus.Internal: {
            // it's temporary so should retry
            const err = new Error(message);
            (err as any).type = "system";
            throw err;
          }
          default:
            debugLog(
              "[action required] Unrecognized error code",
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
    } catch (err) {
      debugLog("fetchError", err.message, err.code, err.type);

      switch (err.type) {
        case "invalid-json": {
          // NOTE: rarely occurs
          debugLog("[action required] invalid-json", err.response.text());
        }
        case "system": {
          // ECONNRESET, ETIMEOUT, etc
          // Currently unavailable
        }
      }

      throw err;
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
      // {"contents": {"messageRenderer": {"text": {"runs": [{"text": "Sorry, live chat is currently unavailable"}]}}}} => ?
      // {"trackingParams": ...} => ?
      if ("contents" in obj) {
        debugLog("continuationNotFound(with contents)", JSON.stringify(obj));
        return {
          error: {
            status: FetchChatErrorStatus.LiveChatDisabled,
            message:
              "continuation contents cannot be found. live chat is over, or turned into membership-only stream, or chat got disabled",
          },
        };
      }
      if ("trackingParams" in obj) {
        debugLog(
          "continuationNotFound(with trackingParams)",
          JSON.stringify(obj)
        );
        return {
          error: {
            status: FetchChatErrorStatus.LiveChatDisabled,
            message:
              "continuation contents cannot be found. live chat is over, or turned into membership-only stream, or chat got disabled",
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
      return { actions: [], continuation: newContinuation, error: null };
    }

    // unwrap replay actions into YTActions
    if (this.isReplay) {
      rawActions = rawActions.map(
        // TODO: verify that an action always holds a single item.
        (action): YTAction => {
          const replayAction = Object.values(
            omitTrackingParams(action)
          )[0] as any;

          if (replayAction.actions.length > 1) {
            debugLog("replayCount: " + replayAction.actions.length);
          }

          return replayAction.actions[0];
        }
      );
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
  async *iterateChat({
    tokenType,
  }: {
    tokenType: keyof ReloadContinuationItems;
  }): AsyncGenerator<SucceededChatResponse | FailedChatResponse> {
    let token = this.continuation[tokenType].token;

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
      yield chatResponse;

      // refresh continuation token
      const { continuation } = chatResponse;

      if (!continuation) {
        debugLog("live stream ended");
        break;
      }

      token = continuation.token;

      if (!this.isReplay) {
        await timeoutThen(continuation.timeoutMs);
      }
    }
  }
}
