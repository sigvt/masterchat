export interface Chat {
  continuation: TimedContinuation;
  actions: Action[];
}

export type ReloadContinuationItems = {
  [index in ReloadContinuationType]: ReloadContinuation;
};

export interface ReloadContinuation {
  token: string;
}

export enum ReloadContinuationType {
  Top = "top",
  All = "all",
}

export interface TimedContinuation extends ReloadContinuation {
  timeoutMs: number;
}

// supports
export type Action =
  | ChatAdditionAction
  | ChatDeletionAction
  | ChatByAuthorDeletionAction;

/*
  liveChatPlaceholderItemRenderer?: LiveChatPlaceholderItemRenderer; -> ignore
  liveChatMembershipItemRenderer?: LiveChatMembershipItemRenderer; -> ignore
  liveChatViewerEngagementMessageRenderer; -> ignore
  */
export interface ChatAdditionAction {
  type: "addChatItemAction";
  id: string;
  timestamp: Date;
  timestampUsec: string;
  rawMessage?: Run[];
  authorName?: string;
  authorChannelId: string;
  authorPhoto: string;
  purchase?: Purchase;
  membership?: Membership;
  isOwner: boolean;
  isModerator: boolean;
  isVerified: boolean;
}

export interface Membership {
  status: string;
  since: string;
  thumbnail: string;
}

export interface Purchase {
  amount: number;
  currency: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  bodyBackgroundColor: string;
  bodyTextColor: string;
}

export interface ChatByAuthorDeletionAction {
  type: "markChatItemsByAuthorAsDeletedAction";
  channelId: string;
  timestamp: Date;
}

export interface ChatDeletionAction {
  type: "markChatItemAsDeletedAction";
  retracted: boolean;
  targetId: string;
  timestamp: Date;
}

export interface TextArray {
  runs: Run[];
}

export interface Run {
  text?: string;
  emoji?: Emoji;
}

// --------------------
// Raw Interface
// --------------------

export interface RawChatResponse {
  responseContext: ResponseContext;
  trackingParams: string;
  continuationContents?: RawContinuationContents;
  error?: RawChatError;
}

export interface RawChatError {
  code: number;
  message: string;
  errors: RawChatErrorDetail[];
  status: RawChatErrorStatus; // UNAVAILABLE, PERMISSION_DENIED
}

export interface RawChatErrorDetail {
  message: string;
  domain: "global";
  reason: "forbidden" | "backendError" | "badRequest" | "notFound";
}

export enum RawChatErrorStatus {
  Unavailable = "UNAVAILABLE",
  PermissionDenied = "PERMISSION_DENIED",
  Internal = "INTERNAL",
  Invalid = "INVALID_ARGUMENT",
  NotFound = "NOT_FOUND",
}

export interface RawContinuationContents {
  liveChatContinuation: RawLiveChatContinuation;
}

export interface RawLiveChatContinuation {
  continuations: ContinuationElement[];
  actions?: RawAction[];
  actionPanel?: RawActionPanel;
  itemList?: ItemList;
  header?: LiveChatContinuationHeader;
  ticker?: Ticker;
  trackingParams?: TrackingParams;
  participantsList?: ParticipantsList;
  popoutMessage?: PopoutMessage;
  clientMessages?: ClientMessages;
}

export interface MarkChatItemsByAuthorAsDeletedAction {
  deletedStateMessage: TextArray;
  externalChannelId: string;
}

export interface MarkChatItemAsDeletedAction {
  deletedStateMessage: TextArray;
  targetItemId: string;
}

export interface RawActionPanel {
  liveChatMessageInputRenderer: RawLiveChatMessageInputRenderer;
}

export interface RawLiveChatMessageInputRenderer {
  inputField: RawInputField;
  sendButton: SendButton;
  pickers: Picker[];
  pickerButtons: PickerButton[];
  interactionMessage: InteractionMessage;
}

export interface RawInputField {
  liveChatTextInputFieldRenderer: RawLiveChatTextInputFieldRenderer;
}

export interface RawLiveChatTextInputFieldRenderer {
  placeholder: TextArray;
  maxCharacterLimit: number;
  emojiCharacterCount: number;
}

export interface Emoji {
  emojiId: string;
  shortcuts: string[];
  searchTerms: string[];
  image: TickerThumbnailClass;
  isCustomEmoji: boolean;
}

export interface InteractionMessage {
  messageRenderer: InteractionMessageMessageRenderer;
}

export interface InteractionMessageMessageRenderer {
  trackingParams: string;
  button: ButtonRendererContainer;
  subtext: Subtext;
}

