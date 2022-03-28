import {
  YTAccessibilityLabel,
  YTAccessibilityData,
  YTReloadContinuation,
  YTResponseContext,
  YTBrowseEndpointContainer,
} from "./context";

// --------------------
// YT Interface
// --------------------

export type YTText = YTSimpleTextContainer | YTRunContainer;

export interface YTSimpleTextContainer {
  simpleText: string;
  accessibility?: YTAccessibilityData;
}

export interface YTRunContainer<T = YTRun> {
  runs: T[];
}

export type YTRun = YTTextRun | YTEmojiRun;

export interface YTTextRun {
  text: string;
  bold?: boolean;
  italics?: boolean;
  navigationEndpoint?:
    | YTUrlEndpointContainer
    | YTBrowseEndpointContainer
    | YTWatchEndpointContainer;
}

export interface YTEmojiRun {
  emoji: YTEmoji;
}

export interface YTEmoji {
  emojiId: string;
  shortcuts: string[];
  searchTerms: string[];
  image: YTThumbnailList; // with accessibility
  isCustomEmoji?: boolean;
}

export interface YTUrlEndpointContainer {
  urlEndpoint: YTUrlEndpoint;
  commandMetadata: YTWebPageMetadataContainer;
  clickTrackingParams?: string;
}

export interface YTUrlEndpoint {
  url: string;
  target: YTTarget | string;
  nofollow?: boolean;
}

export enum YTTarget {
  NewWindow = "TARGET_NEW_WINDOW",
}

// Errors

export interface YTChatError {
  code: number;
  message: string;
  errors: YTChatErrorDetail[];
  status: YTChatErrorStatus;
}

export enum YTChatErrorStatus {
  Unavailable = "UNAVAILABLE",
  PermissionDenied = "PERMISSION_DENIED",
  Internal = "INTERNAL",
  Invalid = "INVALID_ARGUMENT",
  NotFound = "NOT_FOUND",
  Unauthenticated = "UNAUTHENTICATED",
}

export interface YTChatErrorDetail {
  message: string;
  domain: "global";
  reason: "forbidden" | "backendError" | "badRequest" | "notFound";
}

// Responses

export interface YTChatResponse {
  responseContext: YTResponseContext;
  continuationContents?: YTContinuationContents;
  error?: YTChatError;
  trackingParams: string;
}

export interface YTGetItemContextMenuResponse {
  responseContext: YTResponseContext;
  liveChatItemContextMenuSupportedRenderers?: YTLiveChatItemContextMenuSupportedRenderers;
  error?: YTChatError;
}

// TODO: complete it
// moderate, pin, manage_user
export interface YTActionResponse {
  responseContext: YTResponseContext;
  success: boolean;
  actions: YTAction[];
}

// Interfaces

export interface YTContinuationContents {
  liveChatContinuation: YTLiveChatContinuation;
}

export interface YTLiveChatContinuation {
  continuations: YTContinuationElement[];
  actions?: YTAction[];
  actionPanel?: YTActionPanel;
  itemList?: YTItemList;
  header?: YTLiveChatContinuationHeader;
  ticker?: YTTicker;
  trackingParams?: string;
  participantsList?: YTParticipantsList;
  popoutMessage?: YTPopoutMessage;
  clientMessages?: YTClientMessages;
}

export interface YTContinuationElement {
  timedContinuationData: YTTimedContinuationData;
}

export interface YTTimedContinuationData {
  timeoutMs: number;
  continuation: string;
  clickTrackingParams: string;
}

// Menu

export interface YTLiveChatItemContextMenuSupportedRenderers {
  menuRenderer: YTMenuRenderer;
}

export interface YTMenuRenderer {
  items: YTMenuRendererItem[];
  trackingParams: string;
  openImmediately: boolean;
}

export interface YTMenuRendererItem {
  menuServiceItemRenderer?: YTMenuServiceItemRenderer;
  menuNavigationItemRenderer?: YTMenuNavigationItemRenderer;
}

export interface YTMenuServiceItemRenderer {
  text: YTRunContainer<YTTextRun>;
  icon: YTIcon;
  trackingParams: string;
  isDisabled?: boolean;
  serviceEndpoint: YTLiveChatServiceEndpointContainer;
}

