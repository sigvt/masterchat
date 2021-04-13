import {
  YTAccessibilityLabel,
  YTAccessibilityData,
  YTReloadContinuation,
  YTResponseContext,
} from "./context";

// --------------------
// YT Interface
// --------------------

export interface YTRunContainer {
  runs: YTRun[];
}

export interface YTRun {
  text?: string;
  emoji?: YTEmoji;
}

export interface YTEmoji {
  emojiId: string;
  shortcuts: string[];
  searchTerms: string[];
  image: YTTickerThumbnailClass;
  isCustomEmoji: boolean;
}

export interface YTMarkChatItemAsDeletedAction {
  deletedStateMessage: YTRunContainer;
  targetItemId: string;
}

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
}

export interface YTChatResponse {
  responseContext: YTResponseContext;
  trackingParams: string;
  continuationContents?: YTContinuationContents;
  error?: YTChatError;
}

export interface YTChatErrorDetail {
  message: string;
  domain: "global";
  reason: "forbidden" | "backendError" | "badRequest" | "notFound";
}

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

// Actions

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
  removeBannerToLiveChatCommand?: any; // TODO: find out the structure

  // Placeholder
  replaceChatItemAction: YTReplaceChatItemAction;

  showLiveChatTooltipCommand?: YTShowLiveChatTooltipCommand;
}

export interface YTAddChatItemAction {
  item: YTAddChatItemActionItem;
  clientId?: string;
}

export interface YTAddLiveChatTickerItemAction {
  item: YTAddLiveChatTickerItem;
  durationSec: string;
}

export interface YTAddBannerToLiveChatCommand {
  bannerRenderer: YTBannerRendererContainer;
}

export interface YTMarkChatItemsByAuthorAsDeletedAction {
  deletedStateMessage: YTRunContainer;
  externalChannelId: string;
}

export interface YTReplaceChatItemAction {
  targetItemId: string;
  replacementItem: YTReplacementItem | YTAddChatItemActionItem;
}

// LiveChat Renderers

export interface YTAddChatItemActionItem {
  liveChatTextMessageRenderer?: YTItemLiveChatTextMessageRenderer;
  liveChatPaidMessageRenderer?: YTLiveChatPaidMessageRenderer;
  liveChatMembershipItemRenderer?: YTLiveChatMembershipItemRenderer;
  liveChatPlaceholderItemRenderer?: YTLiveChatPlaceholderItemRenderer;
  liveChatViewerEngagementMessageRenderer?: YTLiveChatViewerEngagementMessageRenderer;
}

export interface YTItemLiveChatTextMessageRenderer {
  id: string;
  timestampUsec: string;
  message: YTRunContainer;
  authorName: YTSimpleText;
  authorPhoto: YTThumbnails;
  authorExternalChannelId: string;
  contextMenuEndpoint: YTContextMenuEndpoint;
  contextMenuAccessibility: YTAccessibilityData;

  authorBadges?: YTAuthorBadge[];
}

export interface YTLiveChatPaidMessageRenderer {
  id: string;
  timestampUsec: string;
  message?: YTRunContainer;
  authorName: YTSimpleText;
  authorPhoto: YTThumbnails;
  authorExternalChannelId: string;
  contextMenuEndpoint: YTContextMenuEndpoint;
  contextMenuAccessibility: YTAccessibilityData;

  purchaseAmountText: YTSimpleText;
  timestampColor: number;
  authorNameTextColor: number;
  headerBackgroundColor: number;
  headerTextColor: number;
  bodyBackgroundColor: number;
  bodyTextColor: number;
  trackingParams: string;
}

export interface YTLiveChatPaidMessageRendererContainer {
  liveChatPaidMessageRenderer: YTLiveChatPaidMessageRenderer;
}

export interface YTLiveChatPlaceholderItemRenderer {
  id: string;
  timestampUsec: string;
}

export interface YTLiveChatMembershipItemRenderer {
  id: string;
  timestampUsec: string;
  authorExternalChannelId: string;
  headerSubtext: YTRunContainer;
  authorName: YTSimpleText;
  authorPhoto: YTThumbnails;
  authorBadges: YTLiveChatParticipantRendererAuthorBadge[];
  contextMenuEndpoint: YTContextMenuEndpoint;
  contextMenuAccessibility: YTAccessibilityData;
}

export interface YTLiveChatMembershipItemRendererContainer {
  liveChatMembershipItemRenderer: YTLiveChatMembershipItemRenderer;
}