export interface ButtonRendererContainer {
  buttonRenderer: ButtonRenderer;
}

export interface ButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: AuthorName;
  navigationEndpoint: PurpleNavigationEndpoint;
  accessibility: AccessibilityAccessibility;
  trackingParams: string;
}

export interface AccessibilityAccessibility {
  label: string;
}

export interface PurpleNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: NextEndpointCommandMetadata;
  signInEndpoint: SignInEndpoint;
}

export interface NextEndpointCommandMetadata {
  webCommandMetadata: PurpleWebCommandMetadata;
}

export interface PurpleWebCommandMetadata {
  url: string;
  webPageType: string;
  rootVe: number;
}

export interface SignInEndpoint {
  nextEndpoint: NextEndpoint;
}

export interface NextEndpoint {
  clickTrackingParams: string;
  commandMetadata: NextEndpointCommandMetadata;
  watchEndpoint: WatchEndpoint;
}

export interface WatchEndpoint {
  videoId: string;
}

export interface AuthorName {
  simpleText: string;
}

export interface Subtext {
  messageSubtextRenderer: MessageSubtextRenderer;
}

export interface MessageSubtextRenderer {
  text: AuthorName;
}

export interface PickerButton {
  liveChatIconToggleButtonRenderer: LiveChatIconToggleButtonRenderer;
}

export interface LiveChatIconToggleButtonRenderer {
  targetId: string;
  icon: Icon;
  tooltip: string;
  accessibility: ContextMenuAccessibilityClass;
  toggledIcon: Icon;
  trackingParams: string;
}

export interface ContextMenuAccessibilityClass {
  accessibilityData: AccessibilityAccessibility;
}

export interface Icon {
  iconType: string;
}

export interface Picker {
  emojiPickerRenderer: EmojiPickerRenderer;
}

export interface EmojiPickerRenderer {
  id: string;
  categories: Category[];
  categoryButtons: CategoryButton[];
  searchPlaceholderText: TextArray;
  searchNoResultsText: TextArray;
  pickSkinToneText: TextArray;
  trackingParams: string;
  clearSearchLabel: string;
  skinToneGenericLabel: string;
  skinToneLightLabel: string;
  skinToneMediumLightLabel: string;
  skinToneMediumLabel: string;
  skinToneMediumDarkLabel: string;
  skinToneDarkLabel: string;
}

export interface Category {
  emojiPickerCategoryRenderer: EmojiPickerCategoryRenderer;
}

export interface EmojiPickerCategoryRenderer {
  categoryId: string;
  title: AuthorName;
  emojiIds: string[];
  trackingParams: string;
}

export interface CategoryButton {
  emojiPickerCategoryButtonRenderer: Renderer;
}

export interface Renderer {
  categoryId?: string;
  icon: Icon;
  tooltip: string;
  accessibility: ContextMenuAccessibilityClass;
}

export interface SendButton {
  buttonRenderer: SendButtonButtonRenderer;
}

export interface SendButtonButtonRenderer {
  icon: Icon;
  accessibility: AccessibilityAccessibility;
  trackingParams: string;
}

export interface RawAction {
  clickTrackingParams: TrackingParams;
  addChatItemAction?: AddChatItemAction;
  addLiveChatTickerItemAction?: AddLiveChatTickerItemAction;
  addBannerToLiveChatCommand?: AddBannerToLiveChatCommand;
  showLiveChatTooltipCommand?: ShowLiveChatTooltipCommand;
  markChatItemsByAuthorAsDeletedAction?: MarkChatItemsByAuthorAsDeletedAction;
  markChatItemAsDeletedAction?: MarkChatItemAsDeletedAction;
  replaceChatItemAction: ReplaceChatItemAction;
}

export interface ReplaceChatItemAction {
  targetItemId: string;
  replacementItem: ReplacementItem | AddChatItemActionItem;
}

export interface ReplacementItem {
  liveChatPlaceholderItemRenderer: LiveChatPlaceholderItemRenderer;
}

export interface LiveChatPlaceholderItemRenderer {
  id: string;
  timestampUsec: string;
}

export interface ReplayChatItemAction {
  actions: RawAction[];
}

export interface AddBannerToLiveChatCommand {
  bannerRenderer: BannerRenderer;
}

export interface BannerRenderer {
  liveChatBannerRenderer: LiveChatBannerRenderer;
}

export interface LiveChatBannerRenderer {
  header: LiveChatBannerRendererHeader;
  contents: Contents;
  actionId: string;
  viewerIsCreator: boolean;
  targetId: string;
}

export interface Contents {
  liveChatTextMessageRenderer: ContentsLiveChatTextMessageRenderer;
}

