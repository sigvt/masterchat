import {
  YTCloseLiveChatActionPanelAction,
  YTLiveChatActionPanelRenderer,
  YTLiveChatPaidStickerRenderer,
  YTLiveChatPlaceholderItemRenderer,
  YTLiveChatPollRenderer,
  YTLiveChatTickerPaidMessageItemRenderer,
  YTLiveChatTickerPaidStickerItemRenderer,
  YTLiveChatTickerSponsorItemRenderer,
  YTRemoveBannerForLiveChatCommand,
  YTReplaceChatItemAction,
  YTRun,
  YTText,
  YTTooltipRenderer,
} from "../../yt/chat";

export interface FetchChatOptions {
  /** fetch top chat instead of all chat */
  topChat?: boolean;
}

export interface IterateChatOptions extends FetchChatOptions {
  /**
   * ignore first response fetched by reload token
   * set it to false which means you might get chats already processed before when recovering MasterchatAgent from error. Make sure you have unique index for chat id to prevent duplication.
   * @default false
   * */
  ignoreFirstResponse?: boolean;

  /** pass previously fetched token to resume chat fetching */
  continuation?: string;
}

export const SUPERCHAT_SIGNIFICANCE_MAP = {
  blue: 1,
  lightblue: 2,
  green: 3,
  yellow: 4,
  orange: 5,
  magenta: 6,
  red: 7,
} as const;

/**
 * Map from headerBackgroundColor to color name
 */
export const SUPERCHAT_COLOR_MAP = {
  "4279592384": "blue",
  "4278237396": "lightblue",
  "4278239141": "green",
  "4294947584": "yellow",
  "4293284096": "orange",
  "4290910299": "magenta",
  "4291821568": "red",
} as const;

/**
 * Components
 */

export type OmitTrackingParams<T> = Omit<
  T,
  "clickTrackingParams" | "trackingParams"
>;

export interface Membership {
  status: string;
  since?: string;
  thumbnail: string;
}

/**
 * 0 - 255
 */
export interface Color {
  r: number;
  g: number;
  b: number;
  opacity: number;
}

export type SuperChatSignificance =
  typeof SUPERCHAT_SIGNIFICANCE_MAP[keyof typeof SUPERCHAT_SIGNIFICANCE_MAP];

export type SuperChatColor =
  typeof SUPERCHAT_COLOR_MAP[keyof typeof SUPERCHAT_COLOR_MAP];

export interface SuperChat {
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
}

/**
 * Continuation
 */

export interface ReloadContinuation {
  token: string;
}

export interface TimedContinuation extends ReloadContinuation {
  timeoutMs: number;
}

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
  | ShowLiveChatActionPanelAction
  | CloseLiveChatActionPanelAction
  | UpdateLiveChatPollAction
  | ShowTooltipAction
  | ModeChangeAction;

export interface AddChatItemAction {
  type: "addChatItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;
  rawMessage: YTRun[];
  authorName: string;
  authorChannelId: string;
  authorPhoto: string;
  membership?: Membership;
  isOwner: boolean;
  isModerator: boolean;
  isVerified: boolean;
  contextMenuEndpointParams: string;
}

export interface AddSuperChatItemAction {
  type: "addSuperChatItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;
  rawMessage: YTRun[] | undefined;
  authorName: string;
  authorChannelId: string;
  authorPhoto: string;
  superchat: SuperChat;
}

export interface AddSuperStickerItemAction
  extends YTLiveChatPaidStickerRenderer {
  type: "addSuperStickerItemAction";
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

export interface AddPlaceholderItemAction
  extends YTLiveChatPlaceholderItemRenderer {
  type: "addPlaceholderItemAction";
}

export interface ReplaceChatItemAction extends YTReplaceChatItemAction {
  type: "replaceChatItemAction";
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
  amountText: string;
  authorChannelId: string;
  authorName: string;
  authorPhoto: string;
  durationSec: number;
  fullDurationSec: number;
  superchat: SuperChat;
  amountTextColor: Color;
  startBackgroundColor: Color;
  endBackgroundColor: Color;
}

export interface AddSuperStickerTickerAction
  extends OmitTrackingParams<YTLiveChatTickerPaidStickerItemRenderer> {
  type: "addSuperStickerTickerAction";
}

export interface AddMembershipTickerAction
  extends OmitTrackingParams<YTLiveChatTickerSponsorItemRenderer> {
  type: "addMembershipTickerAction";
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

export interface RemoveBannerAction extends YTRemoveBannerForLiveChatCommand {
  type: "removeBannerAction";
}

export interface ShowTooltipAction extends YTTooltipRenderer {
  type: "showTooltipAction";
}

export interface AddViewerEngagementMessageAction {
  type: "addViewerEngagementMessageAction";
  id: string;
  messageType: "engagement" | "poll" | string;
  message: YTText;
  url: string;
  timestamp?: Date;
  timestampUsec?: string;
}

export interface ShowLiveChatActionPanelAction
  extends YTLiveChatActionPanelRenderer {
  type: "showLiveChatActionPanelAction";
}

export interface CloseLiveChatActionPanelAction
  extends YTCloseLiveChatActionPanelAction {
  type: "closeLiveChatActionPanelAction";
}

export interface UpdateLiveChatPollAction extends YTLiveChatPollRenderer {
  type: "updateLiveChatPollAction";
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

/**
 * Response
 */

export interface ChatResponse {
  actions: Action[];
  continuation: TimedContinuation | undefined;
  error: null;
}
