export interface WebPlayerContext {
  config: ContextConfig;
  initialData: InitialData;
}

export interface ContextConfig {
  transparentBackground: boolean;
  useFastSizingOnWatchDefault: boolean;
  showMiniplayerButton: boolean;
  externalFullscreen: boolean;
  showMiniplayerUiWhenMinimized: boolean;
  rootElementId: string;
  jsUrl: string;
  cssUrl: string;
  contextId: string;
  eventLabel: string;
  contentRegion: string;
  hl: string;
  hostLanguage: string;
  playerStyle: string;
  innertubeApiKey: string;
  innertubeApiVersion: string;
  innertubeContextClientVersion: string;
  device: Device;
  serializedExperimentIds: string;
  serializedExperimentFlags: string;
  canaryState: string;
  enableCsiLogging: boolean;
  csiPageType: string;
}

export interface Device {
  brand: string;
  model: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  platform: string;
  interfaceName: string;
  interfaceVersion: string;
}

export interface InitialData {
  responseContext: ResponseContext;
  contents: Contents;
  currentVideoEndpoint: CurrentVideoEndpointClass;
  trackingParams: string;
  playerOverlays: PlayerOverlays;
  overlay: Overlay;
  onResponseReceivedEndpoints: OnResponseReceivedEndpoint[];
  topbar: Topbar;
  frameworkUpdates: FrameworkUpdates;
  webWatchNextResponseExtensionData: WebWatchNextResponseExtensionData;
}

export interface Contents {
  twoColumnWatchNextResults: TwoColumnWatchNextResults;
}

export interface TwoColumnWatchNextResults {
  results: TwoColumnWatchNextResultsResults;
  secondaryResults: TwoColumnWatchNextResultsSecondaryResults;
  autoplay: TwoColumnWatchNextResultsAutoplay;
  conversationBar?: ConversationBar;
}

export interface TwoColumnWatchNextResultsAutoplay {
  autoplay: AutoplayAutoplay;
}

export interface AutoplayAutoplay {
  sets: Set[];
  countDownSecs: number;
  trackingParams: string;
}

export interface Set {
  mode: string;
  autoplayVideo: NavigationEndpoint;
}

export interface NavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: AutoplayVideoCommandMetadata;
  watchEndpoint: AutoplayVideoWatchEndpoint;
}

export interface AutoplayVideoCommandMetadata {
  webCommandMetadata: PurpleWebCommandMetadata;
}

export interface PurpleWebCommandMetadata {
  url: string;
  webPageType: WebPageType;
  rootVe: number;
}

export enum WebPageType {
  WebPageTypeBrowse = "WEB_PAGE_TYPE_BROWSE",
  WebPageTypeChannel = "WEB_PAGE_TYPE_CHANNEL",
  WebPageTypeSearch = "WEB_PAGE_TYPE_SEARCH",
  WebPageTypeUnknown = "WEB_PAGE_TYPE_UNKNOWN",
  WebPageTypeWatch = "WEB_PAGE_TYPE_WATCH",
}

export interface AutoplayVideoWatchEndpoint {
  videoId: string;
  params: string;
  playerParams: string;
  watchEndpointSupportedPrefetchConfig: WatchEndpointSupportedPrefetchConfig;
}

export interface WatchEndpointSupportedPrefetchConfig {
  prefetchHintConfig: PrefetchHintConfig;
}

export interface PrefetchHintConfig {
  prefetchPriority: number;
  countdownUiRelativeSecondsPrefetchCondition: number;
}

export interface ConversationBar {
  liveChatRenderer: LiveChatRenderer;
}

export interface LiveChatRenderer {
  continuations: Continuation[];
  header: Header;
  trackingParams: string;
  clientMessages: ClientMessages;
  initialDisplayState: string;
  showHideButton: ShowHideButton;
}

export interface ClientMessages {
  reconnectMessage: DetailsText;
  unableToReconnectMessage: DetailsText;
  fatalError: DetailsText;
  reconnectedMessage: DetailsText;
  genericError: DetailsText;
}

export interface DetailsText {
  runs: DetailsTextRun[];
}

export interface DetailsTextRun {
  text: string;
}

export interface Continuation {
  reloadContinuationData: ReloadContinuationData;
}

export interface ReloadContinuationData {
  continuation: string;
  clickTrackingParams: string;
}

export interface Header {
  liveChatHeaderRenderer: LiveChatHeaderRenderer;
}

export interface LiveChatHeaderRenderer {
  overflowMenu: OverflowMenu;
  collapseButton: DismissButtonClass;
  viewSelector: ViewSelector;
}

export interface DismissButtonClass {
  buttonRenderer: CollapseButtonButtonRenderer;
}

export interface CollapseButtonButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  accessibility?: AccessibilityAccessibility;
  trackingParams: string;
  text?: DetailsText;
}

export interface AccessibilityAccessibility {
  label: string;
}

export interface OverflowMenu {
  menuRenderer: OverflowMenuMenuRenderer;
}

export interface OverflowMenuMenuRenderer {
  items: PurpleItem[];
  trackingParams: string;
  accessibility: ToggledAccessibilityClass;
}

export interface ToggledAccessibilityClass {
  accessibilityData: AccessibilityAccessibility;
}

