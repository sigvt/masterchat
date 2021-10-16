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
import {
  YTAddChatItemAction,
  YTLiveChatMembershipItemRenderer,
  YTLiveChatModeChangeMessageRenderer,
  YTLiveChatPaidMessageRenderer,
  YTLiveChatPaidStickerRenderer,
  YTLiveChatPlaceholderItemRenderer,
  YTLiveChatTextMessageRenderer,
  YTLiveChatViewerEngagementMessageRenderer,
  YTRunContainer,
  YTTextRun,
} from "../../interfaces/yt/chat";
import { debugLog, durationToSeconds, stringify, tsToDate } from "../../utils";
import { parseBadges, parseMembership } from "../badge";
import { parseAmountText, parseSuperChat } from "../superchat";
import { parseColorCode, pickThumbUrl } from "../utils";

export function parseAddChatItemAction(payload: YTAddChatItemAction) {
  const { item } = payload;

  if ("liveChatTextMessageRenderer" in item) {
    // Chat
    const renderer = item["liveChatTextMessageRenderer"]!;
    return parseLiveChatTextMessageRenderer(renderer);
  } else if ("liveChatPaidMessageRenderer" in item) {
    // Super Chat
    const renderer = item["liveChatPaidMessageRenderer"]!;
    return parseLiveChatPaidMessageRenderer(renderer);
  } else if ("liveChatPaidStickerRenderer" in item) {
    // Super Sticker
    const renderer = item["liveChatPaidStickerRenderer"]!;
    return parseLiveChatPaidStickerRenderer(renderer);
  } else if ("liveChatMembershipItemRenderer" in item) {
    // Membership updates
    const renderer = item["liveChatMembershipItemRenderer"]!;
    return parseLiveChatMembershipItemRenderer(renderer);
  } else if ("liveChatViewerEngagementMessageRenderer" in item) {
    // Engagement message
    const renderer = item["liveChatViewerEngagementMessageRenderer"]!;
    return parseLiveChatViewerEngagementMessageRenderer(renderer);
  } else if ("liveChatPlaceholderItemRenderer" in item) {
    // Placeholder chat
    const renderer = item["liveChatPlaceholderItemRenderer"]!;
    return parseLiveChatPlaceholderItemRenderer(renderer);
  } else if ("liveChatModeChangeMessageRenderer" in item) {
    // Mode change message (e.g. toggle members-only)
    const renderer = item["liveChatModeChangeMessageRenderer"]!;
    return parseLiveChatModeChangeMessageRenderer(renderer);
  }

  debugLog(
    "[action required] Unrecognized renderer type (addChatItemAction):",
    JSON.stringify(item)
  );
}

// Chat
function parseLiveChatTextMessageRenderer(
  renderer: YTLiveChatTextMessageRenderer
) {
  const {
    id,
    timestampUsec,
    authorExternalChannelId: authorChannelId,
  } = renderer;

  const timestamp = tsToDate(timestampUsec);

  const authorName = renderer.authorName
    ? stringify(renderer.authorName)
    : undefined;
  const authorPhoto =
    renderer.authorPhoto.thumbnails[renderer.authorPhoto.thumbnails.length - 1]
      .url;

  const { isVerified, isOwner, isModerator, membership } =
    parseBadges(renderer);

  const contextMenuEndpointParams =
    renderer.contextMenuEndpoint!.liveChatItemContextMenuEndpoint.params;

  if (renderer.authorName && !("simpleText" in renderer.authorName)) {
    debugLog(
      "[action required] non-simple authorName:",
      JSON.stringify(renderer.authorName)
    );
  }

  const parsed: AddChatItemAction = {
    type: "addChatItemAction",
    id,
    timestamp,
    timestampUsec,
    authorName,
    authorChannelId,
    authorPhoto,
    message: renderer.message.runs,
    membership,
    isVerified,
    isOwner,
    isModerator,
    contextMenuEndpointParams,
    rawMessage: renderer.message.runs, // deprecated
  };

  return parsed;
}

// Super Chat
export function parseLiveChatPaidMessageRenderer(
  renderer: YTLiveChatPaidMessageRenderer
) {
  const { timestampUsec, authorExternalChannelId: authorChannelId } = renderer;

  const timestamp = tsToDate(timestampUsec);

  const authorName = stringify(renderer.authorName);
  const authorPhoto = pickThumbUrl(renderer.authorPhoto);

  if (!authorName) {
    debugLog(
      "[action required] empty authorName at liveChatPaidMessageRenderer",
      JSON.stringify(renderer)
    );
  }

  const superchat = parseSuperChat(renderer);

  const parsed: AddSuperChatItemAction = {
    type: "addSuperChatItemAction",
    id: renderer.id,
    timestamp,
    timestampUsec,
    authorName,
    authorChannelId,
    authorPhoto,
    message: renderer.message?.runs ?? null,
    ...superchat,
    rawMessage: renderer.message?.runs, // deprecated
    superchat, // deprecated
  };
  return parsed;
}

