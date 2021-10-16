import {
  UIActions,
  YTClientMessages,
  YTIcon,
  YTOverflowMenu,
  YTRun,
  YTRunContainer,
  YTSimpleTextContainer,
  YTText,
  YTThumbnailList,
  YTWebPageType,
} from "./chat";

export interface YTPlayabilityStatus {
  status:
    | "ERROR" // -> Deleted OR mistyped video id
    | "LOGIN_REQUIRED" // -> Privated
    | "UNPLAYABLE" // -> Unarchived OR members-only stream
    | "LIVE_STREAM_OFFLINE" // -> Offline (pre-stream OR abandoned stream)
    | "OK"; // -> Live chat OR replay chat is available
  contextParams: string;
  // if not OK
  reason?: string;
  errorScreen?: {
    playerErrorMessageRenderer?: {
      reason: YTSimpleTextContainer;
      thumbnail: YTThumbnailList;
      icon: YTIcon;
    };
    // if UNPLAYABLE (members-only)
    playerLegacyDesktopYpcOfferRenderer?: {
      itemTitle: "Members-only content";
      itemThumbnail: string;
      offerDescription: string;
      offerId: "sponsors_only_video";
    };
  };
  // if UNPLAYABLE (members-only)
  skip?: {
    playabilityErrorSkipConfig: {
      skipOnPlayabilityError: boolean;
    };
  };
  // if OK
  miniplayer?: {
    miniplayerRenderer: {
      playbackMode: "PLAYBACK_MODE_ALLOW"; // TODO: find others
    };
  };
  // if LIVE_STREAM_OFFLINE
  liveStreamability?: {
    liveStreamabilityRenderer: {
      videoId: string;
      offlineSlate: {
        liveStreamOfflineSlateRenderer: {
          scheduledStartTime: string;
          mainText: YTRunContainer;
          subtitleText: YTSimpleTextContainer;
          thumbnail: YTThumbnailList;
          pollDelayMs: string;
        };
      };
    };
  };
  // if OK or LIVE_STREAM_OFFLINE
  playableInEmbed?: boolean;
}

export interface YTContextConfig {
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
  device: YTDevice;
  serializedExperimentIds: string;
  serializedExperimentFlags: string;
  canaryState: string;
  enableCsiLogging: boolean;
  csiPageType: string;
}

export interface YTDevice {
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

export interface YTInitialData {
  responseContext: YTResponseContext;
  contents?: YTContents;
  currentVideoEndpoint: CurrentVideoEndpointClass;
  trackingParams: string;
  playerOverlays: PlayerOverlays;
  overlay: Overlay;
  onResponseReceivedEndpoints: OnResponseReceivedEndpoint[];
  topbar: Topbar;
  frameworkUpdates: FrameworkUpdates;
  webWatchNextResponseExtensionData: YTWebWatchNextResponseExtensionData;
}

export interface YTContents {
  twoColumnWatchNextResults?: YTTwoColumnWatchNextResults;
}

export interface YTTwoColumnWatchNextResults {
  results: TwoColumnWatchNextResultsResults;
  secondaryResults: YTTwoColumnWatchNextResultsSecondaryResults;
  autoplay: YTTwoColumnWatchNextResultsAutoplay;
  conversationBar?: YTConversationBar;
}

export interface YTTwoColumnWatchNextResultsAutoplay {
  autoplay: YTAutoplayAutoplay;
}

export interface YTAutoplayAutoplay {
  sets: YTSet[];
  countDownSecs: number;
  trackingParams: string;
}

export interface YTSet {
  mode: string;
  autoplayVideo: YTNavigationEndpoint;
}

export interface YTNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTAutoplayVideoCommandMetadata;
  watchEndpoint: YTAutoplayVideoWatchEndpoint;
}

export interface YTAutoplayVideoCommandMetadata {
  webCommandMetadata: YTPurpleWebCommandMetadata;
}

export interface YTPurpleWebCommandMetadata {
  url: string;
  webPageType: YTWebPageType;
  rootVe: number;
}

export interface YTAutoplayVideoWatchEndpoint {
  videoId: string;
  params: string;
  playerParams: string;
  watchEndpointSupportedPrefetchConfig: YTWatchEndpointSupportedPrefetchConfig;
}

export interface YTWatchEndpointSupportedPrefetchConfig {
  prefetchHintConfig: YTPrefetchHintConfig;
}

export interface YTPrefetchHintConfig {
  prefetchPriority: number;
  countdownUiRelativeSecondsPrefetchCondition: number;
}