export interface YTMenuNavigationItemRenderer {
  text: YTRunContainer<YTTextRun>;
  icon: YTIcon;
  navigationEndpoint: YTLiveChatNavigationEndpointContainer;
}

export interface YTOverflowMenu {
  menuRenderer: YTMenuRenderer;
}

export interface YTCommandContainer<T> {
  clickTrackingParams: string;
  commandMetadata: T;
}

export type YTLiveChatServiceEndpointContainer =
  YTCommandContainer<YTApiEndpointMetadataContainer> & {
    liveChatActionEndpoint?: YTEndpointParamsContainer;
    moderateLiveChatEndpoint?: YTEndpointParamsContainer;
    getReportFormEndpoint?: YTEndpointParamsContainer;
  };

export interface YTLiveChatNavigationEndpointContainer
  extends YTCommandContainer<YTIgnoreCommandMetadata> {
  clickTrackingParams: string;
  showLiveChatParticipantsEndpoint?: YTSEndpoint;
  toggleLiveChatTimestampsEndpoint?: YTSEndpoint;
  popoutLiveChatEndpoint?: YTThumbnailWithoutSize;
  feedbackEndpoint?: YTFeedbackEndpoint;
  confirmDialogEndpoint?: YTConfirmDialogEndpoint;
}

export interface YTConfirmDialogEndpoint {
  content: {
    confirmDialogRenderer: YTConfirmDialogRenderer;
  };
}

export interface YTConfirmDialogRenderer {
  title: YTRunContainer;
  trackingParams: string;
  dialogMessages: YTRunContainer;
  confirmButton: YTServiceButtonRendererContainer<YTLiveChatServiceEndpointContainer>;
  cancelButton: YTButtonRenderer;
}

// Action and Commands

export interface YTReplayChatItemAction {
  actions: YTAction[];
}

export interface YTAction {
  clickTrackingParams: string;

  // Chat
  addChatItemAction?: YTAddChatItemAction;
  markChatItemsByAuthorAsDeletedAction?: YTMarkChatItemsByAuthorAsDeletedAction;
  markChatItemAsDeletedAction?: YTMarkChatItemAsDeletedAction;

  // Ticker
  addLiveChatTickerItemAction?: YTAddLiveChatTickerItemAction;

  // Banner
  addBannerToLiveChatCommand?: YTAddBannerToLiveChatCommand;
  removeBannerForLiveChatCommand?: YTRemoveBannerForLiveChatCommand;

  // Placeholder
  replaceChatItemAction: YTReplaceChatItemAction;

  showLiveChatTooltipCommand?: YTShowLiveChatTooltipCommand;

  // Poll related
  showLiveChatActionPanelAction?: YTShowLiveChatActionPanelAction;
  updateLiveChatPollAction?: YTUpdateLiveChatPollAction;
  closeLiveChatActionPanelAction?: YTCloseLiveChatActionPanelAction;
}

export interface YTAddChatItemAction {
  item: YTAddChatItemActionItem;
  clientId?: string;
}

export type YTAddChatItemActionItem =
  | YTLiveChatTextMessageRendererContainer
  | YTLiveChatPaidMessageRendererContainer
  | YTLiveChatPaidStickerRendererContainer
  | YTLiveChatMembershipItemRendererContainer
  | YTLiveChatPlaceholderItemRendererContainer
  | YTLiveChatViewerEngagementMessageRendererContainer
  | YTLiveChatModeChangeMessageRendererContainer
  | YTLiveChatSponsorshipsGiftPurchaseAnnouncementRendererContainer
  | YTLiveChatSponsorshipsGiftRedemptionAnnouncementRendererContainer;

export interface YTAddLiveChatTickerItemAction {
  item: YTAddLiveChatTickerItem;
  durationSec: string;
}

export interface YTReplaceChatItemAction {
  targetItemId: string;
  replacementItem:
    | YTLiveChatPlaceholderItemRendererContainer
    | YTLiveChatTextMessageRendererContainer
    | YTLiveChatPaidMessageRendererContainer; // TODO: check if YTLiveChatPaidMessageRendererContainer will appear
}

