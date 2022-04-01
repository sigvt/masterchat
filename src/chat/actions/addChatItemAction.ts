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
  AddPollResultAction,
  MembershipGiftPurchaseAction,
  MembershipGiftRedemptionAction,
  MembershipGiftPurchaseTickerContent,
} from "../../interfaces/actions";
import {
  YTAddChatItemAction,
  YTLiveChatMembershipItemRenderer,
  YTLiveChatModeChangeMessageRenderer,
  YTLiveChatPaidMessageRenderer,
  YTLiveChatPaidStickerRenderer,
  YTLiveChatPlaceholderItemRenderer,
  YTLiveChatSponsorshipsGiftPurchaseAnnouncementRenderer,
  YTLiveChatSponsorshipsGiftRedemptionAnnouncementRenderer,
  YTLiveChatTextMessageRenderer,
  YTLiveChatViewerEngagementMessageRenderer,
  YTRun,
  YTRunContainer,
  YTTextRun,
} from "../../interfaces/yt/chat";
import {
  debugLog,
  durationToSeconds,
  splitRunsByNewLines,
  stringify,
  tsToDate,
} from "../../utils";
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
  } else if ("liveChatSponsorshipsGiftPurchaseAnnouncementRenderer" in item) {
    // Sponsorships gift purchase announcement
    const renderer =
      item["liveChatSponsorshipsGiftPurchaseAnnouncementRenderer"];
    return parseLiveChatSponsorshipsGiftPurchaseAnnouncementRenderer(
      renderer
    ) as MembershipGiftPurchaseAction;
  } else if ("liveChatSponsorshipsGiftRedemptionAnnouncementRenderer" in item) {
    // Sponsorships gift purchase announcement
    const renderer =
      item["liveChatSponsorshipsGiftRedemptionAnnouncementRenderer"];
    return parseLiveChatSponsorshipsGiftRedemptionAnnouncementRenderer(
      renderer
    );
  }

  debugLog(
    "[action required] Unrecognized chat item renderer type:",
    JSON.stringify(item)
  );
}

