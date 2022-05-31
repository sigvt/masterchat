import {
  AddBannerAction,
  AddRedirectBannerAction,
} from "../../interfaces/actions";
import { YTAddBannerToLiveChatCommand } from "../../interfaces/yt/chat";
import { debugLog, stringify, tsToDate } from "../../utils";
import { parseBadges } from "../badge";
import { pickThumbUrl } from "../utils";

export function parseAddBannerToLiveChatCommand(
  payload: YTAddBannerToLiveChatCommand
) {
  // add pinned item
  const bannerRdr = payload["bannerRenderer"]["liveChatBannerRenderer"];

  if (
    bannerRdr.header &&
    bannerRdr.header.liveChatBannerHeaderRenderer.icon.iconType !== "KEEP"
  ) {
    debugLog(
      "[action required] Unknown icon type (addBannerToLiveChatCommand)",
      JSON.stringify(bannerRdr.header)
    );
  }

  // banner
  const actionId = bannerRdr.actionId;
  const targetId = bannerRdr.targetId;
  const viewerIsCreator = bannerRdr.viewerIsCreator;

  // contents
  const contents = bannerRdr.contents;

  if ("liveChatTextMessageRenderer" in contents) {
    const rdr = contents.liveChatTextMessageRenderer;
    const id = rdr.id;
    const message = rdr.message.runs;
    const timestampUsec = rdr.timestampUsec;
    const timestamp = tsToDate(timestampUsec);
    const authorName = stringify(rdr.authorName);
    const authorPhoto = pickThumbUrl(rdr.authorPhoto);
    const authorChannelId = rdr.authorExternalChannelId;
    const { isVerified, isOwner, isModerator, membership } = parseBadges(rdr);

    // header
    const header = bannerRdr.header!.liveChatBannerHeaderRenderer;
    const title = header.text.runs;

    if (!authorName) {
      debugLog(
        "[action required] Empty authorName found at addBannerToLiveChatCommand",
        JSON.stringify(rdr)
      );
    }

    const parsed: AddBannerAction = {
      type: "addBannerAction",
      actionId,
      targetId,
      id,
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
      viewerIsCreator,
      contextMenuEndpointParams:
        rdr.contextMenuEndpoint?.liveChatItemContextMenuEndpoint.params,
    };
    return parsed;
  } else if ("liveChatBannerRedirectRenderer" in contents) {
    // TODO:
    const rdr = contents.liveChatBannerRedirectRenderer;
    const authorName = rdr.bannerMessage.runs[0].text;
    const authorPhoto = pickThumbUrl(rdr.authorPhoto);
    const payload: AddRedirectBannerAction = {
      type: "addRedirectBannerAction",
      actionId,
      targetId,
      authorName,
      authorPhoto,
    };
    return payload;
  } else {
    throw new Error(
      `[action required] Unrecognized content type found in parseAddBannerToLiveChatCommand: ${JSON.stringify(
        payload
      )}`
    );
  }
}