export interface PurpleItem {
  menuServiceItemRenderer?: MenuItemRenderer;
  menuNavigationItemRenderer?: MenuItemRenderer;
}

export interface MenuItemRenderer {
  text: DetailsText;
  icon: Icon;
  navigationEndpoint?: MenuNavigationItemRendererNavigationEndpoint;
  trackingParams: string;
  serviceEndpoint?: MenuNavigationItemRendererServiceEndpoint;
}

export interface Icon {
  iconType: string;
}

export interface MenuNavigationItemRendererNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: DefaultNavigationEndpointCommandMetadata;
  userFeedbackEndpoint: UserFeedbackEndpoint;
}

export interface DefaultNavigationEndpointCommandMetadata {
  webCommandMetadata: FluffyWebCommandMetadata;
}

export interface FluffyWebCommandMetadata {
  ignoreNavigation: boolean;
}

export interface UserFeedbackEndpoint {
  hack: boolean;
  bucketIdentifier: string;
}

export interface MenuNavigationItemRendererServiceEndpoint {
  clickTrackingParams: string;
  showLiveChatParticipantsEndpoint?: ShowLiveChatParticipantsEndpointClass;
  popoutLiveChatEndpoint?: PopoutLiveChatEndpoint;
  toggleLiveChatTimestampsEndpoint?: ShowLiveChatParticipantsEndpointClass;
  commandMetadata?: OnResponseReceivedEndpointCommandMetadata;
  signalServiceEndpoint?: ServiceEndpointSignalServiceEndpoint;
}

export interface OnResponseReceivedEndpointCommandMetadata {
  webCommandMetadata: TentacledWebCommandMetadata;
}

export interface TentacledWebCommandMetadata {
  sendPost: boolean;
}

export interface PopoutLiveChatEndpoint {
  url: string;
}

export interface ShowLiveChatParticipantsEndpointClass {
  hack: boolean;
}

export interface ServiceEndpointSignalServiceEndpoint {
  signal: Signal;
  actions: PurpleAction[];
}

export interface PurpleAction {
  clickTrackingParams: string;
  addToPlaylistCommand?: AddToPlaylistCommand;
  openPopupAction?: PurpleOpenPopupAction;
}

export interface AddToPlaylistCommand {
  openMiniplayer: boolean;
  openListPanel: boolean;
  videoId: string;
  listType: ListType;
  onCreateListCommand: OnCreateListCommand;
  videoIds: string[];
}

export enum ListType {
  PlaylistEditListTypeQueue = "PLAYLIST_EDIT_LIST_TYPE_QUEUE",
}

export interface OnCreateListCommand {
  clickTrackingParams: string;
  commandMetadata: OnCreateListCommandCommandMetadata;
  createPlaylistServiceEndpoint: CreatePlaylistServiceEndpoint;
}

export interface OnCreateListCommandCommandMetadata {
  webCommandMetadata: StickyWebCommandMetadata;
}

export interface StickyWebCommandMetadata {
  sendPost: boolean;
  apiUrl?: APIURL;
}

export enum APIURL {
  YoutubeiV1AccountAccountMenu = "/youtubei/v1/account/account_menu",
  YoutubeiV1BrowseEditPlaylist = "/youtubei/v1/browse/edit_playlist",
  YoutubeiV1Feedback = "/youtubei/v1/feedback",
  YoutubeiV1Next = "/youtubei/v1/next",
  YoutubeiV1PlaylistCreate = "/youtubei/v1/playlist/create",
  YoutubeiV1ShareGetSharePanel = "/youtubei/v1/share/get_share_panel",
  YoutubeiV1UpdatedMetadata = "/youtubei/v1/updated_metadata",
}

export interface CreatePlaylistServiceEndpoint {
  videoIds: string[];
  params: Params;
}

export enum Params {
  CAQ3D = "CAQ%3D",
}

export interface PurpleOpenPopupAction {
  popup: PurplePopup;
  popupType: PopupType;
}

export interface PurplePopup {
  notificationActionRenderer: NotificationActionRenderer;
}

export interface NotificationActionRenderer {
  responseText: CancelText;
  trackingParams: string;
}

export interface CancelText {
  simpleText: string;
}

export enum PopupType {
  Toast = "TOAST",
}

export enum Signal {
  ClientSignal = "CLIENT_SIGNAL",
}

export interface ViewSelector {
  sortFilterSubMenuRenderer: SortFilterSubMenuRenderer;
}

export interface SortFilterSubMenuRenderer {
  subMenuItems: SubMenuItem[];
  accessibility: ToggledAccessibilityClass;
  trackingParams: string;
}

export interface SubMenuItem {
  title: string;
  selected: boolean;
  continuation: Continuation;
  accessibility: ToggledAccessibilityClass;
  subtitle: string;
}

export interface ShowHideButton {
  toggleButtonRenderer: ShowHideButtonToggleButtonRenderer;
}

export interface ShowHideButtonToggleButtonRenderer {
  isToggled: boolean;
  isDisabled: boolean;
  defaultText: CancelText;
  toggledText: CancelText;
  trackingParams: string;
}

export interface TwoColumnWatchNextResultsResults {
  results: ResultsResults;
}