export interface YTConversationBar {
  liveChatRenderer: YTLiveChatRenderer;
}

export interface YTLiveChatRenderer {
  continuations: YTReloadContinuation[];
  header: YTHeader;
  trackingParams: string;
  clientMessages: YTClientMessages;
  initialDisplayState: string;
  showHideButton: YTShowHideButton;
}

export interface YTReloadContinuation {
  reloadContinuationData: YTReloadContinuationData;
}

export interface YTReloadContinuationData {
  continuation: string;
  clickTrackingParams: string;
}

export interface YTHeader {
  liveChatHeaderRenderer: YTLiveChatHeaderRenderer;
}

export interface YTLiveChatHeaderRenderer {
  overflowMenu: YTOverflowMenu;
  collapseButton: YTDismissButtonClass;
  viewSelector: ViewSelector;
}

export interface YTDismissButtonClass {
  buttonRenderer: YTCollapseButtonButtonRenderer;
}

export interface YTCollapseButtonButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  accessibility?: YTAccessibilityLabel;
  trackingParams: string;
  text?: YTRunContainer;
}

export interface YTAccessibilityData {
  accessibilityData: YTAccessibilityLabel;
}

export interface YTAccessibilityLabel {
  label: string;
}

export interface YTPurpleItem {
  menuServiceItemRenderer?: YTMenuItemRenderer;
  menuNavigationItemRenderer?: YTMenuItemRenderer;
}

export interface YTMenuItemRenderer {
  text: YTRunContainer;
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
  onCreateListCommand: YTOnCreateListCommand;
  videoIds: string[];
}

export enum ListType {
  PlaylistEditListTypeQueue = "PLAYLIST_EDIT_LIST_TYPE_QUEUE",
}

export interface YTOnCreateListCommand {
  clickTrackingParams: string;
  commandMetadata: YTOnCreateListCommandCommandMetadata;
  createPlaylistServiceEndpoint: YTCreatePlaylistServiceEndpoint;
}

export interface YTOnCreateListCommandCommandMetadata {
  webCommandMetadata: StickyWebCommandMetadata;
}

export interface StickyWebCommandMetadata {
  sendPost: boolean;
  apiUrl?: string;
}

export interface YTCreatePlaylistServiceEndpoint {
  videoIds: string[];
  params: string;
}

export interface PurpleOpenPopupAction {
  popup: PurplePopup;
  popupType: PopupType;
}

export interface PurplePopup {
  notificationActionRenderer: NotificationActionRenderer;
}

export interface NotificationActionRenderer {
  responseText: YTSimpleTextContainer;
  trackingParams: string;
}

export interface ShortViewCountText {
  simpleText?: string;
  runs?: YTRun[];
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
  accessibility: YTAccessibilityData;
  trackingParams: string;
}

export interface SubMenuItem {
  title: string;
  selected: boolean;
  continuation: YTReloadContinuation;
  accessibility: YTAccessibilityData;
  subtitle: string;
}

export interface YTShowHideButton {
  toggleButtonRenderer: ShowHideButtonToggleButtonRenderer;
}

export interface ShowHideButtonToggleButtonRenderer {
  isToggled: boolean;
  isDisabled: boolean;
  defaultText: YTSimpleTextContainer;
  toggledText: YTSimpleTextContainer;
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
  title: YTRunContainer;
  viewCount?: ViewCount;
  videoActions: VideoActions;
  trackingParams: string;
  updatedMetadataEndpoint: UpdatedMetadataEndpoint;
  sentimentBar: SentimentBar;
  badges?: MetadataBadgeRendererContainer[];
  superTitleLink: SuperTitleLink;
  dateText: YTSimpleTextContainer;
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
  loggingDirectives?: any;
}

export interface PurpleNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTAutoplayVideoCommandMetadata;
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
  commandMetadata: YTOnCreateListCommandCommandMetadata;
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
  text?: YTRunContainer;
  serviceEndpoint?: ButtonRendererServiceEndpoint;
  icon: Icon;
  accessibility: YTAccessibilityLabel;
  tooltip: string;
  trackingParams: string;
  navigationEndpoint?: FluffyNavigationEndpoint;
  accessibilityData?: YTAccessibilityData;
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
  title: YTSimpleTextContainer;
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
  text: YTSimpleTextContainer;
  navigationEndpoint: TentacledNavigationEndpoint;
  trackingParams: string;
}

export interface TentacledNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTAutoplayVideoCommandMetadata;
  signInEndpoint: PurpleSignInEndpoint;
}

