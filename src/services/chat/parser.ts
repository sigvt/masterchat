import {
  YTAction,
  YTAddLiveChatTickerItem,
  YTLiveChatPaidMessageRenderer,
} from "../../yt/chat";
import { runsToString, debugLog } from "../../utils";
import { omitTrackingParams, parseColorCode } from "./utils";
import {
  Action,
  AddChatItemAction,
  AddSuperChatItemAction,
  LiveChatMode,
  Membership,
  SUPERCHAT_COLOR_MAP,
  SUPERCHAT_SIGNIFICANCE_MAP,
  UnknownAction,
} from "./types";
import { toTLS } from "../../currency";

export function parseSuperChat(renderer: YTLiveChatPaidMessageRenderer) {
  const AMOUNT_REGEXP = /[\d.,]+/;

  const input = renderer.purchaseAmountText.simpleText;
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
                  `[action required] Unrecognized iconType:`,
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
        const text = runsToString(renderer.text.runs);
        const subtext = runsToString(renderer.subtext.runs);

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
