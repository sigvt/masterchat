import fetch from "node-fetch";
import { ClientInfo } from "./context";
import {
  YTAction,
  YTAddChatItemActionItem,
  YTChatErrorStatus,
  YTChatResponse,
  YTContinuationContents,
  YTRun,
} from "./types/chat";
import { log } from "./util";

// Components

export const SUPERCHAT_SIGNIFICANCE_MAP = {
  blue: 1,
  lightblue: 2,
  green: 3,
  yellow: 4,
  orange: 5,
  magenta: 6,
  red: 7,
} as const;

export const SUPERCHAT_COLOR_MAP = {
  "4279592384": "blue",
  "4278237396": "lightblue",
  "4278239141": "green",
  "4294947584": "yellow",
  "4293284096": "orange",
  "4290910299": "magenta",
  "4291821568": "red",
} as const;

export interface Membership {
  status: string;
  since: string;
  thumbnail: string;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  opacity: number;
}

export type SuperchatSignificance = typeof SUPERCHAT_SIGNIFICANCE_MAP[keyof typeof SUPERCHAT_SIGNIFICANCE_MAP];

export type SuperchatColor = typeof SUPERCHAT_COLOR_MAP[keyof typeof SUPERCHAT_COLOR_MAP];

export interface Superchat {
  amount: number;
  currency: string;
  color: SuperchatColor;
  significance: SuperchatSignificance;
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
  | ChatAdditionAction
  | ChatDeletionAction
  | ChatByAuthorDeletionAction;

/*
  liveChatPlaceholderItemRenderer?: LiveChatPlaceholderItemRenderer; -> ignore
  liveChatMembershipItemRenderer?: LiveChatMembershipItemRenderer; -> ignore
  liveChatViewerEngagementMessageRenderer; -> ignore
  */
export interface ChatAdditionAction {
  type: "addChatItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;
  rawMessage?: YTRun[];
  authorName?: string;
  authorChannelId: string;
  authorPhoto: string;
  superchat?: Superchat;
  membership?: Membership;
  isOwner: boolean;
  isModerator: boolean;
  isVerified: boolean;
}

export interface ChatByAuthorDeletionAction {
  type: "markChatItemsByAuthorAsDeletedAction";
  channelId: string;
  timestamp: Date;
}

export interface ChatDeletionAction {
  type: "markChatItemAsDeletedAction";
  retracted: boolean;
  targetId: string;
  timestamp: Date;
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

function splitColorCode(code: number): Color | undefined {
  if (code > 4294967295) {
    return undefined;
  }

  const b = code & 0xff;
  const g = (code >>> 8) & 0xff;
  const r = (code >>> 16) & 0xff;
  const opacity = code >>> 24;

  return { r, g, b, opacity };
}

export function getContinuation(
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

function omitTrackingParams<T>(obj: T): Omit<T, "clickTrackingParams"> {
  return Object.entries(obj)
    .filter(([k]) => k !== "clickTrackingParams")
    .reduce(
      (sum, [k, v]) => (
        (sum[k as keyof Omit<T, "clickTrackingParams">] = v), sum
      ),
      {} as Omit<T, "clickTrackingParams">
    );
}

function parseChatAction(action: YTAction): Action | undefined {
  const filteredActions = omitTrackingParams(action);
  const type = Object.keys(filteredActions)[0] as keyof typeof filteredActions;

  switch (type) {
    case "addChatItemAction": {
      const guard = [
        "liveChatTextMessageRenderer",
        "liveChatPaidMessageRenderer",
      ] as const;

      const { item } = action[type]!;

      const rendererType = Object.keys(
        item
      )[0] as keyof YTAddChatItemActionItem;

      if (!(guard as readonly string[]).includes(rendererType)) {
        if (
          ![
            "liveChatViewerEngagementMessageRenderer",
            "liveChatPlaceholderItemRenderer",
            "liveChatMembershipItemRenderer",
          ].includes(rendererType)
        ) {
          log("off guard", rendererType, JSON.stringify(item, null, 2));
        }
        // - liveChatViewerEngagementMessageRenderer - Engagement
        // - liveChatPlaceholderItemRenderer - Placeholder chat
        // - liveChatMembershipItemRenderer - New membership
        return undefined;
      }

      const renderer = item[
        rendererType as keyof Pick<
          YTAddChatItemActionItem,
          typeof guard[number]
        >
      ]!;

      const timestamp = new Date(parseInt(renderer.timestampUsec, 10) / 1000);
      const authorPhoto =
        renderer.authorPhoto.thumbnails[
          renderer.authorPhoto.thumbnails.length - 1
        ].url;

      const raw = {
        type: "addChatItemAction",
        id: renderer.id,
        timestamp,
        timestampUsec: renderer.timestampUsec,
        rawMessage: renderer.message?.runs,
        authorName: renderer.authorName?.simpleText,
        authorPhoto,
        authorChannelId: renderer.authorExternalChannelId,
        superchat: undefined,
        membership: undefined,
        isVerified: false,
        isOwner: false,
        isModerator: false,
      } as ChatAdditionAction;

      if ("purchaseAmountText" in renderer) {
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

        raw.superchat = {
          amount,
          currency,
          color,
          significance,
          headerBackgroundColor: splitColorCode(
            renderer.headerBackgroundColor
          )!,
          headerTextColor: splitColorCode(renderer.headerTextColor)!,
          bodyBackgroundColor: splitColorCode(renderer.bodyBackgroundColor)!,
          bodyTextColor: splitColorCode(renderer.bodyTextColor)!,
        };
      }

      if ("authorBadges" in renderer && renderer.authorBadges) {
        for (const badge of renderer.authorBadges) {
          const renderer = badge.liveChatAuthorBadgeRenderer;
          const iconType = renderer.icon?.iconType;
          switch (iconType) {
            case "VERIFIED":
              raw.isVerified = true;
              break;
            case "OWNER":
              raw.isOwner = true;
              break;
            case "MODERATOR":
              raw.isModerator = true;
              break;
            case undefined:
              // membership
              if (renderer.customThumbnail) {
                const match = /^(.+?)(?:\s\((.+)\))?$/.exec(renderer.tooltip);
                if (match) {
                  const [_, status, since] = match;
                  raw.membership = {
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
              throw new Error("Unrecognized iconType: " + iconType);
          }
        }
      }

      return raw;
    }

    case "markChatItemsByAuthorAsDeletedAction": {
      return {
        type: "markChatItemsByAuthorAsDeletedAction",
        channelId: action[type]!.externalChannelId,
        timestamp: new Date(),
      };
    }

    case "markChatItemAsDeletedAction": {
      const deletionAction = action[type]!;
      return {
        type: "markChatItemAsDeletedAction",
        retracted:
          deletionAction.deletedStateMessage.runs[0].text ===
          "[message retracted]",
        targetId: deletionAction.targetItemId,
        timestamp: new Date(),
      };
    }

    case "addLiveChatTickerItemAction": {
      // Superchat ticker: "liveChatTickerPaidMessageItemRenderer"
      // New membership: "liveChatTickerSponsorItemRenderer"
      const { item } = action[type]!;

      const rendererType = Object.keys(item)[0];
      if (
        ![
          "liveChatTickerPaidMessageItemRenderer",
          "liveChatTickerSponsorItemRenderer",
        ].includes(rendererType)
      ) {
        log(
          "addLiveChatTickerItemAction",
          JSON.stringify(action[type]!, null, 2)
        );
      }
      // TODO: handle later
      break;
    }

    case "replaceChatItemAction": {
      log("replaceChatItemAction", JSON.stringify(action[type]!, null, 2));
      // Replace placeholder item?
      // TODO: handle later
      break;
    }

    case "addBannerToLiveChatCommand": {
      log("addBannerToLiveChatCommand", JSON.stringify(action[type]!, null, 2));
      // add pinned item
      // TODO: handle later
      break;
    }

    case "removeBannerToLiveChatCommand": {
      log(
        "removeBannerToLiveChatCommand",
        JSON.stringify(action[type]!, null, 2)
      );
      // add pinned item
      // TODO: handle later
      break;
    }

    default: {
      log("Unsupported action", JSON.stringify(action[type]!, null, 2));
      throw new Error("Unsupported actionType: " + type);
    }
  }
}

function parseChatActions(actions: YTAction[]): Action[] {
  const parsed = actions
    ?.map(parseChatAction)
    .filter((a): a is Action => a !== undefined);

  return parsed;
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
  const endpoint = isLiveChat
    ? `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${apiKey}`
    : `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay?key=${apiKey}`;

  const requestBody = {
    continuation,
    context: {
      client,
    },
  };

  let res: YTChatResponse;

  try {
    res = await fetch(endpoint, {
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
    // 2. given video is neither a live stream nor an archived stream
    return {
      error: {
        status: ChatErrorStatus.Invalid,
        message: "continuationContents cannot be found",
      },
    };
  }

  const newContinuation = getContinuation(continuationContents);

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