// Super Sticker
export function parseLiveChatPaidStickerRenderer(
  rdr: YTLiveChatPaidStickerRenderer
): AddSuperStickerItemAction {
  const { timestampUsec, authorExternalChannelId: authorChannelId } = rdr;

  const timestamp = tsToDate(timestampUsec);

  const authorName = stringify(rdr.authorName);
  const authorPhoto = pickThumbUrl(rdr.authorPhoto);

  const stickerUrl = "https:" + pickThumbUrl(rdr.sticker);
  const stickerText = rdr.sticker.accessibility!.accessibilityData.label;
  const { amount, currency } = parseAmountText(
    rdr.purchaseAmountText.simpleText
  );

  const parsed: AddSuperStickerItemAction = {
    type: "addSuperStickerItemAction",
    id: rdr.id,
    timestamp,
    timestampUsec,
    authorName,
    authorChannelId,
    authorPhoto,
    stickerUrl,
    stickerText,
    amount,
    currency,
    stickerDisplayWidth: rdr.stickerDisplayWidth,
    stickerDisplayHeight: rdr.stickerDisplayHeight,
    moneyChipBackgroundColor: parseColorCode(rdr.moneyChipBackgroundColor),
    moneyChipTextColor: parseColorCode(rdr.moneyChipTextColor),
    backgroundColor: parseColorCode(rdr.backgroundColor),
    authorNameTextColor: parseColorCode(rdr.authorNameTextColor),
  };

  return parsed;
}

// Membership
export function parseLiveChatMembershipItemRenderer(
  renderer: YTLiveChatMembershipItemRenderer
) {
  const id = renderer.id;
  const timestampUsec = renderer.timestampUsec;
  const timestamp = tsToDate(timestampUsec);
  const authorName = stringify(renderer.authorName);
  const authorChannelId = renderer.authorExternalChannelId;
  const authorPhoto = pickThumbUrl(renderer.authorPhoto);

  if (!authorName) {
    debugLog(
      "[action required] empty authorName at liveChatMembershipItemRenderer",
      JSON.stringify(renderer)
    );
  }

  // observed, MODERATOR
  const membership = parseMembership(
    renderer.authorBadges[renderer.authorBadges.length - 1]
  );
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
      id,
      timestamp,
      timestampUsec,
      authorName,
      authorChannelId,
      authorPhoto,
      membership,
      level,
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
    id,
    timestamp,
    timestampUsec,
    authorName,
    authorChannelId,
    authorPhoto,
    membership,
    level,
  };
  return parsed;
}

// Engagement message
function parseLiveChatViewerEngagementMessageRenderer(
  renderer: YTLiveChatViewerEngagementMessageRenderer
) {
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
      break;
    default:
      debugLog(
        "[action required] unknown icon type (EngagementMessage):",
        JSON.stringify(renderer)
      );
  }

  const id = renderer.id;
  const timestampUsec = renderer.timestampUsec;
  const timestamp = timestampUsec ? tsToDate(timestampUsec) : undefined;
  const message = renderer.message;
  const actionUrl =
    renderer.actionButton?.buttonRenderer.navigationEndpoint.urlEndpoint.url;

  const parsed: AddViewerEngagementMessageAction = {
    type: "addViewerEngagementMessageAction",
    id,
    messageType,
    message,
    actionUrl,
    timestamp,
    timestampUsec,
  };
  return parsed;
}

// Placeholder chat
function parseLiveChatPlaceholderItemRenderer(
  renderer: YTLiveChatPlaceholderItemRenderer
) {
  const id = renderer.id;
  const timestampUsec = renderer.timestampUsec;
  const timestamp = tsToDate(timestampUsec);

  const parsed: AddPlaceholderItemAction = {
    type: "addPlaceholderItemAction",
    id,
    timestamp,
    timestampUsec,
  };
  return parsed;
}

// Mode change message
function parseLiveChatModeChangeMessageRenderer(
  renderer: YTLiveChatModeChangeMessageRenderer
) {
  const text = stringify(renderer.text);
  const description = stringify(renderer.subtext);

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
    description,
  };
  return parsed;
}