export interface ResultsResults {
  contents: ResultsContent[];
  trackingParams: string;
}

export interface ResultsContent {
  videoPrimaryInfoRenderer: VideoPrimaryInfoRenderer;
  videoSecondaryInfoRenderer: VideoSecondaryInfoRenderer;
}

export interface VideoPrimaryInfoRenderer {
  title: DetailsText;
  viewCount?: ViewCount;
  videoActions: VideoActions;
  trackingParams: string;
  updatedMetadataEndpoint: UpdatedMetadataEndpoint;
  sentimentBar: SentimentBar;
  superTitleLink: SuperTitleLink;
  dateText: CancelText;
}

export interface SentimentBar {
  sentimentBarRenderer: SentimentBarRenderer;
}

export interface SentimentBarRenderer {
  percentIfIndifferent: number;
  percentIfLiked: number;
  percentIfDisliked: number;
  likeStatus: string;
  tooltip: string;
}

export interface SuperTitleLink {
  runs: SuperTitleLinkRun[];
}

export interface SuperTitleLinkRun {
  text: string;
  navigationEndpoint?: PurpleNavigationEndpoint;
  loggingDirectives?: LoggingDirectives;
}

export interface LoggingDirectives {
  trackingParams: TrackingParams;
  visibility: Visibility;
}

export enum TrackingParams {
  CJ4BENzXBCITCJrA6OPW7E0CFTRC9QUd9KQHIG = "CJ4BENzXBCITCJrA6oPW7e0CFTRC9QUd9kQHig==",
  CJgBEM2RARgBIhMImsDqg9Bt7QIVNEL1BR32RAEKSPKOisjbvurV3QE = "CJgBEM2rARgBIhMImsDqg9bt7QIVNEL1BR32RAeKSPKOisjbvurV3QE=",
  CKMBEKW3AyITCJrA6OPW7E0CFTRC9QUd9KQHIG = "CKMBEKW3AyITCJrA6oPW7e0CFTRC9QUd9kQHig==",
}

export interface Visibility {
  types: string;
}

export interface PurpleNavigationEndpoint {
  clickTrackingParams: TrackingParams;
  commandMetadata: AutoplayVideoCommandMetadata;
  browseEndpoint?: PurpleBrowseEndpoint;
  urlEndpoint?: PurpleURLEndpoint;
}

export interface PurpleBrowseEndpoint {
  browseId: string;
  params: string;
}

export interface PurpleURLEndpoint {
  url: string;
  target?: string;
  nofollow: boolean;
}

export interface UpdatedMetadataEndpoint {
  clickTrackingParams: string;
  commandMetadata: OnCreateListCommandCommandMetadata;
  updatedMetadataEndpoint: WatchEndpointClass;
}

export interface WatchEndpointClass {
  videoId: string;
}

export interface VideoActions {
  menuRenderer: VideoActionsMenuRenderer;
}

export interface VideoActionsMenuRenderer {
  trackingParams: string;
  topLevelButtons: TopLevelButton[];
}

export interface TopLevelButton {
  toggleButtonRenderer?: TopLevelButtonToggleButtonRenderer;
  buttonRenderer?: TopLevelButtonButtonRenderer;
}

export interface TopLevelButtonButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text?: DetailsText;
  serviceEndpoint?: ButtonRendererServiceEndpoint;
  icon: Icon;
  accessibility: AccessibilityAccessibility;
  tooltip: string;
  trackingParams: string;
  navigationEndpoint?: FluffyNavigationEndpoint;
  accessibilityData?: ToggledAccessibilityClass;
}

export interface FluffyNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: DefaultNavigationEndpointCommandMetadata;
  modalEndpoint: PurpleModalEndpoint;
}

export interface PurpleModalEndpoint {
  modal: PurpleModal;
}

export interface PurpleModal {
  modalWithTitleAndButtonRenderer: PurpleModalWithTitleAndButtonRenderer;
}

export interface PurpleModalWithTitleAndButtonRenderer {
  title: CancelText;
  content: ShortViewCountText;
  button: PurpleButton;
}

export interface PurpleButton {
  buttonRenderer: PurpleButtonRenderer;
}

export interface PurpleButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: CancelText;
  navigationEndpoint: TentacledNavigationEndpoint;
  trackingParams: string;
}

export interface TentacledNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: AutoplayVideoCommandMetadata;
  signInEndpoint: PurpleSignInEndpoint;
}

export interface PurpleSignInEndpoint {
  nextEndpoint?: CurrentVideoEndpointClass;
  idamTag?: string;
  hack?: boolean;
}

export interface CurrentVideoEndpointClass {
  clickTrackingParams: string;
  commandMetadata: AutoplayVideoCommandMetadata;
  watchEndpoint: WatchEndpointClass;
}

export interface ShortViewCountText {
  simpleText?: string;
  runs?: DetailsTextRun[];
}

export interface ButtonRendererServiceEndpoint {
  clickTrackingParams: string;
  commandMetadata: OnCreateListCommandCommandMetadata;
  shareEntityServiceEndpoint: ShareEntityServiceEndpoint;
}

export interface ShareEntityServiceEndpoint {
  serializedShareEntity: string;
  commands: Command[];
}