export interface ContentsLiveChatTextMessageRenderer {
  message: TextArray;
  authorName: AuthorName;
  authorPhoto: AuthorPhoto;
  id: string;
  timestampUsec: string;
  authorBadges: LiveChatParticipantRendererAuthorBadge[];
  authorExternalChannelId: string;
}

export interface LiveChatParticipantRendererAuthorBadge {
  liveChatAuthorBadgeRenderer: Renderer;
}

export interface AuthorPhoto {
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
  icon: Icon;
  text: TextArray;
  contextMenuButton: Button;
}

export interface Button {
  buttonRenderer: MoreCommentsBelowButtonButtonRenderer;
}

export interface MoreCommentsBelowButtonButtonRenderer {
  icon: Icon;
  trackingParams: string;
  accessibilityData: ContextMenuAccessibilityClass;
  command?: Command;
  style?: string;
}

export interface Command {
  clickTrackingParams: string;
  commandMetadata: CommandCommandMetadata;
  liveChatItemContextMenuEndpoint: LiveChatItemContextMenuEndpoint;
}

export interface CommandCommandMetadata {
  webCommandMetadata: FluffyWebCommandMetadata;
}

export interface FluffyWebCommandMetadata {
  ignoreNavigation: boolean;
}

export interface LiveChatItemContextMenuEndpoint {
  params: string;
}

export interface AddChatItemAction {
  item: AddChatItemActionItem;
  clientId?: string;
}

export interface AddChatItemActionItem {
  liveChatTextMessageRenderer?: ItemLiveChatTextMessageRenderer;
  liveChatPlaceholderItemRenderer?: LiveChatPlaceholderItemRenderer;
  liveChatPaidMessageRenderer?: LiveChatPaidMessageRenderer;
  liveChatMembershipItemRenderer?: LiveChatMembershipItemRenderer;
  liveChatViewerEngagementMessageRenderer?: LiveChatViewerEngagementMessageRenderer;
}

export interface LiveChatMembershipItemRenderer {
  id: string;
  timestampUsec: string;
  authorExternalChannelId: string;
  headerSubtext: TextArray;
  authorName: AuthorName;
  authorPhoto: AuthorPhoto;
  authorBadges: LiveChatParticipantRendererAuthorBadge[];
  contextMenuEndpoint: Command;
  contextMenuAccessibility: ContextMenuAccessibilityClass;
}

export interface LiveChatPaidMessageRenderer {
  id: string;
  timestampUsec: string;
  authorName: AuthorName;
  authorPhoto: AuthorPhoto;
  purchaseAmountText: AuthorName;
  message?: TextArray;
  headerBackgroundColor: number;
  headerTextColor: number;
  bodyBackgroundColor: number;
  bodyTextColor: number;
  authorExternalChannelId: string;
  authorNameTextColor: number;
  contextMenuEndpoint: Command;
  timestampColor: number;
  contextMenuAccessibility: ContextMenuAccessibilityClass;
  trackingParams: string;
}

export interface LiveChatPlaceholderItemRenderer {
  id: string;
  timestampUsec: string;
}

export interface ItemLiveChatTextMessageRenderer {
  message: TextArray;
  authorName: AuthorName;
  authorPhoto: AuthorPhoto;
  contextMenuEndpoint: Command;
  id: string;
  timestampUsec: string;
  authorExternalChannelId: string;
  contextMenuAccessibility: ContextMenuAccessibilityClass;
  authorBadges?: AuthorBadge[];
}

export interface AuthorBadge {
  liveChatAuthorBadgeRenderer: LiveChatAuthorBadgeRenderer;
}

export interface LiveChatAuthorBadgeRenderer {
  customThumbnail?: CustomThumbnail;
  icon?: Icon;
  tooltip: string;
  accessibility: ContextMenuAccessibilityClass;
}

export interface CustomThumbnail {
  thumbnails: PopoutLiveChatEndpoint[];
}

export interface PopoutLiveChatEndpoint {
  url: string;
}

export interface LiveChatViewerEngagementMessageRenderer {
  id: string;
  timestampUsec: string;
  icon: Icon;
  message: TextArray;
  actionButton: ActionButton;
}

export interface ActionButton {
  buttonRenderer: ActionButtonButtonRenderer;
}

export interface ActionButtonButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: AuthorName;
  navigationEndpoint: FluffyNavigationEndpoint;
  accessibility: AccessibilityAccessibility;
  trackingParams: string;
  accessibilityData: ContextMenuAccessibilityClass;
}

export interface FluffyNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: NextEndpointCommandMetadata;
  urlEndpoint: URLEndpoint;
}

