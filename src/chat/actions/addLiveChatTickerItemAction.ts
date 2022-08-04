import { unknown } from "..";
import {
  AddMembershipTickerAction,
  AddSuperChatTickerAction,
  AddSuperStickerTickerAction,
} from "../../interfaces/actions";
import {
  YTAddLiveChatTickerItem,
  YTAddLiveChatTickerItemAction,
  YTLiveChatTickerPaidMessageItemRenderer,
  YTLiveChatTickerPaidStickerItemRenderer,
  YTLiveChatTickerSponsorItemRenderer,
} from "../../interfaces/yt/chat";
import { debugLog, stringify } from "../../utils";
import { parseColorCode, pickThumbUrl } from "../utils";
import {
  parseLiveChatMembershipItemRenderer,
  parseLiveChatPaidMessageRenderer,
  parseLiveChatPaidStickerRenderer,
  parseLiveChatSponsorshipsGiftPurchaseAnnouncementRenderer,
} from "./addChatItemAction";

export function parseAddLiveChatTickerItemAction(
  payload: YTAddLiveChatTickerItemAction
) {
  const { item, durationSec } = payload;

  const rendererType = Object.keys(item)[0] as keyof YTAddLiveChatTickerItem;

  switch (rendererType) {
    // SuperChat Ticker
    case "liveChatTickerPaidMessageItemRenderer": {
      const renderer = item[rendererType]!;
      return parseLiveChatTickerPaidMessageItemRenderer(renderer, durationSec);
    }

    case "liveChatTickerPaidStickerItemRenderer": {
      // Super Sticker
      const renderer = item[rendererType]!;
      const parsed: AddSuperStickerTickerAction =
        parseLiveChatTickerPaidStickerItemRenderer(renderer, durationSec);
      return parsed;
    }

    case "liveChatTickerSponsorItemRenderer": {
      // Membership
      const renderer = item[rendererType]!;
      const parsed: AddMembershipTickerAction =
        parseLiveChatTickerSponsorItemRenderer(renderer, durationSec);
      return parsed;
    }

    default:
      debugLog(
        "[action required] Unrecognized renderer type (addLiveChatTickerItemAction):",
        rendererType,
        JSON.stringify(item)
      );

      const _: never = rendererType;
  }

  return unknown(payload);
}

function parseLiveChatTickerPaidMessageItemRenderer(
  renderer: YTLiveChatTickerPaidMessageItemRenderer,
  durationSec: string
) {
  const contents = parseLiveChatPaidMessageRenderer(
    renderer.showItemEndpoint.showLiveChatItemEndpoint.renderer
      .liveChatPaidMessageRenderer
  );
  const authorPhoto = pickThumbUrl(renderer.authorPhoto);

  const parsed: AddSuperChatTickerAction = {
    type: "addSuperChatTickerAction",
    id: renderer.id,
    authorChannelId: renderer.authorExternalChannelId,
    authorPhoto,
    amountText: stringify(renderer.amount),
    durationSec: Number(durationSec),
    fullDurationSec: renderer.fullDurationSec,
    contents,
    amountTextColor: parseColorCode(renderer.amountTextColor),
    startBackgroundColor: parseColorCode(renderer.startBackgroundColor)!,
    endBackgroundColor: parseColorCode(renderer.endBackgroundColor),
  };

  return parsed;
}

function parseLiveChatTickerPaidStickerItemRenderer(
  renderer: YTLiveChatTickerPaidStickerItemRenderer,
  durationSec: string
): AddSuperStickerTickerAction {
  const contents = parseLiveChatPaidStickerRenderer(
    renderer.showItemEndpoint.showLiveChatItemEndpoint.renderer
      .liveChatPaidStickerRenderer
  );
  const authorName =
    renderer.authorPhoto.accessibility?.accessibilityData.label;
  const authorChannelId = renderer.authorExternalChannelId;
  const authorPhoto = pickThumbUrl(renderer.authorPhoto);

  if (!authorName) {
    debugLog(
      "[action required] empty authorName (parseLiveChatTickerPaidStickerItemRenderer):",
      JSON.stringify(renderer.authorPhoto)
    );
  }

  // NOTE: tickerThumbnails can be more than single entry
  const tickerPackThumbnail = pickThumbUrl(renderer.tickerThumbnails[0]);
  const tickerPackName =
    renderer.tickerThumbnails[0].accessibility!.accessibilityData.label;

  return {
    type: "addSuperStickerTickerAction",
    id: renderer.id,
    authorName: authorName!,
    authorChannelId,
    authorPhoto,
    durationSec: Number(durationSec),
    fullDurationSec: renderer.fullDurationSec,
    tickerPackThumbnail,
    tickerPackName,
    contents,
    startBackgroundColor: parseColorCode(renderer.startBackgroundColor)!,
    endBackgroundColor: parseColorCode(renderer.endBackgroundColor),
  };
}

function parseLiveChatTickerSponsorItemRenderer(
  renderer: YTLiveChatTickerSponsorItemRenderer,
  durationSec: string
): AddMembershipTickerAction {
  const authorChannelId = renderer.authorExternalChannelId;
  const authorPhoto = pickThumbUrl(renderer.sponsorPhoto);

  /**
   * - membership / membership milestone
   * detailIcon -> undefined
   * detailText -> {simpleText: "20"} // amount
   * showItemEndpoint.showLiveChatItemEndpoint.renderer -> liveChatMembershipItemRenderer
   *
   * - membership gift
   * detailIcon -> {iconType: "GIFT"}
   * detailText -> {runs: [{text: "Member"}]}
   * showItemEndpoint.showLiveChatItemEndpoint.renderer -> liveChatSponsorshipsGiftPurchaseAnnouncementRenderer
   * also liveChatSponsorshipsGiftPurchaseAnnouncementRenderer missing timestampUsec
   */
  // const iconType = renderer.detailIcon?.iconType;
  const rdr = renderer.showItemEndpoint.showLiveChatItemEndpoint.renderer;
  let contents;
  if ("liveChatMembershipItemRenderer" in rdr) {
    contents = parseLiveChatMembershipItemRenderer(
      rdr.liveChatMembershipItemRenderer
    );
  } else if ("liveChatSponsorshipsGiftPurchaseAnnouncementRenderer" in rdr) {
    contents = parseLiveChatSponsorshipsGiftPurchaseAnnouncementRenderer(
      rdr.liveChatSponsorshipsGiftPurchaseAnnouncementRenderer
    );
  } else {
    const key = Object.keys(rdr)[0];
    debugLog(
      `[action required] Unrecognized renderer '${key}' (parseLiveChatTickerSponsorItemRenderer):`,
      JSON.stringify(renderer)
    );
    throw new Error(
      `Unrecognized renderer (parseLiveChatTickerSponsorItemRenderer): ${key}`
    );
  }

  return {
    type: "addMembershipTickerAction",
    id: renderer.id,
    authorChannelId,
    authorPhoto,
    durationSec: Number(durationSec),
    fullDurationSec: renderer.fullDurationSec,
    detailText: renderer.detailText,
    contents,
    detailTextColor: parseColorCode(renderer.detailTextColor)!,
    startBackgroundColor: parseColorCode(renderer.startBackgroundColor)!,
    endBackgroundColor: parseColorCode(renderer.endBackgroundColor),
  };
}