export interface YTMarkChatItemAsDeletedAction {
  deletedStateMessage: YTRunContainer<YTTextRun>;
  targetItemId: string;
}

export interface YTMarkChatItemsByAuthorAsDeletedAction {
  deletedStateMessage: YTRunContainer<YTTextRun>;
  externalChannelId: string;
}

export interface YTAddBannerToLiveChatCommand {
  bannerRenderer: YTLiveChatBannerRendererContainer;
}

export interface YTRemoveBannerForLiveChatCommand {
  targetActionId: string;
}

export interface YTUpdateLiveChatPollAction {
  pollToUpdate: YTLiveChatPollRendererContainer;
}

export interface YTShowLiveChatActionPanelAction {
  panelToShow: YTLiveChatActionPanelRendererContainer;
}

export interface YTCloseLiveChatActionPanelAction {
  targetPanelId: string;
  skipOnDismissCommand: boolean;
}

// Containers

export interface YTLiveChatTextMessageRendererContainer {
  liveChatTextMessageRenderer: YTLiveChatTextMessageRenderer;
}

export interface YTLiveChatPaidMessageRendererContainer {
  liveChatPaidMessageRenderer: YTLiveChatPaidMessageRenderer;
}

export interface YTLiveChatPaidStickerRendererContainer {
  liveChatPaidStickerRenderer: YTLiveChatPaidStickerRenderer;
}

export interface YTLiveChatMembershipItemRendererContainer {
  liveChatMembershipItemRenderer: YTLiveChatMembershipItemRenderer;
}

export interface YTLiveChatPlaceholderItemRendererContainer {
  liveChatPlaceholderItemRenderer: YTLiveChatPlaceholderItemRenderer;
}

export interface YTLiveChatBannerRendererContainer {
  liveChatBannerRenderer: YTLiveChatBannerRenderer;
}

export interface YTLiveChatViewerEngagementMessageRendererContainer {
  liveChatViewerEngagementMessageRenderer: YTLiveChatViewerEngagementMessageRenderer;
}

export interface YTTooltipRendererContainer {
  tooltipRenderer: YTTooltipRenderer;
}

export interface YTLiveChatPollRendererContainer {
  pollRenderer: YTLiveChatPollRenderer;
}

export interface YTLiveChatModeChangeMessageRendererContainer {
  liveChatModeChangeMessageRenderer: YTLiveChatModeChangeMessageRenderer;
}

// Only appeared in YTShowLiveChatActionPanelAction
export interface YTLiveChatActionPanelRendererContainer {
  liveChatActionPanelRenderer: YTLiveChatActionPanelRenderer;
}

export interface YTLiveChatSponsorshipsGiftPurchaseAnnouncementRendererContainer {
  liveChatSponsorshipsGiftPurchaseAnnouncementRenderer: YTLiveChatSponsorshipsGiftPurchaseAnnouncementRenderer;
}

export interface YTLiveChatSponsorshipsGiftRedemptionAnnouncementRendererContainer {
  liveChatSponsorshipsGiftRedemptionAnnouncementRenderer: YTLiveChatSponsorshipsGiftRedemptionAnnouncementRenderer;
}

// LiveChat Renderers

export interface YTLiveChatTextMessageRenderer {
  id: string;
  timestampUsec: string;
  message: YTRunContainer;
  authorName: YTText;
  authorPhoto: YTThumbnailList;
  authorExternalChannelId: string;

  authorBadges?: YTAuthorBadge[];

  // unavailable in banners
  contextMenuEndpoint?: YTLiveChatItemContextMenuEndpointContainer;
  contextMenuAccessibility?: YTAccessibilityData;
}

export interface YTLiveChatPaidMessageRenderer {
  id: string;
  timestampUsec: string;
  message?: YTRunContainer;
  authorName: YTText;
  authorPhoto: YTThumbnailList;
  authorExternalChannelId: string;
  contextMenuEndpoint: YTLiveChatItemContextMenuEndpointContainer;
  contextMenuAccessibility: YTAccessibilityData;