export interface Command {
  clickTrackingParams: string;
  openPopupAction: CommandOpenPopupAction;
}

export interface CommandOpenPopupAction {
  popup: FluffyPopup;
  popupType: string;
  beReused: boolean;
}

export interface FluffyPopup {
  unifiedSharePanelRenderer: UnifiedSharePanelRenderer;
}

export interface UnifiedSharePanelRenderer {
  trackingParams: string;
  showLoadingSpinner: boolean;
}

export interface TopLevelButtonToggleButtonRenderer {
  style: StyleClass;
  isToggled: boolean;
  isDisabled: boolean;
  defaultIcon: Icon;
  defaultText: LengthText;
  toggledText: LengthText;
  accessibility: AccessibilityAccessibility;
  trackingParams: string;
  defaultTooltip: string;
  toggledTooltip: string;
  toggledStyle: StyleClass;
  defaultNavigationEndpoint: DefaultNavigationEndpoint;
  accessibilityData: ToggledAccessibilityClass;
  toggleButtonSupportedData: ToggleButtonSupportedData;
  targetId: string;
}

export interface DefaultNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: DefaultNavigationEndpointCommandMetadata;
  modalEndpoint: DefaultNavigationEndpointModalEndpoint;
}

export interface DefaultNavigationEndpointModalEndpoint {
  modal: FluffyModal;
}

export interface FluffyModal {
  modalWithTitleAndButtonRenderer: FluffyModalWithTitleAndButtonRenderer;
}

export interface FluffyModalWithTitleAndButtonRenderer {
  title: CancelText;
  content: CancelText;
  button: FluffyButton;
}

export interface FluffyButton {
  buttonRenderer: FluffyButtonRenderer;
}

export interface FluffyButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: CancelText;
  navigationEndpoint: StickyNavigationEndpoint;
  trackingParams: string;
}

export interface StickyNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: AutoplayVideoCommandMetadata;
  signInEndpoint: FluffySignInEndpoint;
}

export interface FluffySignInEndpoint {
  nextEndpoint: CurrentVideoEndpointClass;
  idamTag: string;
}

export interface LengthText {
  accessibility: ToggledAccessibilityClass;
  simpleText: string;
}

export interface StyleClass {
  styleType: string;
}

export interface ToggleButtonSupportedData {
  toggleButtonIdData: ToggleButtonIDData;
}

export interface ToggleButtonIDData {
  id: string;
}

export interface ViewCount {
  videoViewCountRenderer: VideoViewCountRenderer;
}

export interface VideoViewCountRenderer {
  viewCount: Text;
  shortViewCount?: Text;
  isLive?: boolean;
}

export interface VideoSecondaryInfoRenderer {
  owner: Owner;
  description: SuperTitleLink;
  subscribeButton: SubscribeButton;
  metadataRowContainer: MetadataRowContainer;
  showMoreText: DetailsText;
  showLessText: DetailsText;
  trackingParams: string;
  defaultExpanded: boolean;
  descriptionCollapsedLines: number;
}

export interface MetadataRowContainer {
  metadataRowContainerRenderer: MetadataRowContainerRenderer;
}

export interface MetadataRowContainerRenderer {
  rows: Row[];
  collapsedItemCount: number;
  trackingParams: string;
}

export interface Row {
  richMetadataRowRenderer: RichMetadataRowRenderer;
}

export interface RichMetadataRowRenderer {
  contents: RichMetadataRowRendererContent[];
  trackingParams: string;
}

export interface RichMetadataRowRendererContent {
  richMetadataRenderer: RichMetadataRenderer;
}

export interface RichMetadataRenderer {
  style: string;
  thumbnail: Background;
  title: CancelText;
  subtitle?: CancelText;
  callToAction: CancelText;
  callToActionIcon: Icon;
  endpoint: Endpoint;
  trackingParams: string;
}

export interface Endpoint {
  clickTrackingParams: string;
  commandMetadata: AutoplayVideoCommandMetadata;
  browseEndpoint: EndpointBrowseEndpoint;
}

export interface EndpointBrowseEndpoint {
  browseId: string;
}

export interface Background {
  thumbnails: Thumbnail[];
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Owner {
  videoOwnerRenderer: VideoOwnerRenderer;
}

export interface VideoOwnerRenderer {
  thumbnail: Background;
  title: Byline;
  navigationEndpoint: VideoOwnerRendererNavigationEndpoint;
  subscriberCountText: DetailsText;
  trackingParams: string;
  badges: OwnerBadgeElement[];
  membershipButton: MembershipButton;
}

export interface OwnerBadgeElement {
  metadataBadgeRenderer: OwnerBadgeMetadataBadgeRenderer;
}

export interface OwnerBadgeMetadataBadgeRenderer {
  icon: Icon;
  style: PurpleStyle;
  tooltip: Tooltip;
  trackingParams: string;
}

export enum PurpleStyle {
  BadgeStyleTypeVerified = "BADGE_STYLE_TYPE_VERIFIED",
}

export enum Tooltip {
  確認済み = "確認済み",
}

export interface MembershipButton {
  buttonRenderer: MembershipButtonButtonRenderer;
}

export interface MembershipButtonButtonRenderer {
  style: string;
  size: string;
  text: DetailsText;
  navigationEndpoint: IndigoNavigationEndpoint;
  trackingParams: string;
  accessibilityData: ToggledAccessibilityClass;
  targetId: string;
}

export interface IndigoNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: DefaultNavigationEndpointCommandMetadata;
  modalEndpoint: FluffyModalEndpoint;
}

