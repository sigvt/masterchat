import { OmitTrackingParams } from "../utils";
import {
  Color,
  Membership,
  SuperChat,
  SuperChatColor,
  SuperChatSignificance,
} from "./misc";
import {
  YTLiveChatPaidMessageRendererContainer,
  YTLiveChatPlaceholderItemRendererContainer,
  YTLiveChatPollChoice,
  YTLiveChatPollRenderer,
  YTLiveChatPollType,
  YTLiveChatTextMessageRendererContainer,
  YTLiveChatTickerPaidStickerItemRenderer,
  YTLiveChatTickerSponsorItemRenderer,
  YTRemoveBannerForLiveChatCommand,
  YTRun,
  YTText,
  YTTooltipRenderer,
  YTType,
} from "./yt/chat";

/**
 * Actions
 */

export type Action =
  | AddChatItemAction
  | AddSuperChatItemAction
  | AddSuperStickerItemAction
  | AddMembershipItemAction
  | AddMembershipMilestoneItemAction
  | AddPlaceholderItemAction
  | ReplaceChatItemAction
  | MarkChatItemAsDeletedAction
  | MarkChatItemsByAuthorAsDeletedAction
  | AddSuperChatTickerAction
  | AddSuperStickerTickerAction
  | AddMembershipTickerAction
  | AddBannerAction
  | RemoveBannerAction
  | AddViewerEngagementMessageAction
  | ShowPanelAction
  | ShowPollPanelAction
  | ClosePanelAction
  | UpdatePollAction
  | ShowTooltipAction
  | ModeChangeAction;

export interface AddChatItemAction {
  type: "addChatItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;
  message: YTRun[];
  authorName?: string;
  authorChannelId: string;
  authorPhoto: string;
  membership?: Membership;
  isOwner: boolean;
  isModerator: boolean;
  isVerified: boolean;
  contextMenuEndpointParams: string;

  /** @deprecated use `message` */
  rawMessage: YTRun[];
}

export interface AddSuperChatItemAction {
  type: "addSuperChatItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;
  authorName: string;
  authorChannelId: string;
  authorPhoto: string;
  message: YTRun[] | null;
  amount: number;
  currency: string;
  color: SuperChatColor;
  significance: SuperChatSignificance;
  authorNameTextColor: Color;
  timestampColor: Color;
  headerBackgroundColor: Color;
  headerTextColor: Color;
  bodyBackgroundColor: Color;
  bodyTextColor: Color;

  /** @deprecated use `message` */
  rawMessage: YTRun[] | undefined;

  /** @deprecated flattened */
  superchat: SuperChat;
}

export interface AddSuperStickerItemAction {
  type: "addSuperStickerItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;
  authorName: string;
  authorChannelId: string;
  authorPhoto: string;
  stickerUrl: string;
  stickerText: string;
  amount: number;
  currency: string;
  stickerDisplayWidth: number;
  stickerDisplayHeight: number;
  moneyChipBackgroundColor: Color;
  moneyChipTextColor: Color;
  backgroundColor: Color;
  authorNameTextColor: Color;
}

export interface AddMembershipItemAction {
  type: "addMembershipItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;

  // `level` is only shown when there's multiple levels available
  level?: string;

  membership: Membership;
  authorName: string;
  authorChannelId: string;
  authorPhoto: string;
}

export interface AddMembershipMilestoneItemAction {
  type: "addMembershipMilestoneItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;

  // `level` is only shown when there's multiple levels available
  level?: string;

  membership: Membership;
  authorName: string;
  authorChannelId: string;
  authorPhoto: string;

  /**
   * Membership duration in seconds
   */
  duration: number;

  /**
   * Human readable membership duration
   */
  durationText: string;

  /**
   * Milestone message
   */
  message: YTRun[] | null;
}

export interface AddPlaceholderItemAction {
  type: "addPlaceholderItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;
}

export interface ReplaceChatItemAction {
  type: "replaceChatItemAction";
  targetItemId: string;
  replacementItem:
    | YTLiveChatPlaceholderItemRendererContainer
    | YTLiveChatTextMessageRendererContainer
    | YTLiveChatPaidMessageRendererContainer; // TODO: check if YTLiveChatPaidMessageRendererContainer will appear
}

