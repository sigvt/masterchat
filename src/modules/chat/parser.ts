import { asString, debugLog } from "../../utils";
import {
  YTAction,
  YTAddLiveChatTickerItem,
  YTAuthorBadge,
  YTLiveChatPaidMessageRenderer,
  YTLiveChatTextMessageRenderer,
  YTRunContainer,
  YTTextRun,
  YTThumbnailList,
} from "../../yt/chat";
import { toTLS } from "./currency";
import {
  Action,
  AddChatItemAction,
  AddMembershipItemAction,
  AddMembershipMilestoneItemAction,
  AddSuperChatItemAction,
  LiveChatMode,
  Membership,
  SuperChat,
  SUPERCHAT_COLOR_MAP,
  SUPERCHAT_SIGNIFICANCE_MAP,
  UnknownAction,
} from "./types";
import { omitTrackingParams, parseColorCode } from "./utils";

const AMOUNT_REGEXP = /[\d.,]+/;

export function parseSuperChat(
  renderer: YTLiveChatPaidMessageRenderer
): SuperChat {
  const input = asString(renderer.purchaseAmountText);
  const amountString = AMOUNT_REGEXP.exec(input)![0].replace(/,/g, "");

  const amount = parseFloat(amountString);
  const currency = toTLS(input.replace(AMOUNT_REGEXP, "").trim());
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
export function parseChatAction(action: YTAction): Action | UnknownAction {
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

        const timestamp = tsToDate(timestampUsec);

        const authorPhoto =
          renderer.authorPhoto.thumbnails[
            renderer.authorPhoto.thumbnails.length - 1
          ].url;

        const { isVerified, isOwner, isModerator, membership } =
          parseBadges(renderer);

        const contextMenuEndpointParams =
          renderer.contextMenuEndpoint!.liveChatItemContextMenuEndpoint.params;

        const action: AddChatItemAction = {
          type: "addChatItemAction",
          id,
          timestamp,
          timestampUsec,
          rawMessage: renderer.message.runs,
          authorName: asString(renderer.authorName),
          authorPhoto,
          authorChannelId,
          membership,
          isVerified,
          isOwner,
          isModerator,
          contextMenuEndpointParams,
        };

        return action;
      } else if ("liveChatPaidMessageRenderer" in item) {
        // Super Chat
        const renderer = item["liveChatPaidMessageRenderer"]!;
        const { timestampUsec, authorExternalChannelId: authorChannelId } =
          renderer;

        const timestamp = tsToDate(timestampUsec);

        const authorPhoto = thumbListToUrl(renderer.authorPhoto);

        const action: AddSuperChatItemAction = {
          type: "addSuperChatItemAction",
          id: renderer.id,
          timestamp,
          timestampUsec,
          rawMessage: renderer.message?.runs,
          authorName: asString(renderer.authorName),
          authorPhoto,
          authorChannelId,
          superchat: parseSuperChat(renderer),
        };

        return action;
      } else if ("liveChatPaidStickerRenderer" in item) {
        // TODO: normalize payload
        // Super Sticker
        const renderer = item["liveChatPaidStickerRenderer"]!;
        return {
          type: "addSuperStickerItemAction",
          ...renderer,
        };
      } else if ("liveChatMembershipItemRenderer" in item) {
        // Membership updates
        const renderer = item["liveChatMembershipItemRenderer"]!;

        const timestampUsec = renderer.timestampUsec;
        const timestamp = tsToDate(timestampUsec);
        const authorName = asString(renderer.authorName);
        const authorPhoto = thumbListToUrl(renderer.authorPhoto);
        const membership = parseMembership(renderer.authorBadges[0]);
        if (!membership)
          throw new Error(
            `Failed to parse membership while handling liveChatMembershipItemRenderer: ${JSON.stringify(
              renderer.authorBadges
            )}`
          );
        const isMilestoneMessage = "empty" in renderer || "message" in renderer;

        if (isMilestoneMessage) {
          const message = renderer.message ? renderer.message.runs : null;
          const durationText = renderer
            .headerPrimaryText!.runs.slice(1)
            .map((r) => r.text)
            .join("");
          const action: AddMembershipMilestoneItemAction = {
            type: "addMembershipMilestoneItemAction",
            id: renderer.id,
            timestampUsec,
            timestamp,
            tenant: asString(renderer.headerSubtext),
            membership,
            authorName,
            authorPhoto,
            message,
            durationText,
          };
          return action;
        }

        const action: AddMembershipItemAction = {
          type: "addMembershipItemAction",
          id: renderer.id,
          timestampUsec,
          timestamp,
          tenant: (renderer.headerSubtext as YTRunContainer<YTTextRun>).runs[1]
            .text,
          membership,
          authorName,
          authorPhoto,
        };
        return action;
      } else if ("liveChatPlaceholderItemRenderer" in item) {
        // TODO: normalize payload
        // Placeholder chat
        const renderer = item["liveChatPlaceholderItemRenderer"]!;
        return {
          type: "addPlaceholderItemAction",
          ...renderer,
        };
      } else if ("liveChatViewerEngagementMessageRenderer" in item) {
        // TODO: normalize payload
        // Engagement
        const renderer = item["liveChatViewerEngagementMessageRenderer"]!;
        return {
          type: "addViewerEngagementMessageAction",
          ...renderer,
        };
      } else if ("liveChatModeChangeMessageRenderer" in item) {
        // Mode Change Message (e.g. toggle members-only)
        const renderer = item["liveChatModeChangeMessageRenderer"]!;
        const text = asString(renderer.text);
        const subtext = asString(renderer.subtext);

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
          // TODO: normalize payload
          // SuperChat ticker
          const renderer = item[rendererType]!;
          return {
            type: "addSuperChatTickerAction",
            ...omitTrackingParams(renderer),
          };
        }
        case "liveChatTickerPaidStickerItemRenderer": {
          // TODO: normalize payload
          // Super Sticker
          const renderer = item[rendererType]!;
          return {
            type: "addSuperStickerTickerAction",
            ...omitTrackingParams(renderer),
          };
        }
        case "liveChatTickerSponsorItemRenderer": {
          // TODO: normalize payload
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
      // TODO: normalize payload
      // Replace chat item with placeholder or renderer
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
        debugLog(
          "[action required] Unknown icon type observed in addBannerToLiveChatCommand",
          JSON.stringify(payload.header.liveChatBannerHeaderRenderer.icon)
        );
      }

      const title = payload.header.liveChatBannerHeaderRenderer.text.runs;
      const message = payload.contents.liveChatTextMessageRenderer.message.runs;
      const renderer = payload.contents.liveChatTextMessageRenderer;
      const timestampUsec = renderer.timestampUsec;
      const timestamp = tsToDate(timestampUsec);
      const authorName = asString(renderer.authorName);
      const authorPhoto = thumbListToUrl(renderer.authorPhoto);
      const authorChannelId = renderer.authorExternalChannelId;
      const { isVerified, isOwner, isModerator, membership } =
        parseBadges(renderer);

      return {
        type: "addBannerAction",
        id: payload.actionId,
        title,
        message,
        timestampUsec,
        timestamp,
        authorName,
        authorPhoto,
        authorChannelId,
        isVerified,
        isOwner,
        isModerator,
        membership,
        contextMenuEndpointParams:
          renderer.contextMenuEndpoint?.liveChatItemContextMenuEndpoint.params,
      };
    }

    case "removeBannerForLiveChatCommand": {
      // TODO: normalize payload
      // remove pinned item
      const payload = action[type]!;

      return {
        type: "removeBannerAction",
        ...payload,
      };
    }

    case "showLiveChatTooltipCommand": {
      // TODO: normalize payload
      const payload = action[type]!;
      return {
        type: "showTooltipAction",
        ...payload["tooltip"]["tooltipRenderer"],
      };
    }

    case "updateLiveChatPollAction": {
      // TODO: normalize payload
      const payload = action[type]!;
      return {
        type: "updateLiveChatPollAction",
        ...payload["pollToUpdate"]["pollRenderer"],
      };
    }

    case "showLiveChatActionPanelAction": {
      // TODO: normalize payload
      const payload = action[type]!;
      return {
        type: "showLiveChatActionPanelAction",
        ...payload["panelToShow"]["liveChatActionPanelRenderer"],
      };
    }

    case "closeLiveChatActionPanelAction": {
      // TODO: normalize payload
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

  return {
    type: "unknown",
    payload: action,
  };
}

function thumbListToUrl(thumbList: YTThumbnailList): string {
  return thumbList.thumbnails[thumbList.thumbnails.length - 1].url;
}

function tsToDate(ts: string): Date {
  return new Date(Number(BigInt(ts) / BigInt(1000)));
}

function parseMembership(badge: YTAuthorBadge): Membership | undefined {
  const renderer = badge.liveChatAuthorBadgeRenderer;
  if (renderer.customThumbnail) {
    const match = /^(.+?)(?:\s\((.+)\))?$/.exec(renderer.tooltip);
    if (match) {
      const [_, status, since] = match;
      const membership = {
        status,
        since,
        thumbnail:
          renderer.customThumbnail.thumbnails[
            renderer.customThumbnail.thumbnails.length - 1
          ].url,
      };
      return membership;
    }
  }
}

function parseBadges(renderer: YTLiveChatTextMessageRenderer) {
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
          membership = parseMembership(badge);
          break;
        default:
          debugLog(
            `[action required] Unrecognized iconType:`,
            iconType,
            JSON.stringify(renderer)
          );
          throw new Error("Unrecognized iconType: " + iconType);
      }
    }
  }

  return {
    isOwner,
    isVerified,
    isModerator,
    membership,
  };
}