  purchaseAmountText: YTSimpleTextContainer;
  timestampColor: number;
  authorNameTextColor: number;
  headerBackgroundColor: number;
  headerTextColor: number;
  bodyBackgroundColor: number;
  bodyTextColor: number;
  trackingParams: string;
}

export interface YTLiveChatPaidStickerRenderer {
  id: string;
  contextMenuEndpoint: YTLiveChatItemContextMenuEndpointContainer;
  contextMenuAccessibility: YTAccessibilityData;
  timestampUsec: string;
  authorPhoto: YTThumbnailList;
  authorName: YTText;
  authorExternalChannelId: string;
  sticker: YTThumbnailList; // with accessibility
  moneyChipBackgroundColor: number;
  moneyChipTextColor: number;
  purchaseAmountText: YTSimpleTextContainer;
  stickerDisplayWidth: number;
  stickerDisplayHeight: number;
  backgroundColor: number;
  authorNameTextColor: number;
  trackingParams: string;
}

/**
 * New Member:
 * headerPrimary: null
 * headerSub: Welcome <tenant> ! (YTRun)
 *
 * Milestone:
 * headerPrimary: Member for 11 months (YTRun)
 * headerSub: <tenant>
 * message: YTRun OR empty: true
 */
export interface YTLiveChatMembershipItemRenderer {
  id: string;
  timestampUsec: string;
  timestampText?: YTSimpleTextContainer; // replay
  authorExternalChannelId: string;
  headerPrimaryText?: YTRunContainer<YTTextRun>; // milestone
  headerSubtext: YTText;
  message?: YTRunContainer; // milestone with message
  empty?: true; // milestone without message
  authorName?: YTText;
  authorPhoto: YTThumbnailList;
  authorBadges: YTLiveChatAuthorBadgeRendererContainer[];
  contextMenuEndpoint: YTLiveChatItemContextMenuEndpointContainer;
  contextMenuAccessibility: YTAccessibilityData;
}

export interface YTLiveChatPlaceholderItemRenderer {
  id: string;
  timestampUsec: string;
}

export interface YTLiveChatBannerRenderer {
  actionId: string;
  targetId: string; // live-chat-banner
  contents: YTLiveChatTextMessageRendererContainer;
  header: YTLiveChatBannerRendererHeader;
  viewerIsCreator: boolean;
}

export interface YTLiveChatViewerEngagementMessageRenderer {
  id: string;
  timestampUsec?: string;
  icon: YTIcon;
  message: YTText;
  actionButton?: YTActionButtonRendererContainer;
  contextMenuEndpoint?: YTLiveChatItemContextMenuEndpointContainer;
}

export interface YTTooltipRenderer {
  // TODO: type promoConfig
  promoConfig: any;
  targetId: string;
  detailsText: YTText;
  suggestedPosition: YTType;
  dismissStrategy: YTType;
  trackingParams: string;
  dwellTimeMs?: string;
}

export interface YTPromoConfig {
  promoId: string; // "tip-edu-c-live-chat-banner-w"
}

export interface YTLiveChatPollRenderer {
  choices: YTLiveChatPollChoice[];
  liveChatPollId: string;
  header: {
    pollHeaderRenderer: {
      pollQuestion?: YTSimpleTextContainer;
      thumbnail: YTThumbnailList;
      metadataText: YTRunContainer<YTTextRun>;
      liveChatPollType: YTLiveChatPollType;
      contextMenuButton: YTContextMenuButtonRendererContainer;
    };
  };
}

export interface YTLiveChatActionPanelRenderer {
  contents: YTLiveChatPollRendererContainer | any;
  id: string;
  targetId: string;
}

export interface YTLiveChatPollChoice {
  text: YTText;
  selected: boolean;
  signinEndpoint: YTSignInEndpointContainer;

  /** not available in showLiveChatActionPanelAction event */
  voteRatio?: number; // 0.0 to 1.0

  /** not available in showLiveChatActionPanelAction event */
  votePercentage?: YTSimpleTextContainer; // 73%
}

export enum YTLiveChatPollType {
  Creator = "LIVE_CHAT_POLL_TYPE_CREATOR",
}