export interface MarkChatItemAsDeletedAction {
  type: "markChatItemAsDeletedAction";
  retracted: boolean;
  targetId: string;
  timestamp: Date;
}

export interface MarkChatItemsByAuthorAsDeletedAction {
  type: "markChatItemsByAuthorAsDeletedAction";
  channelId: string;
  timestamp: Date;
}

export interface AddSuperChatTickerAction {
  type: "addSuperChatTickerAction";
  id: string;
  authorChannelId: string;
  authorPhoto: string;
  amountText: string;
  durationSec: number;
  fullDurationSec: number;
  contents: AddSuperChatItemAction;
  amountTextColor: Color;
  startBackgroundColor: Color;
  endBackgroundColor: Color;
}

export interface AddSuperStickerTickerAction {
  type: "addSuperStickerTickerAction";
  id: string;
  authorName: string;
  authorChannelId: string;
  authorPhoto: string;
  durationSec: number;
  fullDurationSec: number;
  tickerPackName: string;
  tickerPackThumbnail: string;
  contents: AddSuperStickerItemAction;
  startBackgroundColor: Color;
  endBackgroundColor: Color;
}

export interface AddMembershipTickerAction {
  type: "addMembershipTickerAction";
  id: string;
  authorChannelId: string;
  authorPhoto: string;
  durationSec: number;
  fullDurationSec: number;
  detailText: YTText;
  contents: AddMembershipItemAction | AddMembershipMilestoneItemAction; // TODO: check if AddMembershipMilestoneItemAction is available
  detailTextColor: Color;
  startBackgroundColor: Color;
  endBackgroundColor: Color;
}

export interface AddBannerAction {
  type: "addBannerAction";
  id: string;
  title: YTRun[];
  message: YTRun[];
  timestamp: Date;
  timestampUsec: string;
  authorName: string;
  authorChannelId: string;
  authorPhoto: string;
  membership?: Membership;
  isOwner: boolean;
  isModerator: boolean;
  isVerified: boolean;
  contextMenuEndpointParams?: string;
}

export interface RemoveBannerAction {
  type: "removeBannerAction";
  targetActionId: string;
}

export interface ShowTooltipAction {
  type: "showTooltipAction";
  targetId: string;
  detailsText: YTText;
  suggestedPosition: string;
  dismissStrategy: string;
  promoConfig: any;
  dwellTimeMs?: number;
}

export interface AddViewerEngagementMessageAction {
  type: "addViewerEngagementMessageAction";
  id: string;
  messageType: "engagement" | "poll" | string;
  message: YTText;
  actionUrl?: string;
  timestamp?: Date;
  timestampUsec?: string;
}

// generic action for unknown panel type
export interface ShowPanelAction {
  type: "showPanelAction";
  panelToShow: any;
}

export interface ClosePanelAction {
  type: "closePanelAction";
  targetPanelId: string;
  skipOnDismissCommand: boolean;
}

export interface ShowPollPanelAction {
  type: "showPollPanelAction";
  targetId: string;
  id: string;
  pollType: YTLiveChatPollType;
  question?: string;
  choices: YTLiveChatPollChoice[];
  authorName: string;
  authorPhoto: string;
}

export interface UpdatePollAction {
  type: "updatePollAction";
  id: string;
  pollType: YTLiveChatPollType;
  authorName: string;
  authorPhoto: string;
  question?: string;
  choices: YTLiveChatPollChoice[];
  elapsedText: string;
  voteCount: number;
}

export enum LiveChatMode {
  MembersOnly = "MEMBERS_ONLY",
  Slow = "SLOW",
  SubscribersOnly = "SUBSCRIBERS_ONLY",
  Unknown = "UNKNOWN",
}

export interface ModeChangeAction {
  type: "modeChangeAction";
  mode: LiveChatMode;
  enabled: boolean;
  description: string;
}

export interface UnknownAction {
  type: "unknown";
  payload: unknown;
}
