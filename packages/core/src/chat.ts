import fetch from "node-fetch";
import { ClientInfo } from "./context";
import {
  YTAction,
  YTAddChatItemActionItem,
  YTAddLiveChatTickerItem,
  YTBannerRenderer,
  YTChatErrorStatus,
  YTChatResponse,
  YTContinuationContents,
  YTLiveChatMembershipItemRenderer,
  YTLiveChatPaidMessageRenderer,
  YTLiveChatPlaceholderItemRenderer,
  YTLiveChatTickerPaidMessageItemRenderer,
  YTLiveChatTickerPaidStickerItemRenderer,
  YTLiveChatTickerSponsorItemRenderer,
  YTReplaceChatItemAction,
  YTRun,
} from "./types/chat";
import { log } from "./util";

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
  | AddMembershipItemAction
  | AddPlaceholderItemAction
  | ReplaceChatItemAction
  | MarkChatItemAsDeletedAction
  | MarkChatItemsByAuthorAsDeletedAction
  | AddSuperChatTickerAction
  | AddSuperStickerTickerAction
  | AddMembershipTickerAction
  | AddBannerAction
  | RemoveBannerAction;

export interface AddChatItemAction {
  type: "addChatItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;
  rawMessage?: YTRun[];
  authorName?: string;
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
  rawMessage?: YTRun[];
  authorName?: string;
  authorChannelId: string;
  authorPhoto: string;
  superchat: SuperChat;
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

export interface AddBannerAction extends YTBannerRenderer {
  type: "addBannerAction";
}

// TODO: find out interface
export interface RemoveBannerAction {
  type: "removeBannerAction";
}

// Response

export interface SucceededChatResponse {
  continuation?: TimedContinuation;
  actions: Action[];
}

export interface FailedChatResponse {
  error: ChatError;
}

export interface ChatError {
  message: string;
  status: ChatErrorStatus | YTChatErrorStatus;
}

export enum ChatErrorStatus {
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
 *
 * @param {YTAction} action
 * @return {*}  {(Action | undefined)}
 */
function parseChatAction(action: YTAction): Action | undefined {
  const filteredActions = omitTrackingParams(action);
  const type = Object.keys(filteredActions)[0] as keyof typeof filteredActions;

  switch (type) {
    case "addChatItemAction": {
      const { item } = action[type]!;

      const rendererType = Object.keys(
        item
      )[0] as keyof YTAddChatItemActionItem;

      switch (rendererType) {
        case "liveChatTextMessageRenderer": {
          // Chat
          const renderer = item[rendererType]!;
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
                    const match = /^(.+?)(?:\s\((.+)\))?$/.exec(
                      renderer.tooltip
                    );
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
            rawMessage: renderer.message?.runs,
            authorName: renderer.authorName?.simpleText,
            authorPhoto,
            authorChannelId,
            membership,
            isVerified,
            isOwner,
            isModerator,
          };

          return raw;
        }
        case "liveChatPaidMessageRenderer": {
          // Super Chat
          const renderer = item[rendererType]!;
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
        }
        case "liveChatMembershipItemRenderer": {
          // Membership updates
          const renderer = item[rendererType]!;
          return {
            type: "addMembershipItemAction",
            ...renderer,
          };
        }
        case "liveChatPlaceholderItemRenderer": {
          // Placeholder chat
          const renderer = item[rendererType]!;
          return {
            type: "addPlaceholderItemAction",
            ...renderer,
          };
        }
        case "liveChatViewerEngagementMessageRenderer": {
          // Engagement
          // Ignore
          return;
        }
        default: {
          log(
            "Unrecognized renderer type (addChatItemAction):",
            rendererType,
            JSON.stringify(item, null, 2)
          );

          const _exhaust: never = rendererType;
          return _exhaust;
        }
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
          throw new Error(`Unrecognized deletion status: ${statusText}`);
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

          const _exhaust: never = rendererType;
          return _exhaust;
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

    case "removeBannerToLiveChatCommand": {
      // remove pinned item
      const payload = action[type]!;

      log(
        "removeBannerToLiveChatCommand",
        JSON.stringify(action[type]!, null, 2)
      );

      return {
        type: "removeBannerAction",
        ...payload,
      };
    }

    default: {
      log("Unrecognized action type:", JSON.stringify(action[type]!, null, 2));
      // throw new Error("Unsupported actionType: " + type);
    }
  }
}

function parseChatActions(actions: YTAction[]): Action[] {
  return actions
    .map(parseChatAction)
    .filter((a): a is Action => a !== undefined);
}

export async function fetchChat({
  continuation,
  apiKey,
  client,
  isLiveChat = true,
}: {
  continuation: string;
  apiKey: string;
  client: ClientInfo;
  isLiveChat?: boolean;
}): Promise<SucceededChatResponse | FailedChatResponse> {
  const queryUrl = isLiveChat
    ? `${LIVECHAT_API_ENDPOINT}/get_live_chat?key=${apiKey}`
    : `${LIVECHAT_API_ENDPOINT}/get_live_chat_replay?key=${apiKey}`;

  const requestBody = {
    continuation,
    context: {
      client,
    },
  };

  let res: YTChatResponse;

  try {
    res = await fetch(queryUrl, {
      method: "POST",
      body: JSON.stringify(requestBody),
    }).then((res) => res.json());
  } catch (err) {
    log("fetchError", err, err.code);
    switch (err.code) {
      case "ETIMEOUT":
        return {
          error: {
            status: ChatErrorStatus.Timeout,
            message: "Request timeout",
          },
        };

      default:
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

    switch (res.error.status) {
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
        status: res.error.status,
        message: res.error.message,
      },
    };
  }

  const { continuationContents } = res;

  if (!continuationContents) {
    // there's several possibilities lied here:
    // 1. live chat is over
    // 2. turned into membership-only stream
    // 3. given video is neither a live stream nor an archived stream
    return {
      error: {
        status: ChatErrorStatus.Invalid,
        message: "continuationContents cannot be found",
      },
    };
  }

  const newContinuation = getTimedContinuation(continuationContents);

  const rawActions = continuationContents.liveChatContinuation.actions;

  if (!rawActions) {
    // this means no chat available between the timeoutMs
    return { continuation: newContinuation, actions: [] };
  }

  const actions = parseChatActions(
    isLiveChat
      ? rawActions
      : rawActions.map(
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
        )
  );

  const chat: SucceededChatResponse = {
    continuation: newContinuation,
    actions,
  };

  return chat;
}

export async function* iterateChat({
  token,
  apiKey,
  client,
  isLiveChat,
  ignoreFirstResponse = false,
}: {
  token: string;
  apiKey: string;
  client: ClientInfo;
  isLiveChat: boolean;
  ignoreFirstResponse?: boolean;
}) {
  if (ignoreFirstResponse) {
    const chatResponse = await fetchChat({
      continuation: token,
      apiKey,
      client,
      isLiveChat,
    });

    if ("error" in chatResponse) {
      return;
    }

    const { continuation } = chatResponse;

    if (!continuation) {
      throw new Error("Continuation cannot be found");
    }

    token = continuation.token;
  }

  // continuously fetch chat fragments
  while (true) {
    const chatResponse = await fetchChat({
      continuation: token,
      apiKey,
      client,
      isLiveChat,
    });

    if ("error" in chatResponse) {
      log("error", chatResponse.error);
      break;
    }

    // handle chats
    const { continuation, actions } = chatResponse;

    const delay = continuation?.timeoutMs ?? 0;

    yield { actions, delay, continuation };

    // refresh continuation token
    if (!continuation) {
      log("no continuation");
      // end of the chain
      break;
    }

    token = continuation.token;
  }
}