export interface YTLiveChatPaidStickerRenderer {
  id: string;
  contextMenuEndpoint: YTContextMenuEndpoint;
  contextMenuAccessibility: YTAccessibilityData;
  timestampUsec: string;
  authorPhoto: YTThumbnails;
  authorName: YTSimpleText;
  authorExternalChannelId: string;
  sticker: YTTickerThumbnailClass;
  moneyChipBackgroundColor: number;
  moneyChipTextColor: number;
  purchaseAmountText: YTSimpleText;
  stickerDisplayWidth: number;
  stickerDisplayHeight: number;
  backgroundColor: number;
  authorNameTextColor: number;
  trackingParams: string;
}

export interface YTLiveChatPaidStickerRendererContainer {
  liveChatPaidStickerRenderer: YTLiveChatPaidStickerRenderer;
}

export interface YTLiveChatViewerEngagementMessageRenderer {
  id: string;
  timestampUsec: string;
  icon: YTIcon;
  message: YTRunContainer;
  actionButton: YTActionButton;
}

// Ticker Renderers

export interface YTAddLiveChatTickerItem {
  liveChatTickerPaidMessageItemRenderer?: YTLiveChatTickerPaidMessageItemRenderer; // Super Chat
  liveChatTickerPaidStickerItemRenderer?: YTLiveChatTickerPaidStickerItemRenderer; // Super Sticker
  liveChatTickerSponsorItemRenderer?: YTLiveChatTickerSponsorItemRenderer; // Membership Updates
}

export interface YTLiveChatTickerShowItemEndpoint<T> {
  clickTrackingParams: string;
  commandMetadata: YTCommandMetadata;
  showLiveChatItemEndpoint: YTShowLiveChatItemEndpoint<T>;
}

export interface YTShowLiveChatItemEndpoint<T> {
  renderer: T;
  trackingParams: string;
}

export interface YTLiveChatTickerPaidMessageItemRenderer {
  id: string;
  amount: YTSimpleText;
  amountTextColor: number;
  startBackgroundColor: number;
  endBackgroundColor: number;
  authorPhoto: YTTickerThumbnailClass;
  durationSec: number;
  showItemEndpoint: YTLiveChatTickerShowItemEndpoint<YTLiveChatPaidMessageRendererContainer>;
  authorExternalChannelId: string;
  fullDurationSec: number;
  trackingParams: string;
}

export interface YTLiveChatTickerPaidStickerItemRenderer {
  id: string;
  authorPhoto: YTTickerThumbnailClass;
  startBackgroundColor: number;
  endBackgroundColor: number;
  durationSec: number;
  fullDurationSec: number;
  showItemEndpoint: YTLiveChatTickerShowItemEndpoint<YTLiveChatPaidStickerRendererContainer>;
  authorExternalChannelId: string;
  tickerThumbnails: YTTickerThumbnailClass[];
  trackingParams: string;
}

export interface YTLiveChatTickerSponsorItemRenderer {
  id: string;
  detailText: YTRunContainer;
  detailTextColor: number;
  startBackgroundColor: number;
  endBackgroundColor: number;
  sponsorPhoto: YTThumbnails;
  durationSec: number;
  showItemEndpoint: YTLiveChatTickerShowItemEndpoint<YTLiveChatMembershipItemRendererContainer>;
  authorExternalChannelId: string;
  fullDurationSec: number;
}

export interface YTBannerRendererContainer {
  liveChatBannerRenderer: YTBannerRenderer;
}

export interface YTBannerRenderer {
  header: YTLiveChatBannerRendererHeader;
  contents: YTContents;
  actionId: string;
  viewerIsCreator: boolean;
  targetId: string;
}

// Misc

export interface YTReplacementItem {
  liveChatPlaceholderItemRenderer: YTLiveChatPlaceholderItemRenderer;
}

export interface YTActionPanel {
  liveChatMessageInputRenderer: {
    inputField: YTInputField;
    sendButton: YTSendButton;
    pickers: YTPicker[];
    pickerButtons: YTPickerButton[];
    interactionMessage: YTInteractionMessage;
  };
}

export interface YTTooltip {
  tooltipRenderer: {
    promoConfig: YTPromoConfig;
    targetId: string;
    detailsText: YTRunContainer;
    suggestedPosition: YTType;
    dismissStrategy: YTType;
    trackingParams: string;
  };
}

