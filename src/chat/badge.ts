import { debugLog } from "../utils";
import {
  YTAuthorBadge,
  YTLiveChatTextMessageRenderer,
} from "../interfaces/yt/chat";
import { Membership } from "../interfaces/misc";

export function parseMembership(badge: YTAuthorBadge): Membership | undefined {
  const renderer = badge.liveChatAuthorBadgeRenderer;
  if (!renderer.customThumbnail) return;

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

export function parseBadges(renderer: YTLiveChatTextMessageRenderer) {
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
