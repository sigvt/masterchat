import { debugLog, stringify } from "../../utils";
import {
  YTAddLiveChatTickerItem,
  YTAddLiveChatTickerItemAction,
} from "../../interfaces/yt/chat";
import {
  AddMembershipTickerAction,
  AddSuperChatTickerAction,
  AddSuperStickerTickerAction,
} from "../../interfaces/actions";
import { omitTrackingParams } from "../../utils";
import { parseSuperChat } from "../superchat";
import { parseColorCode, pickThumbUrl } from "../utils";

export function parseAddLiveChatTickerItemAction(
  payload: YTAddLiveChatTickerItemAction
) {
  const { item, durationSec } = payload;

  const rendererType = Object.keys(item)[0] as keyof YTAddLiveChatTickerItem;

  switch (rendererType) {
    // SuperChat Ticker
    case "liveChatTickerPaidMessageItemRenderer": {
      const renderer = item[rendererType]!;

      const superchat = parseSuperChat(
        renderer.showItemEndpoint.showLiveChatItemEndpoint.renderer
          .liveChatPaidMessageRenderer
      );
      const authorName = stringify(
        renderer.showItemEndpoint.showLiveChatItemEndpoint.renderer
          .liveChatPaidMessageRenderer.authorName
      );
      const authorPhoto = pickThumbUrl(renderer.authorPhoto);

      if (!authorName) {
        debugLog(
          "[action required] empty authorName at liveChatTickerPaidMessageItemRenderer",
          JSON.stringify(renderer)
        );
      }

      const parsed: AddSuperChatTickerAction = {
        type: "addSuperChatTickerAction",
        id: renderer.id,
        amountText: stringify(renderer.amount),
        durationSec: Number(durationSec),
        fullDurationSec: renderer.fullDurationSec,
        authorChannelId: renderer.authorExternalChannelId,
        authorName,
        authorPhoto,
        superchat,
        amountTextColor: parseColorCode(renderer.amountTextColor),
        startBackgroundColor: parseColorCode(renderer.startBackgroundColor)!,
        endBackgroundColor: parseColorCode(renderer.endBackgroundColor),
      };
      return parsed;
    }

    case "liveChatTickerPaidStickerItemRenderer": {
      // TODO: normalize payload
      // Super Sticker
      const renderer = item[rendererType]!;
      const parsed: AddSuperStickerTickerAction = {
        type: "addSuperStickerTickerAction",
        ...omitTrackingParams(renderer),
      };
      return parsed;
    }
    case "liveChatTickerSponsorItemRenderer": {
      // TODO: normalize payload
      // Membership
      const renderer = item[rendererType]!;
      const parsed: AddMembershipTickerAction = {
        type: "addMembershipTickerAction",
        ...omitTrackingParams(renderer),
      };
      return parsed;
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
