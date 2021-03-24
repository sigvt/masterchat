import fetch from "node-fetch";
import {
  Action,
  AddChatItemActionItem,
  Chat,
  ChatAdditionAction,
  RawAction,
  RawChatErrorStatus,
  RawChatResponse,
  RawContinuationContents,
  TimedContinuation,
} from "./types/chat";
import { Client } from "./context";

export function getContinuation(
  continuationContents: RawContinuationContents
): TimedContinuation | undefined {
  // observed k: invalidationContinuationData | timedContinuationData | liveChatReplayContinuationData
  // continuations[1] would be playerSeekContinuationData
  if (
    Object.keys(
      continuationContents.liveChatContinuation.continuations[0]
    )[0] === "playerSeekContinuationData"
  ) {
    console.log("only playerSeekContinuationData");
    return undefined;
  }

  const continuation = Object.values(
    continuationContents.liveChatContinuation.continuations[0]
  )[0];
  if (!continuation) {
    console.log("no continuation");
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

function parseChatAction(action: RawAction): Action | undefined {
  const filteredActions = omitTrackingParams(action);
  const type = Object.keys(filteredActions)[0] as keyof typeof filteredActions;

  switch (type) {
    case "addChatItemAction":
      const guard = [
        "liveChatTextMessageRenderer",
        "liveChatPaidMessageRenderer",
      ] as const;
      const { item } = action[type]!;
      const rendererType = Object.keys(item)[0] as keyof AddChatItemActionItem;
      if (!(guard as readonly string[]).includes(rendererType)) {
        return undefined;
      }

      const renderer = item[
        rendererType as keyof Pick<AddChatItemActionItem, typeof guard[number]>
      ]!;

      const raw = {
        type: "addChatItemAction",
        id: renderer.id,
        timestampUsec: renderer.timestampUsec,
        timestamp: new Date(parseInt(renderer.timestampUsec, 10) / 1000),
        rawMessage: renderer.message?.runs,
        authorName: renderer.authorName?.simpleText,
        authorChannelId: renderer.authorExternalChannelId,
        authorPhoto: renderer.authorPhoto.thumbnails[0].url,
        isVerified: false,
        isOwner: false,
        isModerator: false,
      } as ChatAdditionAction;

      // if (renderer.message) {
      //   raw.message = toSimpleString(renderer.message);
      // }

      if ("purchaseAmountText" in renderer) {
        const AMOUNT_REGEXP = /[\d.,]+/;
        const input = renderer.purchaseAmountText.simpleText;
        const amountString = AMOUNT_REGEXP.exec(input)![0].replace(/,/g, "");
        const curency = input.replace(AMOUNT_REGEXP, "").trim();
        raw.purchase = {
          amount: parseInt(amountString, 10),
          currency: curency,
          headerBackgroundColor: renderer.headerBackgroundColor.toString(),
          headerTextColor: renderer.headerTextColor.toString(),
          bodyBackgroundColor: renderer.bodyBackgroundColor.toString(),
          bodyTextColor: renderer.bodyTextColor.toString(),
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
                    thumbnail: renderer.customThumbnail.thumbnails[0].url,
                  };
                }
              }
              break;
            default:
              console.log("Unrecognized iconType: " + iconType);
              process.exit(1);
          }
        }
      }

      return raw;
    case "markChatItemsByAuthorAsDeletedAction":
      return {
        type: "markChatItemsByAuthorAsDeletedAction",
        channelId: action[type]!.externalChannelId,
        timestamp: new Date(),
      };
    case "markChatItemAsDeletedAction":
      const deletionAction = action[type]!;
      return {
        type: "markChatItemAsDeletedAction",
        retracted:
          deletionAction.deletedStateMessage.runs[0].text ===
          "[message retracted]",
        targetId: deletionAction.targetItemId,
        timestamp: new Date(),
      };
    case "addLiveChatTickerItemAction":
      // Superchat ticker
      // TODO: handle later
      break;
    case "replaceChatItemAction":
      // Replace placeholder item
      // TODO: handle later
      break;
    case "addBannerToLiveChatCommand":
      // add pinned item
      // TODO: handle later
      break;
    default:
      console.log("Unsupported actionType: " + type);
  }
}

function parseChatActions(actions: RawAction[]): Action[] {
  const parsed = actions
    ?.map(parseChatAction)
    .filter((a): a is Action => a !== undefined);
  return parsed;
}

export async function fetchChat(
  continuationToken: string,
  apiKey: string,
  client: Client,
  isLiveChat: boolean = true
): Promise<Chat | undefined> {
  const endpoint = isLiveChat
    ? `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${apiKey}`
    : `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay?key=${apiKey}`;
  const requestBody = {
    continuation: continuationToken,
    context: {
      client,
    },
  };

  let res: RawChatResponse;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    }).then((res) => res.json());
  } catch (err) {
    switch (err.code) {
      case "ETIMEOUT":
        // to prevent prolonging delay
        return undefined;
      default:
        console.log(err);
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
      case RawChatErrorStatus.PermissionDenied:
      case RawChatErrorStatus.NotFound:
        return undefined;
      case RawChatErrorStatus.Invalid:
        // TODO: inspect request
        return undefined;
      case RawChatErrorStatus.Unavailable:
      case RawChatErrorStatus.Internal:
        // TODO: how should I treat these?
        return undefined;
      default:
        console.log("unrecognized error code", JSON.stringify(res, null, 2));
        return undefined;
    }
  }

  const { continuationContents } = res;

  if (!continuationContents) {
    // there's several possibilities lied here:
    // 1. live chat is over
    // 2. given video is neither a live stream nor an archived stream
    return undefined;
  }

  const continuation = getContinuation(continuationContents);
  if (!continuation) {
    console.log("!continuation", JSON.stringify(res, null, 2));
    // continuation could be nonnull if it only has playerSeekContinuationData, meaning given video is not a live stream (perhaps archived stream)
    return undefined;
  }

  const rawActions = continuationContents.liveChatContinuation.actions;
  if (!rawActions) {
    // this means no chat available between the timeoutMs
    return { continuation, actions: [] };
  }

  const actions = parseChatActions(
    isLiveChat
      ? rawActions
      : rawActions.map(
          // TODO: verify actions actually brace single item all the time
          (action): RawAction => {
            const replayAction = Object.values(
              omitTrackingParams(action)
            )[0] as any;
            if (replayAction.actions.length > 1) {
              console.log("replayCount: " + replayAction.actions.length);
            }
            return replayAction.actions[0];
          }
        )
  );

  const chat: Chat = {
    continuation,
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
  client: Client;
  isLiveChat: boolean;
  ignoreFirstResponse?: boolean;
}) {
  if (ignoreFirstResponse) {
    const chatResponse = await fetchChat(token, apiKey, client, isLiveChat);
    if (!chatResponse) return;
    const { continuation } = chatResponse;
    if (!continuation) return;
    token = continuation.token;
  }

  // continuously fetch chat fragments
  while (true) {
    const chatResponse = await fetchChat(token, apiKey, client, isLiveChat);
    if (!chatResponse) {
      // live chat is over
      break;
    }

    // handle chats
    const { continuation, actions } = chatResponse;
    const delay = continuation?.timeoutMs ?? 0;
    yield { actions, delay };

    // refresh continuation token
    if (!continuation) {
      // end of the chain
      console.log("chatResponse", chatResponse);
      break;
    }
    token = continuation.token;
  }
}