export interface PurpleSignInEndpoint {
  nextEndpoint?: CurrentVideoEndpointClass;
  idamTag?: string;
  hack?: boolean;
}

export interface CurrentVideoEndpointClass {
  clickTrackingParams: string;
  commandMetadata: YTAutoplayVideoCommandMetadata;
  watchEndpoint: WatchEndpointClass;
}

export interface ButtonRendererServiceEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTOnCreateListCommandCommandMetadata;
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
  defaultText: YTSimpleTextContainer;
  toggledText: YTSimpleTextContainer;
  accessibility: YTAccessibilityLabel;
  trackingParams: string;
  defaultTooltip: string;
  toggledTooltip: string;
  toggledStyle: StyleClass;
  defaultNavigationEndpoint: DefaultNavigationEndpoint;
  accessibilityData: YTAccessibilityData;
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
  title: YTSimpleTextContainer;
  content: YTSimpleTextContainer;
  button: FluffyButton;
}

export interface FluffyButton {
  buttonRenderer: FluffyButtonRenderer;
}

export interface FluffyButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: YTSimpleTextContainer;
  navigationEndpoint: StickyNavigationEndpoint;
  trackingParams: string;
}

export interface StickyNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTAutoplayVideoCommandMetadata;
  signInEndpoint: FluffySignInEndpoint;
}

export interface FluffySignInEndpoint {
  nextEndpoint: CurrentVideoEndpointClass;
  idamTag: string;
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
  viewCount: YTText;
  shortViewCount?: YTText;
  isLive?: boolean;
}

export interface VideoSecondaryInfoRenderer {
  owner: Owner;
  description: SuperTitleLink;
  subscribeButton: SubscribeButton;
  metadataRowContainer: MetadataRowContainer;
  showMoreText: YTRunContainer;
  showLessText: YTRunContainer;
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
  title: YTSimpleTextContainer;
  subtitle?: YTSimpleTextContainer;
  callToAction: YTSimpleTextContainer;
  callToActionIcon: Icon;
  endpoint: YTBrowseEndpointContainer;
  trackingParams: string;
}

export interface YTBrowseEndpointContainer {
  browseEndpoint: YTBrowseEndpoint;
  commandMetadata: YTAutoplayVideoCommandMetadata;
  clickTrackingParams: string;
}

export interface YTBrowseEndpoint {
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
  subscriberCountText: YTRunContainer;
  trackingParams: string;
  badges: MetadataBadgeRendererContainer[];
  membershipButton: MembershipButton;
}

export interface MetadataBadgeRendererContainer {
  metadataBadgeRenderer: OwnerBadgeMetadataBadgeRenderer;
}

export interface OwnerBadgeMetadataBadgeRenderer {
  icon: Icon;
  style: PurpleStyle;
  label?: string;
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
  text: YTRunContainer;
  navigationEndpoint: IndigoNavigationEndpoint;
  trackingParams: string;
  accessibilityData: YTAccessibilityData;
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
  title: YTSimpleTextContainer;
  content: YTSimpleTextContainer;
  button: TentacledButton;
}

export interface TentacledButton {
  buttonRenderer: TentacledButtonRenderer;
}

export interface TentacledButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: YTSimpleTextContainer;
  navigationEndpoint: IndecentNavigationEndpoint;
  trackingParams: string;
}

export interface IndecentNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTAutoplayVideoCommandMetadata;
  signInEndpoint: ShowLiveChatParticipantsEndpointClass;
}

export interface VideoOwnerRendererNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTAutoplayVideoCommandMetadata;
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
  navigationEndpoint: YTBrowseEndpointContainer;
}

export interface SubscribeButton {
  buttonRenderer: SubscribeButtonButtonRenderer;
}

export interface SubscribeButtonButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: YTRunContainer;
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
  title: YTSimpleTextContainer;
  content: YTSimpleTextContainer;
  button: StickyButton;
}

export interface StickyButton {
  buttonRenderer: StickyButtonRenderer;
}

export interface StickyButtonRenderer {
  style: string;
  size: string;
  isDisabled: boolean;
  text: YTSimpleTextContainer;
  navigationEndpoint: AmbitiousNavigationEndpoint;
  trackingParams: string;
}

export interface AmbitiousNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTAutoplayVideoCommandMetadata;
  signInEndpoint: TentacledSignInEndpoint;
}

export interface TentacledSignInEndpoint {
  nextEndpoint: CurrentVideoEndpointClass;
  continueAction: string;
  idamTag: string;
}

