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
  image: TickerThumbnailClass;
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

export interface YTAction {
  clickTrackingParams: string;

  addChatItemAction?: YTAddChatItemAction;
  markChatItemsByAuthorAsDeletedAction?: YTMarkChatItemsByAuthorAsDeletedAction;
  markChatItemAsDeletedAction?: YTMarkChatItemAsDeletedAction;

  addLiveChatTickerItemAction?: YTAddLiveChatTickerItemAction;
  addBannerToLiveChatCommand?: YTAddBannerToLiveChatCommand;
  removeBannerToLiveChatCommand?: any; // TODO: find out the structure
  showLiveChatTooltipCommand?: YTShowLiveChatTooltipCommand;
  replaceChatItemAction: YTReplaceChatItemAction;
}

export interface YTReplayChatItemAction {
  actions: YTAction[];
}

export interface YTAddChatItemAction {
  item: YTAddChatItemActionItem;
  clientId?: string;
}

export interface YTAddLiveChatTickerItemAction {
  item: AddLiveChatTickerItem;
  durationSec: string;
}

export interface YTAddBannerToLiveChatCommand {
  bannerRenderer: BannerRenderer;
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
  liveChatPlaceholderItemRenderer?: YTLiveChatPlaceholderItemRenderer;
  liveChatPaidMessageRenderer?: YTLiveChatPaidMessageRenderer;
  liveChatMembershipItemRenderer?: YTLiveChatMembershipItemRenderer;
  liveChatViewerEngagementMessageRenderer?: YTLiveChatViewerEngagementMessageRenderer;
}

export interface YTItemLiveChatTextMessageRenderer {
  message: YTRunContainer;
  authorName: YTSimpleText;
  authorPhoto: Thumbnails;
  contextMenuEndpoint: ContextMenuEndpoint;
  id: string;
  timestampUsec: string;
  authorExternalChannelId: string;
  contextMenuAccessibility: YTAccessibilityData;
  authorBadges?: YTAuthorBadge[];
}

export interface YTLiveChatPlaceholderItemRenderer {
  id: string;
  timestampUsec: string;
}

export interface YTLiveChatPaidMessageRendererContainer {
  liveChatPaidMessageRenderer: YTLiveChatPaidMessageRenderer;
}

export interface YTLiveChatPaidMessageRenderer {
  id: string;
  timestampUsec: string;
  authorName: YTSimpleText;
  authorPhoto: Thumbnails;
  purchaseAmountText: YTSimpleText;
  message?: YTRunContainer;
  headerBackgroundColor: number;
  headerTextColor: number;
  bodyBackgroundColor: number;
  bodyTextColor: number;
  authorExternalChannelId: string;
  authorNameTextColor: number;
  contextMenuEndpoint: ContextMenuEndpoint;
  timestampColor: number;
  contextMenuAccessibility: YTAccessibilityData;
  trackingParams: string;
}

export interface YTLiveChatMembershipItemRendererContainer {
  liveChatMembershipItemRenderer: YTLiveChatMembershipItemRenderer;
}

export interface YTLiveChatMembershipItemRenderer {
  id: string;
  timestampUsec: string;
  authorExternalChannelId: string;
  headerSubtext: YTRunContainer;
  authorName: YTSimpleText;
  authorPhoto: Thumbnails;
  authorBadges: LiveChatParticipantRendererAuthorBadge[];
  contextMenuEndpoint: ContextMenuEndpoint;
  contextMenuAccessibility: YTAccessibilityData;
}

export interface YTLiveChatPaidStickerRendererContainer {
  liveChatPaidStickerRenderer: YTLiveChatPaidStickerRenderer;
}

export interface YTLiveChatPaidStickerRenderer {
  id: string;
  contextMenuEndpoint: ContextMenuEndpoint;
  contextMenuAccessibility: YTAccessibilityData;
  timestampUsec: string;
  authorPhoto: Thumbnails;
  authorName: YTSimpleText;
  authorExternalChannelId: string;
  sticker: TickerThumbnailClass;
  moneyChipBackgroundColor: number;
  moneyChipTextColor: number;
  purchaseAmountText: YTSimpleText;
  stickerDisplayWidth: number;
  stickerDisplayHeight: number;
  backgroundColor: number;
  authorNameTextColor: number;
  trackingParams: string;
}