/**
 * YTLiveChatModeChangeMessageRenderer
 *
 * ```
 * # Slow mode
 * icon:    YTIconType.SlowMode
 *          YTIconType.QuestionAnswer (?)
 * text:    [{"text":"Slow mode is on","bold":true}]
 * subtext: [{"text":"Send a message every ","italics":true},{"text":"1 second","italics":true}]
 *
 * # Members-only mode
 * icon:    YTIconType.MembersOnlyMode
 *          YTIconType.QuestionAnswer
 * text:    [{"text":"Members-only mode is on","bold":true}]
 *          [{"text":"Members-only mode is off","bold":true}]
 * subtext: [{"text":"Only members of this channel can send messages","italics":true}]
 *          [{"text":"This channel owner has opened chat to everyone","italics":true}]
 *
 * # Subscribers-only mode
 * icon:    YTIconType.TabSubscription
 *          YTIconType.QuestionAnswer
 * text:    [{"text":"<channel name>","bold":true},{"text":" turned on subscribers-only mode","bold":true}]
 *          [{"text":"<channel name>","bold":true},{"text":" turned off subscribers-only mode","bold":true}]
 * subtext: [{"text":"Only channel subscribers of ","italics":true},{"text":"10 minutes","italics":true},{"text":" or longer can send messages","italics":true}]
 *          [{"text":"Anyone can send a message","italics":true}]
 * ```
 */
export interface YTLiveChatModeChangeMessageRenderer {
  id: string;
  timestampUsec: string;
  icon: YTIcon;
  text: YTText;
  subtext: YTText;
}

// Sponsorships gift purchase announcement
export interface YTLiveChatSponsorshipsGiftPurchaseAnnouncementRenderer {
  id: string;
  /** will be undefined if its container is a ticker */
  timestampUsec?: string;
  authorExternalChannelId: string;
  header: {
    liveChatSponsorshipsHeaderRenderer: YTLiveChatSponsorshipsHeaderRenderer;
  };
}

export interface YTLiveChatSponsorshipsHeaderRenderer {
  authorName: YTSimpleTextContainer;
  authorPhoto: YTThumbnailList;
  primaryText: {
    runs: [
      { text: "Gifted "; bold: true },
      { text: string; bold: true }, // text: "5"
      { text: " "; bold: true },
      { text: string; bold: true }, // text: "Miko Ch. さくらみこ"
      { text: " memberships"; bold: true }
    ];
  };
  authorBadges: YTLiveChatAuthorBadgeRendererContainer[];
  contextMenuEndpoint: YTLiveChatItemContextMenuEndpointContainer;
  contextMenuAccessibility: YTAccessibilityData;
  image: YTThumbnailList; // https://www.gstatic.com/youtube/img/sponsorships/sponsorships_gift_purchase_announcement_artwork.png
}

// Sponsorships gift redemption announcement
export interface YTLiveChatSponsorshipsGiftRedemptionAnnouncementRenderer {
  id: string;
  timestampUsec: string;
  authorExternalChannelId: string;
  authorName: YTSimpleTextContainer;
  authorPhoto: YTThumbnailList;
  message: {
    runs: [
      { text: "was gifted a membership by "; italics: true },
      { text: string; bold: true; italics: true } // text: "User"
    ];
  };
  contextMenuEndpoint: YTLiveChatItemContextMenuEndpointContainer;
  contextMenuAccessibility: YTAccessibilityData;
  trackingParams: string;
}

// Ticker Renderers

export interface YTAddLiveChatTickerItem {
  liveChatTickerPaidMessageItemRenderer?: YTLiveChatTickerPaidMessageItemRenderer; // Super Chat
  liveChatTickerPaidStickerItemRenderer?: YTLiveChatTickerPaidStickerItemRenderer; // Super Sticker
  liveChatTickerSponsorItemRenderer?: YTLiveChatTickerSponsorItemRenderer; // Membership Updates
}