export interface FluffyModalEndpoint {
  modal: TentacledModal;
}

export interface TentacledModal {
  modalWithTitleAndButtonRenderer: TentacledModalWithTitleAndButtonRenderer;
}

export interface TentacledModalWithTitleAndButtonRenderer {
  title: CancelText;
  content: CancelText;
  button: TentacledButton;
}

export interface TentacledButton {
  buttonRenderer: TentacledButtonRenderer;
}

export interface TentacledButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: CancelText;
  navigationEndpoint: IndecentNavigationEndpoint;
  trackingParams: string;
}

export interface IndecentNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: AutoplayVideoCommandMetadata;
  signInEndpoint: ShowLiveChatParticipantsEndpointClass;
}

export interface VideoOwnerRendererNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: AutoplayVideoCommandMetadata;
  browseEndpoint: FluffyBrowseEndpoint;
}

export interface FluffyBrowseEndpoint {
  browseId: string;
  canonicalBaseUrl: string;
}

export interface Byline {
  runs: BylineRun[];
}

export interface BylineRun {
  text: string;
  navigationEndpoint: Endpoint;
}

export interface SubscribeButton {
  buttonRenderer: SubscribeButtonButtonRenderer;
}

export interface SubscribeButtonButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: DetailsText;
  navigationEndpoint: HilariousNavigationEndpoint;
  trackingParams: string;
  targetId: string;
}

export interface HilariousNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: DefaultNavigationEndpointCommandMetadata;
  modalEndpoint: TentacledModalEndpoint;
}

export interface TentacledModalEndpoint {
  modal: StickyModal;
}

export interface StickyModal {
  modalWithTitleAndButtonRenderer: StickyModalWithTitleAndButtonRenderer;
}

export interface StickyModalWithTitleAndButtonRenderer {
  title: CancelText;
  content: CancelText;
  button: StickyButton;
}

export interface StickyButton {
  buttonRenderer: StickyButtonRenderer;
}

export interface StickyButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: CancelText;
  navigationEndpoint: AmbitiousNavigationEndpoint;
  trackingParams: string;
}

export interface AmbitiousNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: AutoplayVideoCommandMetadata;
  signInEndpoint: TentacledSignInEndpoint;
}

export interface TentacledSignInEndpoint {
  nextEndpoint: CurrentVideoEndpointClass;
  continueAction: string;
  idamTag: string;
}

export interface TwoColumnWatchNextResultsSecondaryResults {
  secondaryResults: SecondaryResultsSecondaryResults;
}

export interface SecondaryResultsSecondaryResults {
  results: SecondaryResultsResult[];
  trackingParams: string;
  targetId: string;
}

export interface SecondaryResultsResult {
  compactAutoplayRenderer?: CompactAutoplayRenderer;
  compactVideoRenderer?: ResultCompactVideoRenderer;
  continuationItemRenderer?: ContinuationItemRenderer;
}

export interface CompactAutoplayRenderer {
  title: CancelText;
  toggleDescription: DetailsText;
  infoIcon: Icon;
  infoText: DetailsText;
  contents: CompactAutoplayRendererContent[];
  trackingParams: string;
}

export interface CompactAutoplayRendererContent {
  compactVideoRenderer: ContentCompactVideoRenderer;
}

export interface ContentCompactVideoRenderer {
  videoId: string;
  thumbnail: Background;
  title: LengthText;
  longBylineText: BylineText;
  publishedTimeText: CancelText;
  viewCountText: CancelText;
  lengthText: LengthText;
  navigationEndpoint: CompactVideoRendererNavigationEndpoint;
  shortBylineText: BylineText;
  badges: PurpleBadge[];
  channelThumbnail: Background;
  ownerBadges: OwnerBadgeElement[];
  trackingParams: string;
  shortViewCountText: CancelText;
  menu: Menu;
  thumbnailOverlays: CompactVideoRendererThumbnailOverlay[];
  accessibility: ToggledAccessibilityClass;
}

export interface PurpleBadge {
  metadataBadgeRenderer: PurpleMetadataBadgeRenderer;
}

export interface PurpleMetadataBadgeRenderer {
  style: FluffyStyle;
  label: Label;
  trackingParams: string;
}

export enum Label {
  ライブ配信中 = "ライブ配信中",
  新着 = "新着",
}

export enum FluffyStyle {
  BadgeStyleTypeLiveNow = "BADGE_STYLE_TYPE_LIVE_NOW",
  BadgeStyleTypeSimple = "BADGE_STYLE_TYPE_SIMPLE",
}

export interface BylineText {
  runs: LongBylineTextRun[];
}

export interface LongBylineTextRun {
  text: string;
  navigationEndpoint: VideoOwnerRendererNavigationEndpoint;
}

export interface Menu {
  menuRenderer: MenuMenuRenderer;
}

export interface MenuMenuRenderer {
  items: FluffyItem[];
  trackingParams: string;
  accessibility: ToggledAccessibilityClass;
  targetId?: string;
}