// Chat
export function parseLiveChatTextMessageRenderer(
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
      "[action required] non-simple authorName (live chat):",
      JSON.stringify(renderer.authorName)
    );
  }

  // message can somehow be a blank object (in quite rare occasion though)
  const message = renderer.message.runs as YTRun[] | undefined;

  const parsed: AddChatItemAction = {
    type: "addChatItemAction",
    id,
    timestamp,
    timestampUsec,
    authorName,
    authorChannelId,
    authorPhoto,
    message,
    membership,
    isVerified,
    isOwner,
    isModerator,
    contextMenuEndpointParams,
    rawMessage: message, // deprecated
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

  if (renderer.authorName && !("simpleText" in renderer.authorName)) {
    debugLog(
      "[action required] non-simple authorName (super chat):",
      JSON.stringify(renderer.authorName)
    );
  }

  const message = renderer.message?.runs ?? null;
  const superchat = parseSuperChat(renderer);

  const parsed: AddSuperChatItemAction = {
    type: "addSuperChatItemAction",
    id: renderer.id,
    timestamp,
    timestampUsec,
    authorName,
    authorChannelId,
    authorPhoto,
    message,
    ...superchat,
    superchat, // deprecated
    rawMessage: renderer.message?.runs, // deprecated
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

  if (!authorName) {
    debugLog(
      "[action required] empty authorName (super sticker)",
      JSON.stringify(rdr)
    );
  }

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
  const authorName = renderer.authorName
    ? stringify(renderer.authorName)
    : undefined;
  const authorChannelId = renderer.authorExternalChannelId;
  const authorPhoto = pickThumbUrl(renderer.authorPhoto);

  // observed, MODERATOR
  // observed, undefined renderer.authorBadges
  const membership = renderer.authorBadges
    ? parseMembership(renderer.authorBadges[renderer.authorBadges.length - 1])
    : undefined;
  if (!membership) {
    throw new Error(
      `Failed to parse membership (membership): ${JSON.stringify(renderer)}`
    );
  }

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
  } else {
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
}

// Engagement message
export function parseLiveChatViewerEngagementMessageRenderer(
  renderer: YTLiveChatViewerEngagementMessageRenderer
) {
  /**
   * YOUTUBE_ROUND: engagement message
   * POLL: poll result message
   */

  const {
    id,
    timestampUsec,
    icon: { iconType },
  } = renderer;
  if ("simpleText" in renderer.message) {
    debugLog(
      "[action required] message is simpleText (engagement):",
      JSON.stringify(renderer)
    );
  }

  switch (iconType) {
    case "YOUTUBE_ROUND": {
      const timestamp = tsToDate(timestampUsec!);
      const actionUrl =
        renderer.actionButton?.buttonRenderer.navigationEndpoint.urlEndpoint
          .url;
      const parsed: AddViewerEngagementMessageAction = {
        type: "addViewerEngagementMessageAction",
        id,
        message: renderer.message,
        actionUrl,
        timestamp,
        timestampUsec: timestampUsec!,
      };
      return parsed;
    }
    case "POLL": {
      // [{"id":"ChkKF1hTbnRZYzNTQk91R2k5WVA1cDJqd0FV","message":{"runs":[{"text":"生まれは？","bold":true},{"text":"\n"},{"text":"平成 (80%)"},{"text":"\n"},{"text":"昭和 (19%)"},{"text":"\n"},{"text":"\n"},{"text":"Poll complete: 84 votes"}]},"messageType":"poll","type":"addViewerEngagementMessageAction","originVideoId":"1SzuFU7t450","originChannelId":"UC3Z7UaEe_vMoKRz9ABQrI5g"}]
      //  <!> addViewerEngagementMessageAction [{"id":"ChkKF3VDX3RZWS1PQl95QWk5WVBrUGFENkFz","message":{"runs":[{"text":"2 (73%)"},{"text":"\n"},{"text":"4 (26%)"},{"text":"\n"},{"text":"\n"},{"text":"Poll complete: 637 votes"}]},"messageType":"poll","type":"addViewerEngagementMessageAction","originVideoId":"8sne4hKHNeo","originChannelId":"UC2hc-00y-MSR6eYA4eQ4tjQ"}]
      // Poll complete: 637 votes
      // Poll complete: 1.9K votes
      // split runs by {"text": "\n"}
      // has question: {text: "...", "bold": true}, {emoji: ...}
      //               {emoji: ...}, {text: "...", "bold": true}
      // otherwise:    {emoji: ...}, {text: " (\d%)"}

      const runs = (renderer.message as YTRunContainer<YTTextRun>).runs;
      const runsNL = splitRunsByNewLines(runs);
      const hasQuestion = runsNL[0].some(
        (run) => "bold" in run && run.bold == true
      );
      const question = hasQuestion ? runsNL[0] : undefined;
      const total = /: (.+?) vote/.exec(runs[runs.length - 1].text)![1];
      const choiceStart = hasQuestion ? 1 : 0;
      const choices = runsNL.slice(choiceStart, -2).map((choiceRuns) => {
        const last = choiceRuns[choiceRuns.length - 1] as YTTextRun;
        const [lastTextFragment, votePercentage] = /(?:^(.+?))? \((\d+%)\)$/
          .exec(last.text)!
          .slice(1);
        let text = choiceRuns;
        if (lastTextFragment) {
          (text[text.length - 1] as YTTextRun).text = lastTextFragment;
        } else {
          text.pop();
        }
        return { text, votePercentage };
      });

      const parsed: AddPollResultAction = {
        type: "addPollResultAction",
        id,
        question,
        total,
        choices,
      };
      return parsed;
    }
    default:
      debugLog(
        "[action required] unknown icon type (engagement message):",
        JSON.stringify(renderer)
      );
  }
}

// Placeholder chat
export function parseLiveChatPlaceholderItemRenderer(
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
export function parseLiveChatModeChangeMessageRenderer(
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

// Sponsorships gift purchase announcement
export function parseLiveChatSponsorshipsGiftPurchaseAnnouncementRenderer(
  renderer: YTLiveChatSponsorshipsGiftPurchaseAnnouncementRenderer
): MembershipGiftPurchaseAction | MembershipGiftPurchaseTickerContent {
  const id = renderer.id;
  /** timestampUsec can be undefined when passed from ticker action */
  const timestampUsec = renderer.timestampUsec;
  const timestamp = timestampUsec ? tsToDate(timestampUsec) : undefined;
  const authorChannelId = renderer.authorExternalChannelId;

  const header = renderer.header.liveChatSponsorshipsHeaderRenderer;
  const authorName = stringify(header.authorName);
  const authorPhoto = pickThumbUrl(header.authorPhoto);
  const channelName = header.primaryText.runs[3].text;
  const amount = parseInt(header.primaryText.runs[1].text, 10);
  const image = header.image.thumbnails[0].url;

  if (!authorName) {
    debugLog(
      "[action required] empty authorName (gift purchase)",
      JSON.stringify(renderer)
    );
  }

  const membership = parseMembership(
    header.authorBadges[header.authorBadges.length - 1]
  )!;

  if (!membership) {
    debugLog(
      "[action required] empty membership (gift purchase)",
      JSON.stringify(renderer)
    );
  }

  if (!timestampUsec || !timestamp) {
    const tickerContent: MembershipGiftPurchaseTickerContent = {
      id,
      channelName,
      amount,
      membership,
      authorName,
      authorChannelId,
      authorPhoto,
      image,
    };
    return tickerContent;
  }

  const parsed: MembershipGiftPurchaseAction = {
    type: "membershipGiftPurchaseAction",
    id,
    timestamp,
    timestampUsec,
    channelName,
    amount,
    membership,
    authorName,
    authorChannelId,
    authorPhoto,
    image,
  };
  return parsed;
}

// Sponsorships gift redemption announcement
export function parseLiveChatSponsorshipsGiftRedemptionAnnouncementRenderer(
  renderer: YTLiveChatSponsorshipsGiftRedemptionAnnouncementRenderer
) {
  const id = renderer.id;
  const timestampUsec = renderer.timestampUsec;
  const timestamp = tsToDate(timestampUsec);
  const authorChannelId = renderer.authorExternalChannelId;

  const authorName = stringify(renderer.authorName);
  const authorPhoto = pickThumbUrl(renderer.authorPhoto);
  const senderName = renderer.message.runs[1].text;

  if (!authorName) {
    debugLog(
      "[action required] empty authorName (gift redemption)",
      JSON.stringify(renderer)
    );
  }

  const parsed: MembershipGiftRedemptionAction = {
    type: "membershipGiftRedemptionAction",
    id,
    timestamp,
    timestampUsec,
    senderName,
    authorName,
    authorChannelId,
    authorPhoto,
  };
  return parsed;
}