export interface YTLiveChatTickerPaidMessageItemRenderer {
  id: string;
  amount: YTSimpleTextContainer;
  amountTextColor: number;
  startBackgroundColor: number;
  endBackgroundColor: number;
  authorPhoto: YTThumbnailList; // with accessibility
  durationSec: number;
  showItemEndpoint: YTShowLiveChatItemEndpointContainer<YTLiveChatPaidMessageRendererContainer>;
  authorExternalChannelId: string;
  fullDurationSec: number;
  trackingParams: string;
}

export interface YTLiveChatTickerPaidStickerItemRenderer {
  id: string;
  authorPhoto: YTThumbnailList; // with accessibility
  startBackgroundColor: number;
  endBackgroundColor: number;
  durationSec: number;
  fullDurationSec: number;
  showItemEndpoint: YTShowLiveChatItemEndpointContainer<YTLiveChatPaidStickerRendererContainer>;
  authorExternalChannelId: string;
  tickerThumbnails: YTThumbnailList[]; // with accessibility
  trackingParams: string;
}

export interface YTLiveChatTickerSponsorItemRenderer {
  id: string;
  detailIcon?: { iconType: "GIFT" };
  detailText: YTText;
  detailTextColor: number;
  startBackgroundColor: number;
  endBackgroundColor: number;
  sponsorPhoto: YTThumbnailList;
  durationSec: number;
  showItemEndpoint: YTShowLiveChatItemEndpointContainer<
    | YTLiveChatMembershipItemRendererContainer
    | YTLiveChatSponsorshipsGiftPurchaseAnnouncementRendererContainer
  >;
  authorExternalChannelId: string;
  fullDurationSec: number;
}

// Misc

export type YTShowLiveChatItemEndpointContainer<T> = {
  showLiveChatItemEndpoint: YTRendererContainer<T>;
} & YTCommandContainer<YTWebPageMetadataContainer>;

export interface YTRendererContainer<T> {
  renderer: T;
  trackingParams: string;
}

export type YTLiveChatItemContextMenuEndpointContainer =
  YTCommandContainer<YTIgnoreCommandMetadata> & {
    liveChatItemContextMenuEndpoint: YTEndpointParamsContainer;
  };

export type YTUserFeedbackEndpointContainer =
  YTCommandContainer<YTIgnoreCommandMetadata> & {
    userFeedbackEndpoint: YTUserFeedbackEndpoint;
  };

export interface YTEndpointParamsContainer {
  params: string;
}

export interface YTActionPanel {
  liveChatMessageInputRenderer?: {
    inputField: YTInputField;
    sendButton: YTSendButton;
    pickers: YTPicker[];
    pickerButtons: YTPickerButton[];
    interactionMessage: YTInteractionMessage;
  };
}

export interface YTInputField {
  liveChatTextInputFieldRenderer: {
    placeholder: YTText;
    maxCharacterLimit: number;
    emojiCharacterCount: number;
  };
}

export interface YTInteractionMessage {
  messageRenderer: {
    trackingParams: string;
    button: YTSigninButtonRendererContainer;
    subtext: YTMessageSubtextRendererContainer;
  };
}

export interface YTAuthorBadge {
  liveChatAuthorBadgeRenderer: {
    customThumbnail?: YTThumbnailList;
    icon?: YTIcon;
    tooltip: string;
    accessibility: YTAccessibilityData;
  };
}

export interface YTSendLiveChatMessageEndpoint {
  sendLiveChatMessageEndpoint: YTEndpointParamsContainer;
}

export interface YTSignInEndpointContainer {
  signInEndpoint: YTSignInEndpoint;
  commandMetadata: YTWebPageMetadataContainer;
  clickTrackingParams: string;
}

export interface YTWatchEndpointContainer {
  watchEndpoint: YTWatchEndpoint;
  commandMetadata: YTIgnoreCommandMetadata | YTWebPageMetadataContainer;
  clickTrackingParams?: string;
}

export interface YTSignInEndpoint {
  nextEndpoint: YTWatchEndpointContainer | {};
}

export interface YTWatchEndpoint {
  videoId: string;
  playlistId?: string;
  index?: string;
  startTimeSeconds?: number;
  nofollow?: boolean;
  params?: string;
}

