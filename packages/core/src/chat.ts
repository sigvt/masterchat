import fetch from "cross-fetch";
import { DEFAULT_CLIENT } from "./auth";
import {
  YTAction,
  YTAddLiveChatTickerItem,
  YTChatErrorStatus,
  YTChatResponse,
  YTCloseLiveChatActionPanelAction,
  YTContinuationContents,
  YTLiveChatBannerRenderer,
  YTLiveChatMembershipItemRenderer,
  YTLiveChatPaidMessageRenderer,
  YTLiveChatPaidStickerRenderer,
  YTLiveChatPlaceholderItemRenderer,
  YTLiveChatPollRenderer,
  YTLiveChatTickerPaidMessageItemRenderer,
  YTLiveChatTickerPaidStickerItemRenderer,
  YTLiveChatTickerSponsorItemRenderer,
  YTLiveChatViewerEngagementMessageRenderer,
  YTLiveChatActionPanelRenderer,
  YTRemoveBannerForLiveChatCommand,
  YTReplaceChatItemAction,
  YTRun,
  YTTooltipRenderer,
} from "./types/chat";
import { convertRunsToString, log, timeoutThen } from "./util";

/** References
 * @see https://developers.google.com/youtube/v3/live/docs/liveChatMessages
 */

const LIVECHAT_API_ENDPOINT = "https://www.youtube.com/youtubei/v1/live_chat";

export const SUPERCHAT_SIGNIFICANCE_MAP = {
  blue: 1,
  lightblue: 2,
  green: 3,
  yellow: 4,
  orange: 5,
  magenta: 6,
  red: 7,
} as const;

/**
 * Map from headerBackgroundColor to color name
 */
export const SUPERCHAT_COLOR_MAP = {
  "4279592384": "blue",
  "4278237396": "lightblue",
  "4278239141": "green",
  "4294947584": "yellow",
  "4293284096": "orange",
  "4290910299": "magenta",
  "4291821568": "red",
} as const;

/**
 * Errors
 */

export interface YTLiveError {
  message: string;
  status: FetchChatErrorStatus | YTChatErrorStatus;
}

export enum FetchChatErrorStatus {
  LiveChatDisabled = "LIVE_CHAT_DISABLED",
  Unavailable = "UNAVAILABLE",
}

/**
 * Components
 */

export type OmitTrackingParams<T> = Omit<
  T,
  "clickTrackingParams" | "trackingParams"
>;

export interface Membership {
  status: string;
  since?: string;
  thumbnail: string;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  opacity: number;
}

export type SuperChatSignificance =
  typeof SUPERCHAT_SIGNIFICANCE_MAP[keyof typeof SUPERCHAT_SIGNIFICANCE_MAP];

export type SuperChatColor =
  typeof SUPERCHAT_COLOR_MAP[keyof typeof SUPERCHAT_COLOR_MAP];

export interface SuperChat {
  amount: number;
  currency: string;
  color: SuperChatColor;
  significance: SuperChatSignificance;
  headerBackgroundColor: Color;
  headerTextColor: Color;
  bodyBackgroundColor: Color;
  bodyTextColor: Color;
}

/**
 * Continuation
 */

export interface ReloadContinuation {
  token: string;
}

export type ReloadContinuationItems = {
  top: ReloadContinuation;
  all: ReloadContinuation;
};

export interface TimedContinuation extends ReloadContinuation {
  timeoutMs: number;
}

/**
 * Actions
 */

export type Action =
  | AddChatItemAction
  | AddSuperChatItemAction
  | AddSuperStickerItemAction
  | AddMembershipItemAction
  | AddPlaceholderItemAction
  | ReplaceChatItemAction
  | MarkChatItemAsDeletedAction
  | MarkChatItemsByAuthorAsDeletedAction
  | AddSuperChatTickerAction
  | AddSuperStickerTickerAction
  | AddMembershipTickerAction
  | AddBannerAction
  | RemoveBannerAction
  | AddViewerEngagementMessageAction
  | ShowTooltipAction
  | ShowLiveChatActionPanelAction
  | CloseLiveChatActionPanelAction
  | UpdateLiveChatPollAction
  | ModeChangeAction;

export interface AddChatItemAction {
  type: "addChatItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;
  rawMessage: YTRun[];
  authorName: string;
  authorChannelId: string;
  authorPhoto: string;
  membership?: Membership;
  isOwner: boolean;
  isModerator: boolean;
  isVerified: boolean;
}

export interface AddSuperChatItemAction {
  type: "addSuperChatItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;
  rawMessage: YTRun[] | undefined;
  authorName: string;
  authorChannelId: string;
  authorPhoto: string;
  superchat: SuperChat;
}

export interface AddSuperStickerItemAction
  extends YTLiveChatPaidStickerRenderer {
  type: "addSuperStickerItemAction";
}

export interface AddMembershipItemAction
  extends YTLiveChatMembershipItemRenderer {
  type: "addMembershipItemAction";
}

export interface AddPlaceholderItemAction
  extends YTLiveChatPlaceholderItemRenderer {
  type: "addPlaceholderItemAction";
}

export interface ReplaceChatItemAction extends YTReplaceChatItemAction {
  type: "replaceChatItemAction";
}

export interface MarkChatItemAsDeletedAction {
  type: "markChatItemAsDeletedAction";
  retracted: boolean;
  targetId: string;
  timestamp: Date;
}

export interface MarkChatItemsByAuthorAsDeletedAction {
  type: "markChatItemsByAuthorAsDeletedAction";
  channelId: string;
  timestamp: Date;
}