export interface YTInputField {
  liveChatTextInputFieldRenderer: {
    placeholder: YTRunContainer;
    maxCharacterLimit: number;
    emojiCharacterCount: number;
  };
}

export interface YTInteractionMessage {
  messageRenderer: {
    trackingParams: string;
    button: YTButtonRendererContainer;
    subtext: YTSubtext;
  };
}

export interface YTButtonRendererContainer {
  buttonRenderer: {
    style: string;
    size: string;
    isDisabled: boolean;
    text: YTSimpleText;
    navigationEndpoint: YTSignInEndpointContainer;
    accessibility: YTAccessibilityLabel;
    trackingParams: string;
  };
}

export interface YTAuthorBadge {
  liveChatAuthorBadgeRenderer: {
    customThumbnail?: YTCustomThumbnail;
    icon?: YTIcon;
    tooltip: string;
    accessibility: YTAccessibilityData;
  };
}

export interface YTCustomThumbnail {
  thumbnails: YTPopoutLiveChatEndpoint[];
}

export interface YTURLEndpoint {
  url: string;
  target: string;
}

export interface YTPopoutLiveChatEndpoint {
  url: string;
}

export interface YTSignInEndpointContainer {
  signInEndpoint: YTSignInEndpoint;
  commandMetadata: YTNextEndpointCommandMetadata;
  clickTrackingParams: string;
}

export interface YTSignInEndpoint {
  nextEndpoint: YTWatchEndpointContainer;
}

export interface YTWatchEndpointContainer {
  clickTrackingParams: string;
  commandMetadata: YTNextEndpointCommandMetadata;
  watchEndpoint: YTWatchEndpoint;
}

export interface YTWatchEndpoint {
  videoId: string;
}

export interface YTSimpleText {
  simpleText: string;
}

export interface YTSubtext {
  messageSubtextRenderer: {
    text: YTSimpleText;
  };
}

export interface YTPickerButton {
  liveChatIconToggleButtonRenderer: {
    targetId: string;
    icon: YTIcon;
    tooltip: string;
    accessibility: YTAccessibilityData;
    toggledIcon: YTIcon;
    trackingParams: string;
  };
}

// TODO: convert to enum
export interface YTIcon {
  iconType: string; // KEEP
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
    title: YTSimpleText;
    emojiIds: string[];
    trackingParams: string;
  };
}

export interface YTCategoryButton {
  emojiPickerCategoryButtonRenderer: YTEmojiPickerCategoryButtonRenderer;
}

export interface YTLiveChatParticipantRendererAuthorBadge {
  liveChatAuthorBadgeRenderer: YTEmojiPickerCategoryButtonRenderer;
}

export interface YTEmojiPickerCategoryButtonRenderer {
  categoryId?: string;
  icon: YTIcon;
  tooltip: string;
  accessibility: YTAccessibilityData;
}

export interface YTSendButton {
  buttonRenderer: {
    icon: YTIcon;
    accessibility: YTAccessibilityLabel;
    trackingParams: string;
  };
}

export interface YTContents {
  liveChatTextMessageRenderer: {
    message: YTRunContainer;
    authorName: YTSimpleText;
    authorPhoto: YTThumbnails;
    id: string;
    timestampUsec: string;
    authorBadges: YTLiveChatParticipantRendererAuthorBadge[];
    authorExternalChannelId: string;
  };
}

export interface YTThumbnails {
  thumbnails: YTThumbnail[];
}

export interface YTThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YTLiveChatBannerRendererHeader {
  liveChatBannerHeaderRenderer: {
    icon: YTIcon;
    text: YTRunContainer;
    contextMenuButton: YTButton;
  };
}

export interface YTButton {
  buttonRenderer: YTMoreCommentsBelowButtonButtonRenderer;
}

export interface YTMoreCommentsBelowButtonButtonRenderer {
  style?: string;
  command?: YTContextMenuEndpoint;
  icon: YTIcon;
  accessibilityData: YTAccessibilityData;
  trackingParams: string;
}

export interface YTFluffyButton {
  buttonRenderer: {
    style: string;
    text: YTRunContainer;
    serviceEndpoint: YTButtonRendererServiceEndpoint;
    trackingParams: string;
  };
}

export interface YTButtonRendererServiceEndpoint {
  clickTrackingParams: string;
  popoutLiveChatEndpoint: YTPopoutLiveChatEndpoint;
}

export interface YTContextMenuEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTCommandMetadata;
  liveChatItemContextMenuEndpoint: {
    params: string;
  };
}

