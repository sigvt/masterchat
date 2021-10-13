import { debugLog, durationToSeconds, stringify, tsToDate } from "../../utils";
import {
  YTAddChatItemAction,
  YTRunContainer,
  YTTextRun,
} from "../../interfaces/yt/chat";
import {
  AddChatItemAction,
  AddMembershipItemAction,
  AddMembershipMilestoneItemAction,
  AddPlaceholderItemAction,
  AddSuperChatItemAction,
  AddSuperStickerItemAction,
  AddViewerEngagementMessageAction,
  LiveChatMode,
  ModeChangeAction,
} from "../../interfaces/actions";
import { parseBadges, parseMembership } from "../badge";
import { parseSuperChat } from "../superchat";
import { pickThumbUrl } from "../utils";

export function parseAddChatItemAction(payload: YTAddChatItemAction) {
  const { item } = payload;

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

    const parsed: AddChatItemAction = {
      type: "addChatItemAction",
      id,
      timestamp,
      timestampUsec,
      rawMessage: renderer.message.runs,
      authorName: stringify(renderer.authorName),
      authorPhoto,
      authorChannelId,
      membership,
      isVerified,
      isOwner,
      isModerator,
      contextMenuEndpointParams,
    };

    return parsed;
  } else if ("liveChatPaidMessageRenderer" in item) {
    // Super Chat
    const renderer = item["liveChatPaidMessageRenderer"]!;
    const { timestampUsec, authorExternalChannelId: authorChannelId } =
      renderer;

    const timestamp = tsToDate(timestampUsec);

    const authorPhoto = pickThumbUrl(renderer.authorPhoto);

    const parsed: AddSuperChatItemAction = {
      type: "addSuperChatItemAction",
      id: renderer.id,
      timestamp,
      timestampUsec,
      rawMessage: renderer.message?.runs,
      authorName: stringify(renderer.authorName),
      authorPhoto,
      authorChannelId,
      superchat: parseSuperChat(renderer),
    };

    return parsed;
  } else if ("liveChatPaidStickerRenderer" in item) {
    // TODO: normalize payload
    // Super Sticker
    const renderer = item["liveChatPaidStickerRenderer"]!;
    const parsed: AddSuperStickerItemAction = {
      type: "addSuperStickerItemAction",
      ...renderer,
    };
    return parsed;
  } else if ("liveChatMembershipItemRenderer" in item) {
    // Membership updates
    const renderer = item["liveChatMembershipItemRenderer"]!;

    const timestampUsec = renderer.timestampUsec;
    const timestamp = tsToDate(timestampUsec);
    const authorName = stringify(renderer.authorName);
    const authorPhoto = pickThumbUrl(renderer.authorPhoto);
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
      // duration > membership.since
      // e.g. 12 months > 6 months
      const duration = durationToSeconds(durationText);

      const level = renderer.headerSubtext
        ? stringify(renderer.headerSubtext)
        : undefined;

      const parsed: AddMembershipMilestoneItemAction = {
        type: "addMembershipMilestoneItemAction",
        id: renderer.id,
        timestampUsec,
        timestamp,
        level,
        membership,
        authorName,
        authorPhoto,
        message,
        duration,
        durationText,
      };
      return parsed;
    }

    /**
     * no level -> ["New Member"]
     * multiple levels -> ["Welcome", "<level>", "!"]
     */
    const subRuns = (renderer.headerSubtext as YTRunContainer<YTTextRun>).runs;
    const level = subRuns.length > 1 ? subRuns[1].text : undefined;

    const parsed: AddMembershipItemAction = {
      type: "addMembershipItemAction",
      id: renderer.id,
      timestampUsec,
      timestamp,
      level,
      membership,
      authorName,
      authorPhoto,
    };
    return parsed;
  } else if ("liveChatPlaceholderItemRenderer" in item) {
    // TODO: normalize payload
    // Placeholder chat
    const renderer = item["liveChatPlaceholderItemRenderer"]!;
    const parsed: AddPlaceholderItemAction = {
      type: "addPlaceholderItemAction",
      ...renderer,
    };
    return parsed;
  } else if ("liveChatViewerEngagementMessageRenderer" in item) {
    // Engagement message
    const renderer = item["liveChatViewerEngagementMessageRenderer"]!;

    /**
     * YOUTUBE_ROUND: engagement message
     * POLL: poll result message
     */
    const { iconType } = renderer.icon;

    let messageType = iconType;
    switch (iconType) {
      case "YOUTUBE_ROUND":
        messageType = "engagement";
        break;
      case "POLL":
        messageType = "poll";
        debugLog(
          "[action required] poll (EngagementMessage):",
          JSON.stringify(renderer)
        );
        break;
      default:
        debugLog(
          "[action required] unknown icon type (EngagementMessage):",
          JSON.stringify(renderer)
        );
    }

    const timestampUsec = renderer.timestampUsec;
    const timestamp = timestampUsec ? tsToDate(timestampUsec) : undefined;
    const actionUrl =
      renderer.actionButton?.buttonRenderer.navigationEndpoint.urlEndpoint.url;

    const parsed: AddViewerEngagementMessageAction = {
      type: "addViewerEngagementMessageAction",
      id: renderer.id,
      messageType,
      message: renderer.message,
      actionUrl,
      timestamp,
      timestampUsec,
    };
    return parsed;
  } else if ("liveChatModeChangeMessageRenderer" in item) {
    // Mode change message (e.g. toggle members-only)
    const renderer = item["liveChatModeChangeMessageRenderer"]!;
    const text = stringify(renderer.text);
    const subtext = stringify(renderer.subtext);

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

    const parsed: ModeChangeAction = {
      type: "modeChangeAction",
      mode,
      enabled,
      description: subtext,
    };
    return parsed;
  }

  debugLog(
    "[action required] Unrecognized renderer type (addChatItemAction):",
    JSON.stringify(item)
  );
}