export interface FluffyItem {
  menuServiceItemRenderer: MenuItemRenderer;
}

export interface CompactVideoRendererNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: AutoplayVideoCommandMetadata;
  watchEndpoint: PurpleWatchEndpoint;
}

export interface PurpleWatchEndpoint {
  videoId: string;
  nofollow: boolean;
}

export interface CompactVideoRendererThumbnailOverlay {
  thumbnailOverlayTimeStatusRenderer?: PurpleThumbnailOverlayTimeStatusRenderer;
  thumbnailOverlayToggleButtonRenderer?: ThumbnailOverlayToggleButtonRenderer;
  thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer;
}

export interface ThumbnailOverlayNowPlayingRenderer {
  text: DetailsText;
}

export interface PurpleThumbnailOverlayTimeStatusRenderer {
  text: LengthText;
  style: ThumbnailOverlayTimeStatusRendererStyle;
}

export enum ThumbnailOverlayTimeStatusRendererStyle {
  Default = "DEFAULT",
  Live = "LIVE",
}

export interface ThumbnailOverlayToggleButtonRenderer {
  isToggled?: boolean;
  untoggledIcon: Icon;
  toggledIcon: Icon;
  untoggledTooltip: UntoggledTooltip;
  toggledTooltip: ToggledTooltip;
  untoggledServiceEndpoint: UntoggledServiceEndpoint;
  toggledServiceEndpoint?: ToggledServiceEndpoint;
  untoggledAccessibility: ToggledAccessibilityClass;
  toggledAccessibility: ToggledAccessibilityClass;
  trackingParams: string;
}

export interface ToggledServiceEndpoint {
  clickTrackingParams: string;
  commandMetadata: OnCreateListCommandCommandMetadata;
  playlistEditEndpoint: ToggledServiceEndpointPlaylistEditEndpoint;
}

export interface ToggledServiceEndpointPlaylistEditEndpoint {
  playlistId: PlaylistID;
  actions: FluffyAction[];
}

export interface FluffyAction {
  action: HilariousAction;
  removedVideoId: string;
}

export enum HilariousAction {
  ActionRemoveVideoByVideoID = "ACTION_REMOVE_VIDEO_BY_VIDEO_ID",
}

export enum PlaylistID {
  Wl = "WL",
}

export enum ToggledTooltip {
  追加済み = "追加済み",
}

export interface UntoggledServiceEndpoint {
  clickTrackingParams: string;
  commandMetadata: OnCreateListCommandCommandMetadata;
  playlistEditEndpoint?: UntoggledServiceEndpointPlaylistEditEndpoint;
  signalServiceEndpoint?: UntoggledServiceEndpointSignalServiceEndpoint;
}

export interface UntoggledServiceEndpointPlaylistEditEndpoint {
  playlistId: PlaylistID;
  actions: TentacledAction[];
}

export interface TentacledAction {
  addedVideoId: string;
  action: AmbitiousAction;
}

export enum AmbitiousAction {
  ActionAddVideo = "ACTION_ADD_VIDEO",
}

export interface UntoggledServiceEndpointSignalServiceEndpoint {
  signal: Signal;
  actions: StickyAction[];
}

export interface StickyAction {
  clickTrackingParams: string;
  addToPlaylistCommand: AddToPlaylistCommand;
}

export enum UntoggledTooltip {
  キューに追加 = "キューに追加",
  後で見る = "後で見る",
}

export interface ResultCompactVideoRenderer {
  videoId: string;
  thumbnail: Background;
  title: LengthText;
  longBylineText: BylineText;
  publishedTimeText?: CancelText;
  viewCountText: ShortViewCountText;
  lengthText?: LengthText;
  navigationEndpoint: CompactVideoRendererNavigationEndpoint;
  shortBylineText: BylineText;
  badges?: PurpleBadge[];
  channelThumbnail: Background;
  ownerBadges?: OwnerBadgeElement[];
  trackingParams: string;
  shortViewCountText: ShortViewCountText;
  menu: Menu;
  thumbnailOverlays: CompactVideoRendererThumbnailOverlay[];
  accessibility: ToggledAccessibilityClass;
}

export interface ContinuationItemRenderer {
  trigger: string;
  continuationEndpoint: ContinuationEndpoint;
  button: ContinuationItemRendererButton;
}

export interface ContinuationItemRendererButton {
  buttonRenderer: IndigoButtonRenderer;
}

export interface IndigoButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: DetailsText;
  trackingParams: string;
  command: ContinuationEndpoint;
}

export interface ContinuationEndpoint {
  clickTrackingParams: string;
  commandMetadata: OnCreateListCommandCommandMetadata;
  continuationCommand: ContinuationCommand;
}

export interface ContinuationCommand {
  token: string;
  request: string;
}

export interface FrameworkUpdates {}

export interface OnResponseReceivedEndpoint {
  clickTrackingParams: string;
  commandMetadata: OnResponseReceivedEndpointCommandMetadata;
  signalServiceEndpoint: OnResponseReceivedEndpointSignalServiceEndpoint;
}

export interface OnResponseReceivedEndpointSignalServiceEndpoint {
  signal: Signal;
  actions: IndigoAction[];
}