export interface URLEndpoint {
  url: string;
  target: string;
}

export interface AddLiveChatTickerItemAction {
  item: AddLiveChatTickerItemActionItem;
  durationSec: string;
}

export interface AddLiveChatTickerItemActionItem {
  liveChatTickerPaidMessageItemRenderer?: LiveChatTickerPaidMessageItemRenderer;
  liveChatTickerPaidStickerItemRenderer?: LiveChatTickerPaidStickerItemRenderer;
}

export interface LiveChatTickerPaidMessageItemRenderer {
  id: string;
  amount: AuthorName;
  amountTextColor: number;
  startBackgroundColor: number;
  endBackgroundColor: number;
  authorPhoto: TickerThumbnailClass;
  durationSec: number;
  showItemEndpoint: LiveChatTickerPaidMessageItemRendererShowItemEndpoint;
  authorExternalChannelId: string;
  fullDurationSec: number;
  trackingParams: string;
}

export interface TickerThumbnailClass {
  thumbnails: Thumbnail[];
  accessibility: ContextMenuAccessibilityClass;
}

export interface LiveChatTickerPaidMessageItemRendererShowItemEndpoint {
  clickTrackingParams: string;
  commandMetadata: CommandCommandMetadata;
  showLiveChatItemEndpoint: PurpleShowLiveChatItemEndpoint;
}

export interface PurpleShowLiveChatItemEndpoint {
  renderer: PurpleRenderer;
  trackingParams: string;
}

export interface PurpleRenderer {
  liveChatPaidMessageRenderer: LiveChatPaidMessageRenderer;
}

export interface LiveChatTickerPaidStickerItemRenderer {
  id: string;
  authorPhoto: TickerThumbnailClass;
  startBackgroundColor: number;
  endBackgroundColor: number;
  durationSec: number;
  fullDurationSec: number;
  showItemEndpoint: LiveChatTickerPaidStickerItemRendererShowItemEndpoint;
  authorExternalChannelId: string;
  tickerThumbnails: TickerThumbnailClass[];
  trackingParams: string;
}

export interface LiveChatTickerPaidStickerItemRendererShowItemEndpoint {
  clickTrackingParams: string;
  commandMetadata: CommandCommandMetadata;
  showLiveChatItemEndpoint: FluffyShowLiveChatItemEndpoint;
}

export interface FluffyShowLiveChatItemEndpoint {
  renderer: FluffyRenderer;
  trackingParams: string;
}

export interface FluffyRenderer {
  liveChatPaidStickerRenderer: LiveChatPaidStickerRenderer;
}

export interface LiveChatPaidStickerRenderer {
  id: string;
  contextMenuEndpoint: Command;
  contextMenuAccessibility: ContextMenuAccessibilityClass;
  timestampUsec: string;
  authorPhoto: AuthorPhoto;
  authorName: AuthorName;
  authorExternalChannelId: string;
  sticker: TickerThumbnailClass;
  moneyChipBackgroundColor: number;
  moneyChipTextColor: number;
  purchaseAmountText: AuthorName;
  stickerDisplayWidth: number;
  stickerDisplayHeight: number;
  backgroundColor: number;
  authorNameTextColor: number;
  trackingParams: string;
}

export enum TrackingParams {
  CAEQl98BIhMILJGE8NTt7QIVxUhgCh14JQT3 = "CAEQl98BIhMIlJGE8NTt7QIVxUhgCh14jQT3",
}

export interface ShowLiveChatTooltipCommand {
  tooltip: Tooltip;
}

export interface Tooltip {
  tooltipRenderer: TooltipRenderer;
}

export interface TooltipRenderer {
  promoConfig: PromoConfig;
  targetId: string;
  detailsText: TextArray;
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

export interface AcceptCommandCommandMetadata {
  webCommandMetadata: TentacledWebCommandMetadata;
}

export interface TentacledWebCommandMetadata {
  sendPost: boolean;
  apiUrl: string;
}

export interface FeedbackEndpoint {
  feedbackToken: string;
  uiActions: UIActions;
}

export interface UIActions {
  hideEnclosingContainer: boolean;
}

export interface ClientMessages {
  reconnectMessage: TextArray;
  unableToReconnectMessage: TextArray;
  fatalError: TextArray;
  reconnectedMessage: TextArray;
  genericError: TextArray;
}

export interface ContinuationElement {
  timedContinuationData: TimedContinuationData;
}

export interface TimedContinuationData {
  timeoutMs: number;
  continuation: string;
  clickTrackingParams: TrackingParams;
}

export interface LiveChatContinuationHeader {
  liveChatHeaderRenderer: LiveChatHeaderRenderer;
}

export interface LiveChatHeaderRenderer {
  overflowMenu: OverflowMenu;
  collapseButton: CollapseButton;
  viewSelector: ViewSelector;
}

export interface CollapseButton {
  buttonRenderer: CollapseButtonButtonRenderer;
}

export interface CollapseButtonButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  accessibility: AccessibilityAccessibility;
  trackingParams: string;
}

