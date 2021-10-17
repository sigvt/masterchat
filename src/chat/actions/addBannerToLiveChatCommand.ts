import { AddBannerAction } from "../../interfaces/actions";
import { YTAddBannerToLiveChatCommand } from "../../interfaces/yt/chat";
import { debugLog, stringify, tsToDate } from "../../utils";
import { parseBadges } from "../badge";
import { pickThumbUrl } from "../utils";

export function parseAddBannerToLiveChatCommand(
  payload: YTAddBannerToLiveChatCommand
) {
  // add pinned item
  const bannerRdr = payload["bannerRenderer"]["liveChatBannerRenderer"];

  if (bannerRdr.header.liveChatBannerHeaderRenderer.icon.iconType !== "KEEP") {
    debugLog(
      "[action required] unknown icon type (addBannerToLiveChatCommand)",
      JSON.stringify(bannerRdr.header.liveChatBannerHeaderRenderer.icon)
    );
  }

  const title = bannerRdr.header.liveChatBannerHeaderRenderer.text.runs;
  const message = bannerRdr.contents.liveChatTextMessageRenderer.message.runs;
  const liveChatRdr = bannerRdr.contents.liveChatTextMessageRenderer;
  const timestampUsec = liveChatRdr.timestampUsec;
  const timestamp = tsToDate(timestampUsec);

  const authorName = stringify(liveChatRdr.authorName);
  const authorPhoto = pickThumbUrl(liveChatRdr.authorPhoto);
  const authorChannelId = liveChatRdr.authorExternalChannelId;
  const { isVerified, isOwner, isModerator, membership } =
    parseBadges(liveChatRdr);

  if (!authorName) {
    debugLog(
      "[action required] empty authorName at addBannerToLiveChatCommand",
      JSON.stringify(liveChatRdr)
    );
  }

  const parsed: AddBannerAction = {
    type: "addBannerAction",
    id: bannerRdr.actionId,
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
      liveChatRdr.contextMenuEndpoint?.liveChatItemContextMenuEndpoint.params,
  };
  return parsed;
}