export interface IndigoAction {
  clickTrackingParams: string;
  signalAction: SignalAction;
}

export interface SignalAction {
  signal: string;
}

export interface Overlay {
  tooltipRenderer: TooltipRenderer;
}

export interface TooltipRenderer {
  promoConfig: PromoConfig;
  targetId: string;
  text: DetailsText;
  detailsText: DetailsText;
  dismissButton: DismissButton;
  suggestedPosition: DismissStrategy;
  dismissStrategy: DismissStrategy;
  trackingParams: string;
}

export interface DismissButton {
  buttonRenderer: IndecentButtonRenderer;
}

export interface IndecentButtonRenderer {
  style: string;
  size: string;
  text: DetailsText;
  trackingParams: string;
  command: AcceptCommand;
}

export interface AcceptCommand {
  clickTrackingParams: string;
  commandMetadata: OnCreateListCommandCommandMetadata;
  feedbackEndpoint: FeedbackEndpoint;
}

export interface FeedbackEndpoint {
  feedbackToken: string;
  uiActions: UIActions;
}

export interface UIActions {
  hideEnclosingContainer: boolean;
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

export interface PlayerOverlays {
  playerOverlayRenderer: PlayerOverlayRenderer;
}

export interface PlayerOverlayRenderer {
  endScreen: EndScreen;
  autoplay: PlayerOverlayRendererAutoplay;
  shareButton: ShareButton;
}

export interface PlayerOverlayRendererAutoplay {
  playerOverlayAutoplayRenderer: PlayerOverlayAutoplayRenderer;
}

export interface PlayerOverlayAutoplayRenderer {
  title: CancelText;
  videoTitle: CancelText;
  byline: Byline;
  cancelText: CancelText;
  pauseText: CancelText;
  background: Background;
  countDownSecs: number;
  nextButton: NextButton;
  trackingParams: string;
  preferImmediateRedirect: boolean;
  videoId: string;
  publishedTimeText: CancelText;
  webShowNewAutonavCountdown: boolean;
  webShowBigThumbnailEndscreen: boolean;
  shortViewCountText: CancelText;
}

export interface NextButton {
  buttonRenderer: NextButtonButtonRenderer;
}

export interface NextButtonButtonRenderer {
  navigationEndpoint: CurrentVideoEndpointClass;
  accessibility: AccessibilityAccessibility;
  trackingParams: string;
}

export interface EndScreen {
  watchNextEndScreenRenderer: WatchNextEndScreenRenderer;
}

export interface WatchNextEndScreenRenderer {
  results: WatchNextEndScreenRendererResult[];
  title: CancelText;
  trackingParams: string;
}

export interface WatchNextEndScreenRendererResult {
  endScreenVideoRenderer: EndScreenVideoRenderer;
}

export interface EndScreenVideoRenderer {
  videoId: string;
  thumbnail: Background;
  title: LengthText;
  shortBylineText: BylineText;
  lengthText?: LengthText;
  lengthInSeconds?: number;
  navigationEndpoint: CurrentVideoEndpointClass;
  trackingParams: string;
  shortViewCountText: ShortViewCountText;
  publishedTimeText: CancelText;
  thumbnailOverlays: EndScreenVideoRendererThumbnailOverlay[];
}

export interface EndScreenVideoRendererThumbnailOverlay {
  thumbnailOverlayTimeStatusRenderer?: FluffyThumbnailOverlayTimeStatusRenderer;
  thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer;
}

export interface FluffyThumbnailOverlayTimeStatusRenderer {
  text: Text;
  style: ThumbnailOverlayTimeStatusRendererStyle;
  icon?: Icon;
}

export interface Text {
  accessibility: ToggledAccessibilityClass;
  simpleText?: string;
  runs?: DetailsTextRun[];
}

export interface ShareButton {
  buttonRenderer: ShareButtonButtonRenderer;
}

export interface ShareButtonButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  icon: Icon;
  navigationEndpoint: CunningNavigationEndpoint;
  tooltip: string;
  trackingParams: string;
}

export interface CunningNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: DefaultNavigationEndpointCommandMetadata;
  shareEntityEndpoint: ShareEntityEndpoint;
}

export interface ShareEntityEndpoint {
  serializedShareEntity: string;
}

export interface ResponseContext {
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
  ytConfigData: YtConfigData;
  webPrefetchData: WebPrefetchData;
  hasDecorated: boolean;
}

export interface WebPrefetchData {
  navigationEndpoints: NavigationEndpoint[];
}

export interface YtConfigData {
  visitorData: string;
  rootVisualElementType: number;
}

export interface Topbar {
  desktopTopbarRenderer: DesktopTopbarRenderer;
}

export interface DesktopTopbarRenderer {
  logo: Logo;
  searchbox: Searchbox;
  trackingParams: string;
  countryCode: string;
  topbarButtons: TopbarButton[];
  hotkeyDialog: HotkeyDialog;
  backButton: BackButtonClass;
  forwardButton: BackButtonClass;
  a11ySkipNavigationButton: A11YSkipNavigationButton;
}

export interface A11YSkipNavigationButton {
  buttonRenderer: A11YSkipNavigationButtonButtonRenderer;
}