export interface OverflowMenu {
  menuRenderer: MenuRenderer;
}

export interface MenuRenderer {
  items: ItemElement[];
  trackingParams: TrackingParams;
  accessibility: ContextMenuAccessibilityClass;
}

export interface ItemElement {
  menuServiceItemRenderer?: MenuItemRenderer;
  menuNavigationItemRenderer?: MenuItemRenderer;
}

export interface MenuItemRenderer {
  text: TextArray;
  icon: Icon;
  navigationEndpoint?: MenuNavigationItemRendererNavigationEndpoint;
  trackingParams: TrackingParams;
  serviceEndpoint?: MenuNavigationItemRendererServiceEndpoint;
}

export interface MenuNavigationItemRendererNavigationEndpoint {
  clickTrackingParams: TrackingParams;
  commandMetadata: CommandCommandMetadata;
  userFeedbackEndpoint: UserFeedbackEndpoint;
}

export interface UserFeedbackEndpoint {
  hack: boolean;
  bucketIdentifier: string;
}

export interface MenuNavigationItemRendererServiceEndpoint {
  clickTrackingParams: TrackingParams;
  showLiveChatParticipantsEndpoint?: SEndpoint;
  popoutLiveChatEndpoint?: PopoutLiveChatEndpoint;
  toggleLiveChatTimestampsEndpoint?: SEndpoint;
}

export interface SEndpoint {
  hack: boolean;
}

export interface ViewSelector {
  sortFilterSubMenuRenderer: SortFilterSubMenuRenderer;
}

export interface SortFilterSubMenuRenderer {
  subMenuItems: SubMenuItem[];
  accessibility: ContextMenuAccessibilityClass;
  trackingParams: string;
}

export interface SubMenuItem {
  title: string;
  selected: boolean;
  continuation: SubMenuItemContinuation;
  accessibility: ContextMenuAccessibilityClass;
  subtitle: string;
}

export interface SubMenuItemContinuation {
  reloadContinuationData: ReloadContinuationData;
}

export interface ReloadContinuationData {
  continuation: string;
  clickTrackingParams: string;
}

export interface ItemList {
  liveChatItemListRenderer: LiveChatItemListRenderer;
}

export interface LiveChatItemListRenderer {
  maxItemsToDisplay: number;
  moreCommentsBelowButton: Button;
  enablePauseChatKeyboardShortcuts: boolean;
}

export interface ParticipantsList {
  liveChatParticipantsListRenderer: LiveChatParticipantsListRenderer;
}

export interface LiveChatParticipantsListRenderer {
  title: TextArray;
  backButton: Button;
  participants: Participant[];
}

export interface Participant {
  liveChatParticipantRenderer: LiveChatParticipantRenderer;
}

export interface LiveChatParticipantRenderer {
  authorName: AuthorName;
  authorPhoto: AuthorPhoto;
  authorBadges: LiveChatParticipantRendererAuthorBadge[];
}

export interface PopoutMessage {
  messageRenderer: PopoutMessageMessageRenderer;
}

export interface PopoutMessageMessageRenderer {
  text: TextArray;
  trackingParams: string;
  button: FluffyButton;
}

export interface FluffyButton {
  buttonRenderer: FluffyButtonRenderer;
}

export interface FluffyButtonRenderer {
  style: string;
  text: TextArray;
  serviceEndpoint: ButtonRendererServiceEndpoint;
  trackingParams: string;
}

export interface ButtonRendererServiceEndpoint {
  clickTrackingParams: string;
  popoutLiveChatEndpoint: PopoutLiveChatEndpoint;
}

export interface Ticker {
  liveChatTickerRenderer: LiveChatTickerRenderer;
}

export interface LiveChatTickerRenderer {
  sentinel: boolean;
}

export interface ResponseContext {
  visitorData: string;
  serviceTrackingParams: ServiceTrackingParam[];
  webResponseContextExtensionData: WebResponseContextExtensionData;
}

export interface ServiceTrackingParam {
  service: string;
  params: Param[];
}

export interface Param {
  key: string;
  value: string;
}

export interface WebResponseContextExtensionData {
  hasDecorated: boolean;
}