export interface YTIgnoreCommandMetadata {
  webCommandMetadata: YTIgnoreWebCommandMetadata;
}
export interface YTIgnoreWebCommandMetadata {
  ignoreNavigation: boolean;
}

export interface YTWebPageMetadataContainer {
  webCommandMetadata: YTWebPageMetadata;
}

export interface YTWebPageMetadata {
  url: string;
  webPageType: YTWebPageType | string;
  rootVe: number; // 83769
}

export interface YTApiEndpointMetadataContainer {
  webCommandMetadata: YTApiEndpointMetadata;
}

export interface YTApiEndpointMetadata {
  sendPost: boolean; // POST or GET
  apiUrl: string; // endpoint url
}

export interface YTPopoutLiveChatEndpointContainer {
  clickTrackingParams: string;
  popoutLiveChatEndpoint: YTThumbnailWithoutSize;
}

export enum YTWebPageType {
  Unknown = "WEB_PAGE_TYPE_UNKNOWN",
  WebPageTypeBrowse = "WEB_PAGE_TYPE_BROWSE",
  WebPageTypeChannel = "WEB_PAGE_TYPE_CHANNEL",
  WebPageTypeSearch = "WEB_PAGE_TYPE_SEARCH",
  WebPageTypeUnknown = "WEB_PAGE_TYPE_UNKNOWN",
  WebPageTypeWatch = "WEB_PAGE_TYPE_WATCH",
}

export interface YTMessageSubtextRendererContainer {
  messageSubtextRenderer: {
    text: YTText;
  };
}

export interface YTIcon {
  iconType: YTIconType | string;
}

export enum YTIconType {
  Keep = "KEEP",
  MoreVert = "MORE_VERT",
  QuestionAnswer = "QUESTION_ANSWER",
  SlowMode = "SLOW_MODE",
  MembersOnlyMode = "MEMBERS_ONLY_MODE",
  TabSubscriptions = "TAB_SUBSCRIPTIONS",
  BlockUser = "BLOCK_USER",
  ErrorOutline = "ERROR_OUTLINE",
}

export interface YTPicker {
  emojiPickerRenderer: EmojiPickerRenderer;
}

export interface EmojiPickerRenderer {
  id: string;
  categories: YTEmojiCategory[];
  categoryButtons: YTCategoryButton[];
  searchPlaceholderText: YTRunContainer;
  searchNoResultsText: YTRunContainer;
  pickSkinToneText: YTRunContainer;
  trackingParams: string;
  clearSearchLabel: string;
  skinToneGenericLabel: string;
  skinToneLightLabel: string;
  skinToneMediumLightLabel: string;
  skinToneMediumLabel: string;
  skinToneMediumDarkLabel: string;
  skinToneDarkLabel: string;
}

export interface YTEmojiCategory {
  emojiPickerCategoryRenderer: {
    categoryId: string;
    title: YTText;
    emojiIds: string[];
    trackingParams: string;
  };
}

export interface YTLiveChatAuthorBadgeRendererContainer {
  liveChatAuthorBadgeRenderer: YTIconButtonRenderer;
}

export interface YTThumbnailList {
  thumbnails: YTThumbnail[];
  accessibility?: YTAccessibilityData;
}

export interface YTThumbnail {
  url: string;
  width?: number;
  height?: number;
}

export interface YTThumbnailWithoutSize {
  url: string;
}

export interface YTLiveChatBannerRendererHeader {
  liveChatBannerHeaderRenderer: {
    icon: YTIcon;
    text: YTRunContainer;
    contextMenuButton: YTContextMenuButtonRendererContainer;
  };
}

export interface YTContextMenuButtonRendererContainer<
  Command = YTLiveChatItemContextMenuEndpointContainer
> {
  buttonRenderer: {
    icon: YTIcon;
    style?: string;
    command?: Command;
    accessibilityData: YTAccessibilityData;
    trackingParams: string;
  };
}

export interface YTServiceButtonRendererContainer<T> {
  buttonRenderer: YTServiceButtonRenderer<T>;
}

export interface YTServiceButtonRenderer<Endpoint> {
  text: YTRunContainer;
  style: string;
  serviceEndpoint: Endpoint;
  trackingParams: string;
}