export interface A11YSkipNavigationButtonButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: DetailsText;
  trackingParams: string;
  command: OnResponseReceivedEndpoint;
}

export interface BackButtonClass {
  buttonRenderer: BackButtonButtonRenderer;
}

export interface BackButtonButtonRenderer {
  trackingParams: string;
  command: OnResponseReceivedEndpoint;
}

export interface HotkeyDialog {
  hotkeyDialogRenderer: HotkeyDialogRenderer;
}

export interface HotkeyDialogRenderer {
  title: DetailsText;
  sections: HotkeyDialogRendererSection[];
  dismissButton: DismissButtonClass;
  trackingParams: string;
}

export interface HotkeyDialogRendererSection {
  hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer;
}

export interface HotkeyDialogSectionRenderer {
  title: DetailsText;
  options: Option[];
}

export interface Option {
  hotkeyDialogSectionOptionRenderer: HotkeyDialogSectionOptionRenderer;
}

export interface HotkeyDialogSectionOptionRenderer {
  label: DetailsText;
  hotkey: string;
  hotkeyAccessibilityLabel?: ToggledAccessibilityClass;
}

export interface Logo {
  topbarLogoRenderer: TopbarLogoRenderer;
}

export interface TopbarLogoRenderer {
  iconImage: Icon;
  tooltipText: DetailsText;
  endpoint: Endpoint;
  trackingParams: string;
}

export interface Searchbox {
  fusionSearchboxRenderer: FusionSearchboxRenderer;
}

export interface FusionSearchboxRenderer {
  icon: Icon;
  placeholderText: DetailsText;
  config: FusionSearchboxRendererConfig;
  trackingParams: string;
  searchEndpoint: FusionSearchboxRendererSearchEndpoint;
}

export interface FusionSearchboxRendererConfig {
  webSearchboxConfig: WebSearchboxConfig;
}

export interface WebSearchboxConfig {
  requestLanguage: string;
  requestDomain: string;
  hasOnscreenKeyboard: boolean;
  focusSearchbox: boolean;
}

export interface FusionSearchboxRendererSearchEndpoint {
  clickTrackingParams: string;
  commandMetadata: AutoplayVideoCommandMetadata;
  searchEndpoint: SearchEndpointSearchEndpoint;
}

export interface SearchEndpointSearchEndpoint {
  query: string;
}

export interface TopbarButton {
  topbarMenuButtonRenderer?: TopbarMenuButtonRenderer;
  buttonRenderer?: TopbarButtonButtonRenderer;
}

export interface TopbarButtonButtonRenderer {
  style: string;
  size: string;
  text: DetailsText;
  icon: Icon;
  navigationEndpoint: MagentaNavigationEndpoint;
  trackingParams: string;
  targetId: string;
}

export interface MagentaNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: AutoplayVideoCommandMetadata;
  signInEndpoint: StickySignInEndpoint;
}

export interface StickySignInEndpoint {
  idamTag: string;
}

export interface TopbarMenuButtonRenderer {
  icon: Icon;
  menuRenderer?: TopbarMenuButtonRendererMenuRenderer;
  trackingParams: string;
  accessibility: ToggledAccessibilityClass;
  tooltip: string;
  style: string;
  targetId?: string;
  menuRequest?: MenuRequest;
}

export interface TopbarMenuButtonRendererMenuRenderer {
  multiPageMenuRenderer: MenuRendererMultiPageMenuRenderer;
}

export interface MenuRendererMultiPageMenuRenderer {
  sections: MultiPageMenuRendererSection[];
  trackingParams: string;
}

export interface MultiPageMenuRendererSection {
  multiPageMenuSectionRenderer: MultiPageMenuSectionRenderer;
}

export interface MultiPageMenuSectionRenderer {
  items: MultiPageMenuSectionRendererItem[];
  trackingParams: string;
}

export interface MultiPageMenuSectionRendererItem {
  compactLinkRenderer: CompactLinkRenderer;
}

export interface CompactLinkRenderer {
  icon: Icon;
  title: DetailsText;
  navigationEndpoint: CompactLinkRendererNavigationEndpoint;
  trackingParams: string;
}

export interface CompactLinkRendererNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: AutoplayVideoCommandMetadata;
  urlEndpoint: FluffyURLEndpoint;
}

export interface FluffyURLEndpoint {
  url: string;
  target: string;
}

export interface MenuRequest {
  clickTrackingParams: string;
  commandMetadata: OnCreateListCommandCommandMetadata;
  signalServiceEndpoint: MenuRequestSignalServiceEndpoint;
}

export interface MenuRequestSignalServiceEndpoint {
  signal: string;
  actions: IndecentAction[];
}

export interface IndecentAction {
  clickTrackingParams: string;
  openPopupAction: FluffyOpenPopupAction;
}

export interface FluffyOpenPopupAction {
  popup: TentacledPopup;
  popupType: string;
  beReused: boolean;
}

export interface TentacledPopup {
  multiPageMenuRenderer: PopupMultiPageMenuRenderer;
}

export interface PopupMultiPageMenuRenderer {
  trackingParams: string;
  style: string;
  showLoadingSpinner: boolean;
}

export interface WebWatchNextResponseExtensionData {
  relatedVideoArgs: string;
}