export interface YTLiveChatViewerEngagementMessageRenderer {
  id: string;
  timestampUsec: string;
  icon: YTIcon;
  message: YTRunContainer;
  actionButton: ActionButton;
}

export interface YTLiveChatPlaceholderItemRenderer {
  id: string;
  timestampUsec: string;
}

// Ticker Renderers

export interface AddLiveChatTickerItem {
  liveChatTickerPaidMessageItemRenderer?: YTLiveChatTickerPaidMessageItemRenderer;
  liveChatTickerPaidStickerItemRenderer?: YTLiveChatTickerPaidStickerItemRenderer;
  liveChatTickerSponsorItemRenderer?: YTLiveChatTickerSponsorItemRenderer;
}

export interface LiveChatTickerShowItemEndpoint<T> {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata;
  showLiveChatItemEndpoint: ShowLiveChatItemEndpoint<T>;
}

export interface ShowLiveChatItemEndpoint<T> {
  renderer: T;
  trackingParams: string;
}

export interface YTLiveChatTickerPaidMessageItemRenderer {
  id: string;
  amount: YTSimpleText;
  amountTextColor: number;
  startBackgroundColor: number;
  endBackgroundColor: number;
  authorPhoto: TickerThumbnailClass;
  durationSec: number;
  showItemEndpoint: LiveChatTickerShowItemEndpoint<YTLiveChatPaidMessageRendererContainer>;
  authorExternalChannelId: string;
  fullDurationSec: number;
  trackingParams: string;
}

export interface YTLiveChatTickerPaidStickerItemRenderer {
  id: string;
  authorPhoto: TickerThumbnailClass;
  startBackgroundColor: number;
  endBackgroundColor: number;
  durationSec: number;
  fullDurationSec: number;
  showItemEndpoint: LiveChatTickerShowItemEndpoint<YTLiveChatPaidStickerRendererContainer>;
  authorExternalChannelId: string;
  tickerThumbnails: TickerThumbnailClass[];
  trackingParams: string;
}

export interface YTLiveChatTickerSponsorItemRenderer {
  id: string;
  detailText: YTRunContainer;
  detailTextColor: number;
  startBackgroundColor: number;
  endBackgroundColor: number;
  sponsorPhoto: Thumbnails;
  durationSec: number;
  showItemEndpoint: LiveChatTickerShowItemEndpoint<YTLiveChatMembershipItemRendererContainer>;
  authorExternalChannelId: string;
  fullDurationSec: number;
}

// Misc

export interface YTReplacementItem {
  liveChatPlaceholderItemRenderer: YTLiveChatPlaceholderItemRenderer;
}

export interface YTActionPanel {
  liveChatMessageInputRenderer: YTLiveChatMessageInputRenderer;
}

export interface YTTooltip {
  tooltipRenderer: YTTooltipRenderer;
}

export interface YTLiveChatMessageInputRenderer {
  inputField: YTInputField;
  sendButton: YTSendButton;
  pickers: YTPicker[];
  pickerButtons: PickerButton[];
  interactionMessage: YTInteractionMessage;
}

export interface YTInputField {
  liveChatTextInputFieldRenderer: YTLiveChatTextInputFieldRenderer;
}

export interface YTLiveChatTextInputFieldRenderer {
  placeholder: YTRunContainer;
  maxCharacterLimit: number;
  emojiCharacterCount: number;
}

export interface YTInteractionMessage {
  messageRenderer: YTInteractionMessageMessageRenderer;
}

export interface YTInteractionMessageMessageRenderer {
  trackingParams: string;
  button: YTButtonRendererContainer;
  subtext: YTSubtext;
}

