import fetch from "node-fetch";
import { ClientInfo } from "./context";
import {
  YTAction,
  YTAddLiveChatTickerItem,
  YTLiveChatBannerRenderer,
  YTChatErrorStatus,
  YTChatResponse,
  YTContinuationContents,
  YTLiveChatMembershipItemRenderer,
  YTLiveChatPaidMessageRenderer,
  YTLiveChatPaidStickerRenderer,
  YTLiveChatPlaceholderItemRenderer,
  YTLiveChatTickerPaidMessageItemRenderer,
  YTLiveChatTickerPaidStickerItemRenderer,
  YTLiveChatTickerSponsorItemRenderer,
  YTReplaceChatItemAction,
  YTRun,
  YTRemoveBannerForLiveChatCommand,
  YTTooltipRenderer,
  YTLiveChatViewerEngagementMessageRenderer,
} from "./types/chat";
import { log, timeoutThen } from "./util";

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

// Map from headerBackgroundColor to color name
export const SUPERCHAT_COLOR_MAP = {
  "4279592384": "blue",
  "4278237396": "lightblue",
  "4278239141": "green",
  "4294947584": "yellow",
  "4293284096": "orange",
  "4290910299": "magenta",
  "4291821568": "red",
} as const;

// Components

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

export type SuperChatSignificance = typeof SUPERCHAT_SIGNIFICANCE_MAP[keyof typeof SUPERCHAT_SIGNIFICANCE_MAP];

export type SuperChatColor = typeof SUPERCHAT_COLOR_MAP[keyof typeof SUPERCHAT_COLOR_MAP];

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

// Continuation

export interface ReloadContinuation {
  token: string;
}

export type ReloadContinuationItems = {
  [index in ReloadContinuationType]: ReloadContinuation;
};

export enum ReloadContinuationType {
  Top = "top",
  All = "all",
}

export interface TimedContinuation extends ReloadContinuation {
  timeoutMs: number;
}

// Actions

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
  | ShowTooltipAction;

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

export interface UnknownAction {
  type: "unknown";
  payload: unknown;
}

// Response

export interface SucceededChatResponse {
  actions: Action[];
  continuation: TimedContinuation | undefined;
  error: null;
}

export interface FailedChatResponse {
  error: ChatError;
}

export interface ChatError {
  message: string;
  status: FetchChatErrorStatus | YTChatErrorStatus;
}

export enum FetchChatErrorStatus {
  Invalid = "INVALID",
  Timeout = "TIMEOUT",
  ContinuationNotFound = "CONTINUATION_NOT_FOUND",
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

export function getTimedContinuation(
  continuationContents: YTContinuationContents
): TimedContinuation | undefined {
  // observed k: invalidationContinuationData | timedContinuationData | liveChatReplayContinuationData
  // continuations[1] would be playerSeekContinuationData
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

  const amount = parseInt(amountString, 10);
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
 * parse raw action object and returns Action
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
                  "Unrecognized iconType:",
                  iconType,
                  JSON.stringify(renderer, null, 2)
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
        const {
          timestampUsec,
          authorExternalChannelId: authorChannelId,
        } = renderer;

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
      } else {
        log(
          "Unrecognized renderer type (addChatItemAction):",
          JSON.stringify(item, null, 2)
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
            "Unrecognized deletion status:",
            statusText,
            JSON.stringify(payload, null, 2)
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
            "Unrecognized renderer type (addLiveChatTickerItemAction):",
            rendererType,
            JSON.stringify(item, null, 2)
          );

          const _: never = rendererType;
          return _;
      }
    }

    case "replaceChatItemAction": {
      // Replace placeholder item?
      const payload = action[type]!;

      log("replaceChatItemAction", JSON.stringify(payload, null, 2));

      return {
        type: "replaceChatItemAction",
        ...payload,
      };
    }

    case "addBannerToLiveChatCommand": {
      // add pinned item
      const payload = action[type]!["bannerRenderer"]["liveChatBannerRenderer"];

      log("addBannerToLiveChatCommand", JSON.stringify(action[type]!, null, 2));

      return {
        type: "addBannerAction",
        ...payload,
      };
    }

    case "removeBannerForLiveChatCommand": {
      // remove pinned item
      const payload = action[type]!;

      log(
        "removeBannerForLiveChatCommand",
        JSON.stringify(action[type]!, null, 2)
      );

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

    default: {
      const _: never = type;

      const actionString = JSON.stringify(action, null, 2);
      log("Unrecognized action type:", actionString);
    }
  }

  // TODO: remove unknown type in future
  return {
    type: "unknown",
    payload: action,
  };
}

export async function fetchChat({
  continuation,
  apiKey,
  client,
  isReplayChat = false,
}: {
  continuation: string;
  apiKey: string;
  client: ClientInfo;
  isReplayChat?: boolean;
}): Promise<SucceededChatResponse | FailedChatResponse> {
  const queryUrl = isReplayChat
    ? `${LIVECHAT_API_ENDPOINT}/get_live_chat_replay?key=${apiKey}`
    : `${LIVECHAT_API_ENDPOINT}/get_live_chat?key=${apiKey}`;

  const requestBody = {
    continuation,
    context: {
      client,
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
      }).then((res) => res.json());
      retryRemaining = MAX_RETRY_COUNT;
      break;
    } catch (err) {
      log("fetchError", err, err.code);
      switch (err.code) {
        case "ETIMEOUT":
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

  if (res.error) {
    // error.code ->
    //   400: request contains an invalid argument
    //   403:
    //     - video is private (no permission)
    //     - something went wrong (?)
    //   404: request entity was not found (removed by uploader)
    //   500: internal error encountered
    //   503: The service is currently unavailable (temporary?)

    const { status, message } = res.error;

    switch (status) {
      case YTChatErrorStatus.PermissionDenied:
      case YTChatErrorStatus.NotFound:
      case YTChatErrorStatus.Invalid:
      case YTChatErrorStatus.Unavailable:
      case YTChatErrorStatus.Internal:
        break;
      default:
        log("unrecognized error code", JSON.stringify(res, null, 2));
    }

    return {
      error: {
        status,
        message,
      },
    };
  }

  const { continuationContents } = res;

  if (!continuationContents) {
    // there's several possibilities lied here:
    // 1. live chat is over
    // 2. turned into membership-only stream
    // 3. given video is neither a live stream nor an archived stream
    log(JSON.stringify(res, null, 2));
    return {
      error: {
        status: FetchChatErrorStatus.Invalid,
        message: "continuationContents cannot be found",
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
      // TODO: verify actions actually brace single item all the time
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

export async function* iterateChat({
  token,
  apiKey,
  client,
  isReplayChat = false,
}: {
  token: string;
  apiKey: string;
  client: ClientInfo;
  isReplayChat?: boolean;
}): AsyncGenerator<SucceededChatResponse | FailedChatResponse> {
  // continuously fetch chat fragments
  while (true) {
    const chatResponse = await fetchChat({
      continuation: token,
      apiKey,
      client,
      isReplayChat,
    });

    // handle errors
    if (chatResponse.error) {
      log("error", chatResponse.error);
      yield chatResponse;
      continue;
    }

    // handle chats
    yield chatResponse;

    // refresh continuation token
    const { continuation } = chatResponse;
    if (!continuation) {
      // TODO: check if this scenario actually exists
      log("live stream might be over. no timed continuation found.");
      break;
    }

    token = continuation.token;
  }
}