export interface YTTwoColumnWatchNextResultsSecondaryResults {
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
  title: YTSimpleTextContainer;
  toggleDescription: YTRunContainer;
  infoIcon: Icon;
  infoText: YTRunContainer;
  contents: CompactAutoplayRendererContent[];
  trackingParams: string;
}

export interface CompactAutoplayRendererContent {
  compactVideoRenderer: ContentCompactVideoRenderer;
}

export interface ContentCompactVideoRenderer {
  videoId: string;
  thumbnail: Background;
  title: YTSimpleTextContainer;
  longBylineText: BylineText;
  publishedTimeText: YTSimpleTextContainer;
  viewCountText: YTSimpleTextContainer;
  lengthText: YTSimpleTextContainer;
  navigationEndpoint: CompactVideoRendererNavigationEndpoint;
  shortBylineText: BylineText;
  badges: PurpleBadge[];
  channelThumbnail: Background;
  ownerBadges: MetadataBadgeRendererContainer[];
  trackingParams: string;
  shortViewCountText: YTSimpleTextContainer;
  menu: Menu;
  thumbnailOverlays: CompactVideoRendererThumbnailOverlay[];
  accessibility: YTAccessibilityData;
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
  accessibility: YTAccessibilityData;
  targetId?: string;
}

export interface FluffyItem {
  menuServiceItemRenderer: YTMenuItemRenderer;
}

export interface CompactVideoRendererNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTAutoplayVideoCommandMetadata;
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
  text: YTRunContainer;
}

export interface PurpleThumbnailOverlayTimeStatusRenderer {
  text: YTSimpleTextContainer;
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
  untoggledAccessibility: YTAccessibilityData;
  toggledAccessibility: YTAccessibilityData;
  trackingParams: string;
}

export interface ToggledServiceEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTOnCreateListCommandCommandMetadata;
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
  commandMetadata: YTOnCreateListCommandCommandMetadata;
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
  title: YTSimpleTextContainer;
  longBylineText: BylineText;
  publishedTimeText?: YTSimpleTextContainer;
  viewCountText: ShortViewCountText;
  lengthText?: YTSimpleTextContainer;
  navigationEndpoint: CompactVideoRendererNavigationEndpoint;
  shortBylineText: BylineText;
  badges?: PurpleBadge[];
  channelThumbnail: Background;
  ownerBadges?: MetadataBadgeRendererContainer[];
  trackingParams: string;
  shortViewCountText: ShortViewCountText;
  menu: Menu;
  thumbnailOverlays: CompactVideoRendererThumbnailOverlay[];
  accessibility: YTAccessibilityData;
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
  text: YTRunContainer;
  trackingParams: string;
  command: ContinuationEndpoint;
}

export interface ContinuationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTOnCreateListCommandCommandMetadata;
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
  text: YTRunContainer;
  detailsText: YTRunContainer;
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
  text: YTRunContainer;
  trackingParams: string;
  command: AcceptCommand;
}

export interface AcceptCommand {
  clickTrackingParams: string;
  commandMetadata: YTOnCreateListCommandCommandMetadata;
  feedbackEndpoint: FeedbackEndpoint;
}

export interface FeedbackEndpoint {
  feedbackToken: string;
  uiActions: UIActions;
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
  shareButton: YTShareButton;
}

export interface PlayerOverlayRendererAutoplay {
  playerOverlayAutoplayRenderer: PlayerOverlayAutoplayRenderer;
}

export interface PlayerOverlayAutoplayRenderer {
  title: YTSimpleTextContainer;
  videoTitle: YTSimpleTextContainer;
  byline: Byline;
  cancelText: YTSimpleTextContainer;
  pauseText: YTSimpleTextContainer;
  background: Background;
  countDownSecs: number;
  nextButton: NextButton;
  trackingParams: string;
  preferImmediateRedirect: boolean;
  videoId: string;
  publishedTimeText: YTSimpleTextContainer;
  webShowNewAutonavCountdown: boolean;
  webShowBigThumbnailEndscreen: boolean;
  shortViewCountText: YTSimpleTextContainer;
}

export interface NextButton {
  buttonRenderer: NextButtonButtonRenderer;
}

export interface NextButtonButtonRenderer {
  navigationEndpoint: CurrentVideoEndpointClass;
  accessibility: YTAccessibilityLabel;
  trackingParams: string;
}

export interface EndScreen {
  watchNextEndScreenRenderer: WatchNextEndScreenRenderer;
}

export interface WatchNextEndScreenRenderer {
  results: WatchNextEndScreenRendererResult[];
  title: YTSimpleTextContainer;
  trackingParams: string;
}