export interface AddSuperChatTickerAction
  extends OmitTrackingParams<YTLiveChatTickerPaidMessageItemRenderer> {
  type: "addSuperChatTickerAction";
}

export interface AddSuperStickerTickerAction
  extends OmitTrackingParams<YTLiveChatTickerPaidStickerItemRenderer> {
  type: "addSuperStickerTickerAction";
}

export interface AddMembershipTickerAction
  extends OmitTrackingParams<YTLiveChatTickerSponsorItemRenderer> {
  type: "addMembershipTickerAction";
}

export interface AddBannerAction extends YTLiveChatBannerRenderer {
  type: "addBannerAction";
}

export interface RemoveBannerAction extends YTRemoveBannerForLiveChatCommand {
  type: "removeBannerAction";
}

export interface ShowTooltipAction extends YTTooltipRenderer {
  type: "showTooltipAction";
}

export interface AddViewerEngagementMessageAction
  extends YTLiveChatViewerEngagementMessageRenderer {
  type: "addViewerEngagementMessageAction";
}

export interface ShowLiveChatActionPanelAction
  extends YTLiveChatActionPanelRenderer {
  type: "showLiveChatActionPanelAction";
}

export interface CloseLiveChatActionPanelAction
  extends YTCloseLiveChatActionPanelAction {
  type: "closeLiveChatActionPanelAction";
}

export interface UpdateLiveChatPollAction extends YTLiveChatPollRenderer {
  type: "updateLiveChatPollAction";
}

export enum LiveChatMode {
  MembersOnly = "MEMBERS_ONLY",
  Slow = "SLOW",
  SubscribersOnly = "SUBSCRIBERS_ONLY",
  Unknown = "UNKNOWN",
}

export interface ModeChangeAction {
  type: "modeChangeAction";
  mode: LiveChatMode;
  enabled: boolean;
  description: string;
}

export interface UnknownAction {
  type: "unknown";
  payload: unknown;
}

/**
 * Response
 */

export interface SucceededChatResponse {
  actions: Action[];
  continuation: TimedContinuation | undefined;
  error: null;
}

export interface FailedChatResponse {
  error: YTLiveError;
}

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
                log(
                  "[action required] Unrecognized iconType:",
                  iconType,
                  JSON.stringify(renderer)
                );
                throw new Error("Unrecognized iconType: " + iconType);
            }
          }
        }

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
          log(
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
        log(
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
          log(
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
          log(
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
        log("addBannerToLiveChatCommand", JSON.stringify(payload));
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
      log(
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

export async function fetchChat({
  continuation,
  apiKey,
  isReplayChat = false,
}: {
  continuation: string;
  apiKey: string;
  isReplayChat?: boolean;
}): Promise<SucceededChatResponse | FailedChatResponse> {
  const queryUrl = isReplayChat
    ? `${LIVECHAT_API_ENDPOINT}/get_live_chat_replay?key=${apiKey}`
    : `${LIVECHAT_API_ENDPOINT}/get_live_chat?key=${apiKey}`;

  const requestBody = {
    continuation,
    context: {
      client: DEFAULT_CLIENT,
    },
  };

  const MAX_RETRY_COUNT = 3;
  let res: YTChatResponse;
  let retryRemaining = MAX_RETRY_COUNT;

  while (true) {
    try {
      res = await fetch(queryUrl, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "accept-language": "en",
        },
      }).then((res) => res.json());

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
            log(
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

      // res is ok
      break;
    } catch (err) {
      log("fetchError", err.message, err.code, err.type);
      switch (err.type) {
        case "invalid-json":
          // TODO: rarely occurs
          log("[action required] invalid-json", err.response.text());
        case "system":
          // ECONNRESET, ETIMEOUT, etc
          if (retryRemaining > 0) {
            retryRemaining -= 1;
            log(`Retrying (remaining: ${retryRemaining})`);
            await timeoutThen(5000);
            continue;
          }
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
    log("continuationNotFound(LiveChatDisabled)", JSON.stringify(obj));

    return {
      error: {
        status: FetchChatErrorStatus.LiveChatDisabled,
        message:
          "continuation contents cannot be found. live chat is over, or turned into membership-only stream, or chat got disabled",
      },
    };
  }

  const newContinuation = getTimedContinuation(continuationContents);

  let rawActions = continuationContents.liveChatContinuation.actions;

  // this means no chat available between the time window
  if (!rawActions) {
    return { actions: [], continuation: newContinuation, error: null };
  }

  // unwrap replay actions into YTActions
  if (isReplayChat) {
    rawActions = rawActions.map(
      // TODO: verify that an action always holds a single item.
      (action): YTAction => {
        const replayAction = Object.values(
          omitTrackingParams(action)
        )[0] as any;

        if (replayAction.actions.length > 1) {
          log("replayCount: " + replayAction.actions.length);
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
export async function* iterateChat({
  token,
  apiKey,
  isReplayChat = false,
}: {
  token: string;
  apiKey: string;
  isReplayChat?: boolean;
}): AsyncGenerator<SucceededChatResponse | FailedChatResponse> {
  // continuously fetch chat fragments
  while (true) {
    const chatResponse = await fetchChat({
      continuation: token,
      apiKey,
      isReplayChat,
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
      // TODO: verify that this scenario actually exists
      log(
        "[action required] got chatResponse but no continuation event occurred"
      );
      break;
    }

    token = continuation.token;
  }
}