export interface YTCommandMetadata {
  webCommandMetadata: YTWebCommandMetadata;
}

export interface YTNextEndpointCommandMetadata {
  webCommandMetadata: YTPurpleWebCommandMetadata;
}

export interface YTAcceptCommandCommandMetadata {
  webCommandMetadata: YTTentacledWebCommandMetadata;
}

export interface YTWebCommandMetadata {
  ignoreNavigation: boolean;
}

export interface YTPurpleWebCommandMetadata {
  url: string;
  webPageType: string;
  rootVe: number;
}

export interface YTTentacledWebCommandMetadata {
  sendPost: boolean;
  apiUrl: string;
}

export interface YTActionButton {
  buttonRenderer: {
    style: string;
    size: string;
    isDisabled: boolean;
    text: YTSimpleText;
    navigationEndpoint: YTFluffyNavigationEndpoint;
    accessibility: YTAccessibilityLabel;
    accessibilityData: YTAccessibilityData;
    trackingParams: string;
  };
}

export interface YTFluffyNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTNextEndpointCommandMetadata;
  urlEndpoint: YTURLEndpoint;
}

export interface YTMenuNavigationItemRendererServiceEndpoint {
  showLiveChatParticipantsEndpoint?: YTSEndpoint;
  popoutLiveChatEndpoint?: YTPopoutLiveChatEndpoint;
  toggleLiveChatTimestampsEndpoint?: YTSEndpoint;
  clickTrackingParams: string;
}
export interface YTMenuNavigationItemRendererNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTCommandMetadata;
  userFeedbackEndpoint: YTUserFeedbackEndpoint;
}

export interface YTUserFeedbackEndpoint {
  hack: boolean;
  bucketIdentifier: string;
}

export interface YTSEndpoint {
  hack: boolean;
}

export interface YTAcceptCommand {
  commandMetadata: YTAcceptCommandCommandMetadata;
  feedbackEndpoint: YTFeedbackEndpoint;
  clickTrackingParams: string;
}

export interface YTFeedbackEndpoint {
  feedbackToken: string;
  uiActions: UIActions;
}

export interface YTTickerThumbnailClass {
  thumbnails: YTThumbnail[];
  accessibility: YTAccessibilityData;
}

export interface YTShowLiveChatTooltipCommand {
  tooltip: YTTooltip;
}

export interface YTType {
  type: string;
}

export interface YTPromoConfig {
  promoId: string;
  impressionEndpoints: YTAcceptCommand[];
  acceptCommand: YTAcceptCommand;
  dismissCommand: YTAcceptCommand;
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

export interface CollapseButton {
  buttonRenderer: {
    style: string;
    size: string;
    isDisabled: boolean;
    accessibility: YTAccessibilityLabel;
    trackingParams: string;
  };
}

export interface YTOverflowMenu {
  menuRenderer: {
    items: YTItemElement[];
    trackingParams: string;
    accessibility: YTAccessibilityData;
  };
}

export interface YTItemElement {
  menuServiceItemRenderer?: YTMenuItemRenderer;
  menuNavigationItemRenderer?: YTMenuItemRenderer;
}

export interface YTMenuItemRenderer {
  text: YTRunContainer;
  icon: YTIcon;
  navigationEndpoint?: YTMenuNavigationItemRendererNavigationEndpoint;
  trackingParams: string;
  serviceEndpoint?: YTMenuNavigationItemRendererServiceEndpoint;
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
  selected: boolean;
  continuation: YTReloadContinuation;
  accessibility: YTAccessibilityData;
  subtitle: string;
}

export interface YTItemList {
  liveChatItemListRenderer: {
    maxItemsToDisplay: number;
    moreCommentsBelowButton: YTButton;
    enablePauseChatKeyboardShortcuts: boolean;
  };
}

export interface YTParticipantsList {
  liveChatParticipantsListRenderer: {
    title: YTRunContainer;
    backButton: YTButton;
    participants: YTParticipant[];
  };
}

export interface YTParticipant {
  liveChatParticipantRenderer: {
    authorName: YTSimpleText;
    authorPhoto: YTThumbnails;
    authorBadges: YTLiveChatParticipantRendererAuthorBadge[];
  };
}

export interface YTPopoutMessage {
  messageRenderer: {
    text: YTRunContainer;
    trackingParams: string;
    button: YTFluffyButton;
  };
}

export interface YTTicker {
  liveChatTickerRenderer: {
    sentinel: boolean;
  };
}