export interface WatchNextEndScreenRendererResult {
  endScreenVideoRenderer: EndScreenVideoRenderer;
}

export interface EndScreenVideoRenderer {
  videoId: string;
  thumbnail: Background;
  title: YTSimpleTextContainer;
  shortBylineText: BylineText;
  lengthText?: YTSimpleTextContainer;
  lengthInSeconds?: number;
  navigationEndpoint: CurrentVideoEndpointClass;
  trackingParams: string;
  shortViewCountText: ShortViewCountText;
  publishedTimeText: YTSimpleTextContainer;
  thumbnailOverlays: EndScreenVideoRendererThumbnailOverlay[];
}

export interface EndScreenVideoRendererThumbnailOverlay {
  thumbnailOverlayTimeStatusRenderer?: FluffyThumbnailOverlayTimeStatusRenderer;
  thumbnailOverlayNowPlayingRenderer?: ThumbnailOverlayNowPlayingRenderer;
}

export interface FluffyThumbnailOverlayTimeStatusRenderer {
  text: YTText;
  style: ThumbnailOverlayTimeStatusRendererStyle;
  icon?: Icon;
}

export interface YTShareButton {
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

export interface YTResponseContext {
  serviceTrackingParams: YTServiceTrackingParam[];
  webResponseContextExtensionData: WebResponseContextExtensionData;
}

export interface YTServiceTrackingParam {
  service: string;
  params: YTParam[];
}

export interface YTParam {
  key: string;
  value: string;
}

export interface WebResponseContextExtensionData {
  ytConfigData: YTConfigData;
  webPrefetchData: WebPrefetchData;
  hasDecorated: boolean;
}

export interface WebPrefetchData {
  navigationEndpoints: YTNavigationEndpoint[];
}

export interface YTConfigData {
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
  text: YTRunContainer;
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
  title: YTRunContainer;
  sections: HotkeyDialogRendererSection[];
  dismissButton: YTDismissButtonClass;
  trackingParams: string;
}

export interface HotkeyDialogRendererSection {
  hotkeyDialogSectionRenderer: HotkeyDialogSectionRenderer;
}

export interface HotkeyDialogSectionRenderer {
  title: YTRunContainer;
  options: Option[];
}

export interface Option {
  hotkeyDialogSectionOptionRenderer: HotkeyDialogSectionOptionRenderer;
}

export interface HotkeyDialogSectionOptionRenderer {
  label: YTRunContainer;
  hotkey: string;
  hotkeyAccessibilityLabel?: YTAccessibilityData;
}

export interface Logo {
  topbarLogoRenderer: TopbarLogoRenderer;
}

export interface TopbarLogoRenderer {
  iconImage: Icon;
  tooltipText: YTRunContainer;
  endpoint: YTBrowseEndpointContainer;
  trackingParams: string;
}

export interface Searchbox {
  fusionSearchboxRenderer: FusionSearchboxRenderer;
}

export interface FusionSearchboxRenderer {
  icon: Icon;
  placeholderText: YTRunContainer;
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
  commandMetadata: YTAutoplayVideoCommandMetadata;
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
  text: YTRunContainer;
  icon: Icon;
  navigationEndpoint: MagentaNavigationEndpoint;
  trackingParams: string;
  targetId: string;
}

export interface MagentaNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTAutoplayVideoCommandMetadata;
  signInEndpoint: StickySignInEndpoint;
}

export interface StickySignInEndpoint {
  idamTag: string;
}

export interface TopbarMenuButtonRenderer {
  icon: Icon;
  menuRenderer?: TopbarMenuButtonRendererMenuRenderer;
  trackingParams: string;
  accessibility: YTAccessibilityData;
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
  title: YTRunContainer;
  navigationEndpoint: CompactLinkRendererNavigationEndpoint;
  trackingParams: string;
}

export interface CompactLinkRendererNavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: YTAutoplayVideoCommandMetadata;
  urlEndpoint: FluffyURLEndpoint;
}

export interface FluffyURLEndpoint {
  url: string;
  target: string;
}

export interface MenuRequest {
  clickTrackingParams: string;
  commandMetadata: YTOnCreateListCommandCommandMetadata;
  signalServiceEndpoint: MenuRequestSignalServiceEndpoint;
}

export interface MenuRequestSignalServiceEndpoint {
  signal: string;
  actions: YTIndecentAction[];
}

export interface YTIndecentAction {
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

export interface YTWebWatchNextResponseExtensionData {
  relatedVideoArgs: string;
}