export interface YTButtonRendererContainer {
  buttonRenderer: YTButtonRenderer;
}

export interface YTButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: YTSimpleText;
  navigationEndpoint: YTSignInEndpointContainer;
  accessibility: YTAccessibilityLabel;
  trackingParams: string;
}

export interface YTAuthorBadge {
  liveChatAuthorBadgeRenderer: YTLiveChatAuthorBadgeRenderer;
}

export interface YTLiveChatAuthorBadgeRenderer {
  customThumbnail?: YTCustomThumbnail;
  icon?: YTIcon;
  tooltip: string;
  accessibility: YTAccessibilityData;
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

export interface PickerButton {
  liveChatIconToggleButtonRenderer: LiveChatIconToggleButtonRenderer;
}

export interface LiveChatIconToggleButtonRenderer {
  targetId: string;
  icon: YTIcon;
  tooltip: string;
  accessibility: YTAccessibilityData;
  toggledIcon: YTIcon;
  trackingParams: string;
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
  categoryButtons: CategoryButton[];
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

export interface CategoryButton {
  emojiPickerCategoryButtonRenderer: EmojiPickerCategoryButtonRenderer;
}

export interface LiveChatParticipantRendererAuthorBadge {
  liveChatAuthorBadgeRenderer: EmojiPickerCategoryButtonRenderer;
}

export interface EmojiPickerCategoryButtonRenderer {
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

export interface BannerRenderer {
  liveChatBannerRenderer: {
    header: LiveChatBannerRendererHeader;
    contents: Contents;
    actionId: string;
    viewerIsCreator: boolean;
    targetId: string;
  };
}

export interface Contents {
  liveChatTextMessageRenderer: ContentsLiveChatTextMessageRenderer;
}

export interface ContentsLiveChatTextMessageRenderer {
  message: YTRunContainer;
  authorName: YTSimpleText;
  authorPhoto: Thumbnails;
  id: string;
  timestampUsec: string;
  authorBadges: LiveChatParticipantRendererAuthorBadge[];
  authorExternalChannelId: string;
}

export interface Thumbnails {
  thumbnails: Thumbnail[];
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface LiveChatBannerRendererHeader {
  liveChatBannerHeaderRenderer: LiveChatBannerHeaderRenderer;
}

export interface LiveChatBannerHeaderRenderer {
  icon: YTIcon;
  text: YTRunContainer;
  contextMenuButton: Button;
}

export interface Button {
  buttonRenderer: MoreCommentsBelowButtonButtonRenderer;
}

export interface MoreCommentsBelowButtonButtonRenderer {
  style?: string;
  command?: ContextMenuEndpoint;
  icon: YTIcon;
  accessibilityData: YTAccessibilityData;
  trackingParams: string;
}

export interface FluffyButton {
  buttonRenderer: {
    style: string;
    text: YTRunContainer;
    serviceEndpoint: ButtonRendererServiceEndpoint;
    trackingParams: string;
  };
}

export interface ButtonRendererServiceEndpoint {
  clickTrackingParams: string;
  popoutLiveChatEndpoint: YTPopoutLiveChatEndpoint;
}

export interface ContextMenuEndpoint {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata;
  liveChatItemContextMenuEndpoint: {
    params: string;
  };
}

export interface CommandMetadata {
  webCommandMetadata: WebCommandMetadata;
}

export interface YTNextEndpointCommandMetadata {
  webCommandMetadata: PurpleWebCommandMetadata;
}

export interface AcceptCommandCommandMetadata {
  webCommandMetadata: TentacledWebCommandMetadata;
}

export interface WebCommandMetadata {
  ignoreNavigation: boolean;
}

export interface PurpleWebCommandMetadata {
  url: string;
  webPageType: string;
  rootVe: number;
}

export interface TentacledWebCommandMetadata {
  sendPost: boolean;
  apiUrl: string;
}

export interface ActionButton {
  buttonRenderer: ActionButtonButtonRenderer;
}

export interface ActionButtonButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: YTSimpleText;
  navigationEndpoint: FluffyNavigationEndpoint;
  accessibility: YTAccessibilityLabel;
  trackingParams: string;
  accessibilityData: YTAccessibilityData;
}

export interface MenuNavigationItemRendererServiceEndpoint {
  showLiveChatParticipantsEndpoint?: SEndpoint;
  popoutLiveChatEndpoint?: YTPopoutLiveChatEndpoint;
  toggleLiveChatTimestampsEndpoint?: SEndpoint;
  clickTrackingParams: string;
}

export interface FluffyNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTNextEndpointCommandMetadata;
  urlEndpoint: YTURLEndpoint;
}

export interface MenuNavigationItemRendererNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: CommandMetadata;
  userFeedbackEndpoint: UserFeedbackEndpoint;
}

export interface UserFeedbackEndpoint {
  hack: boolean;
  bucketIdentifier: string;
}

export interface SEndpoint {
  hack: boolean;
}

export interface TickerThumbnailClass {
  thumbnails: Thumbnail[];
  accessibility: YTAccessibilityData;
}

export interface YTShowLiveChatTooltipCommand {
  tooltip: YTTooltip;
}

export interface YTTooltipRenderer {
  promoConfig: PromoConfig;
  targetId: string;
  detailsText: YTRunContainer;
  suggestedPosition: DismissStrategy;
  dismissStrategy: DismissStrategy;
  trackingParams: string;
}

export interface DismissStrategy {
  type: string;
}

export interface PromoConfig {
  promoId: string;
  impressionEndpoints: AcceptCommand[];
  acceptCommand: AcceptCommand;
  dismissCommand: AcceptCommand;
}

export interface AcceptCommand {
  clickTrackingParams: string;
  commandMetadata: AcceptCommandCommandMetadata;
  feedbackEndpoint: FeedbackEndpoint;
}

export interface FeedbackEndpoint {
  feedbackToken: string;
  uiActions: UIActions;
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
    overflowMenu: OverflowMenu;
    collapseButton: CollapseButton;
    viewSelector: ViewSelector;
  };
}