export interface YTButtonRenderer {
  size: string;
  style: string;
  isDisabled: boolean;
  accessibility: YTAccessibilityLabel;
  trackingParams: string;
}

export interface YTIconButtonRenderer {
  icon: YTIcon;
  tooltip: string;
  categoryId?: string;
  accessibility: YTAccessibilityData;
}

export interface YTNavigationButtonRenderer<Endpoint> extends YTButtonRenderer {
  text: YTSimpleTextContainer;
  navigationEndpoint: Endpoint;
}

export interface YTIconToggleButtonRenderer {
  icon: YTIcon;
  tooltip: string;
  toggledIcon: YTIcon;
  targetId: string;
  accessibility: YTAccessibilityData;
  trackingParams: string;
}

export interface YTSendButton {
  buttonRenderer: {
    icon: YTIcon;
    accessibility: YTAccessibilityLabel;
    trackingParams: string;
    serviceEndpoint?: YTSendLiveChatMessageEndpoint;
  }; //YTServiceButtonRenderer
}

export interface YTSigninButtonRendererContainer {
  buttonRenderer: YTNavigationButtonRenderer<YTSignInEndpointContainer>;
}

export interface YTActionButtonRendererContainer {
  buttonRenderer: YTNavigationButtonRenderer<YTUrlEndpointContainer> & {
    accessibilityData: YTAccessibilityData;
  };
}

export interface CollapseButton {
  buttonRenderer: YTButtonRenderer;
}

export interface YTPickerButton {
  liveChatIconToggleButtonRenderer: YTIconToggleButtonRenderer;
}

export interface YTCategoryButton {
  emojiPickerCategoryButtonRenderer: YTIconButtonRenderer;
}

export interface YTUserFeedbackEndpoint {
  hack: boolean;
  bucketIdentifier: string;
}

export interface YTSEndpoint {
  hack: boolean;
}

export interface YTFeedbackEndpoint {
  feedbackToken: string;
  uiActions: UIActions;
}

export interface YTShowLiveChatTooltipCommand {
  tooltip: YTTooltipRendererContainer;
}

export interface YTType {
  type: string;
}

export interface UIActions {
  hideEnclosingContainer: boolean;
}

export interface YTClientMessages {
  reconnectMessage: YTRunContainer;
  unableToReconnectMessage: YTRunContainer;
  fatalError: YTRunContainer;
  reconnectedMessage: YTRunContainer;
  genericError: YTRunContainer;
}

export interface YTLiveChatContinuationHeader {
  liveChatHeaderRenderer: {
    overflowMenu: YTOverflowMenu;
    collapseButton: CollapseButton;
    viewSelector: YTViewSelector;
  };
}

export interface YTViewSelector {
  sortFilterSubMenuRenderer: {
    subMenuItems: YTSubMenuItem[];
    accessibility: YTAccessibilityData;
    trackingParams: string;
  };
}

export interface YTSubMenuItem {
  title: string;
  subtitle: string;
  continuation: YTReloadContinuation;
  selected: boolean;
  accessibility: YTAccessibilityData;
}

export interface YTItemList {
  liveChatItemListRenderer: {
    maxItemsToDisplay: number;
    moreCommentsBelowButton: YTContextMenuButtonRendererContainer;
    enablePauseChatKeyboardShortcuts: boolean;
  };
}

export interface YTParticipantsList {
  liveChatParticipantsListRenderer: {
    title: YTRunContainer;
    backButton: YTContextMenuButtonRendererContainer;
    participants: YTParticipant[];
  };
}

export interface YTParticipant {
  liveChatParticipantRenderer: {
    authorName: YTText;
    authorPhoto: YTThumbnailList;
    authorBadges: YTLiveChatAuthorBadgeRendererContainer[];
  };
}

export interface YTPopoutMessage {
  messageRenderer: {
    text: YTRunContainer;
    trackingParams: string;
    button: YTServiceButtonRendererContainer<YTPopoutLiveChatEndpointContainer>;
  };
}

export interface YTTicker {
  liveChatTickerRenderer: {
    sentinel: boolean;
  };
}