export interface CollapseButton {
  buttonRenderer: CollapseButtonButtonRenderer;
}

export interface CollapseButtonButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  accessibility: YTAccessibilityLabel;
  trackingParams: string;
}

export interface OverflowMenu {
  menuRenderer: {
    items: ItemElement[];
    trackingParams: string;
    accessibility: YTAccessibilityData;
  };
}

export interface ItemElement {
  menuServiceItemRenderer?: MenuItemRenderer;
  menuNavigationItemRenderer?: MenuItemRenderer;
}

export interface MenuItemRenderer {
  text: YTRunContainer;
  icon: YTIcon;
  navigationEndpoint?: MenuNavigationItemRendererNavigationEndpoint;
  trackingParams: string;
  serviceEndpoint?: MenuNavigationItemRendererServiceEndpoint;
}

export interface ViewSelector {
  sortFilterSubMenuRenderer: SortFilterSubMenuRenderer;
}

export interface SortFilterSubMenuRenderer {
  subMenuItems: YTSubMenuItem[];
  accessibility: YTAccessibilityData;
  trackingParams: string;
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
    moreCommentsBelowButton: Button;
    enablePauseChatKeyboardShortcuts: boolean;
  };
}

export interface YTParticipantsList {
  liveChatParticipantsListRenderer: {
    title: YTRunContainer;
    backButton: Button;
    participants: YTParticipant[];
  };
}

export interface YTParticipant {
  liveChatParticipantRenderer: {
    authorName: YTSimpleText;
    authorPhoto: Thumbnails;
    authorBadges: LiveChatParticipantRendererAuthorBadge[];
  };
}

export interface YTPopoutMessage {
  messageRenderer: {
    text: YTRunContainer;
    trackingParams: string;
    button: FluffyButton;
  };
}

export interface YTTicker {
  liveChatTickerRenderer: {
    sentinel: boolean;
  };
}
