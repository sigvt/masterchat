import {
  YTApiEndpointMetadata,
  YTApiEndpointMetadataContainer,
  YTIcon,
  YTRunContainer,
  YTSimpleTextContainer,
  YTTextRun,
  YTThumbnailList,
  YTWatchEndpointContainer,
  YTWebPageMetadata,
} from "./chat";
import {
  ContinuationCommand,
  YTContinuationEndpoint,
  StyleClass,
  StyleTypeEnum,
  YTAccessibilityData,
} from "./context";

export interface YTContinuationItem {
  commentThreadRenderer?: YTCommentThreadRenderer;
  continuationItemRenderer?: YTContinuationItemRenderer;
}

export interface YTCommentThreadRenderer {
  comment: YTComment;
  replies?: Replies;
  trackingParams: string;
  renderingPriority: RenderingPriority;
  isModeratedElqComment: boolean;
  loggingDirectives: CommentRendererLoggingDirectives;
}

export interface YTComment {
  commentRenderer: YTCommentRenderer;
}

export interface YTCommentRenderer {
  authorText: YTSimpleTextContainer;
  authorThumbnail: YTThumbnailList;
  authorEndpoint: AuthorEndpoint;
  contentText: YTRunContainer;
  publishedTimeText: PublishedTimeText;
  isLiked: boolean;
  commentId: string;
  actionButtons: ActionButtons;
  authorIsChannelOwner: boolean;
  voteStatus: VoteStatus;
  trackingParams: string;
  voteCount: VoteCount;
  expandButton: Button;
  collapseButton: Button;
  replyCount?: number;
  loggingDirectives: CommentRendererLoggingDirectives;
  sponsorCommentBadge?: SponsorCommentBadge;
}

export interface ActionButtons {
  commentActionButtonsRenderer: CommentActionButtonsRenderer;
}

export interface CommentActionButtonsRenderer {
  likeButton: LikeButton;
  replyButton: Button;
  dislikeButton: LikeButton;
  trackingParams: string;
  protoCreationMs: string;
  style: CommentActionButtonsRendererStyle;
}

export interface LikeButton {
  toggleButtonRenderer: ToggleButtonRenderer;
}

export interface ToggleButtonRenderer {
  style: StyleClass;
  size: SizeClass;
  isToggled: boolean;
  isDisabled: boolean;
  defaultIcon: YTIcon;
  trackingParams: string;
  defaultTooltip: string;
  toggledTooltip: string;
  toggledStyle: StyleClass;
  defaultNavigationEndpoint: NavigationEndpoint;
  accessibilityData: YTAccessibilityData;
  toggledAccessibilityData: YTAccessibilityData;
}

export interface NavigationEndpoint {
  clickTrackingParams: string;
  commandMetadata: NavigationEndpointCommandMetadata;
  signInEndpoint: SignInEndpoint;
}

export interface NavigationEndpointCommandMetadata {
  webCommandMetadata: YTWebPageMetadata;
}

export interface SignInEndpoint {
  nextEndpoint: NextEndpoint;
}

export interface NextEndpoint {
  clickTrackingParams: string;
  commandMetadata: NavigationEndpointCommandMetadata;
  watchEndpoint: {
    videoId: string;
  };
}

export interface SizeClass {
  sizeType: SizeEnum;
}

export enum SizeEnum {
  SizeDefault = "SIZE_DEFAULT",
}

export interface Button {
  buttonRenderer: CollapseButtonButtonRenderer;
}

export interface CollapseButtonButtonRenderer {
  style: StyleTypeEnum;
  size: SizeEnum;
  text: YTRunContainer<YTTextRun>;
  navigationEndpoint?: NavigationEndpoint;
  trackingParams: string;
  accessibility?: YTAccessibilityData;
}

export enum CommentActionButtonsRendererStyle {
  CommentActionButtonStyleTypeDesktopToolbar = "COMMENT_ACTION_BUTTON_STYLE_TYPE_DESKTOP_TOOLBAR",
}

export interface AuthorEndpoint {
  clickTrackingParams: string;
  commandMetadata: NavigationEndpointCommandMetadata;
  browseEndpoint: BrowseEndpoint;
}

export interface BrowseEndpoint {
  browseId: string;
  canonicalBaseUrl: string;
}

export interface CommentRendererLoggingDirectives {
  trackingParams: string;
  visibility: {
    types: string;
  };
}

export interface PublishedTimeText {
  runs: PublishedTimeTextRun[];
}

export interface PublishedTimeTextRun {
  text: TextEnum;
  navigationEndpoint: YTWatchEndpointContainer;
}

export enum TextEnum {
  The1DayAgo = "1 day ago",
  The2DaysAgo = "2 days ago",
  The3DaysAgo = "3 days ago",
  The3DaysAgoEdited = "3 days ago (edited)",
}

export interface SponsorCommentBadge {
  sponsorCommentBadgeRenderer: SponsorCommentBadgeRenderer;
}

export interface SponsorCommentBadgeRenderer {
  customBadge: CustomBadge;
  tooltip: string;
}

export interface CustomBadge {
  thumbnails: CustomBadgeThumbnail[];
}

export interface CustomBadgeThumbnail {
  url: string;
}

export interface VoteCount {
  accessibility: YTAccessibilityData;
  simpleText: string;
}

export enum VoteStatus {
  Indifferent = "INDIFFERENT",
}

export enum RenderingPriority {
  Unknown = "RENDERING_PRIORITY_UNKNOWN",
  LinkedComment = "RENDERING_PRIORITY_LINKED_COMMENT",
}

export interface Replies {
  commentRepliesRenderer: CommentRepliesRenderer;
}

export interface CommentRepliesRenderer {
  contents: YTContent[];
  trackingParams: string;
  viewReplies: HideRepliesClass;
  hideReplies: HideRepliesClass;
  targetId: string;
}

export interface YTContent {
  continuationItemRenderer: YTContinuationItemRenderer;
}

export interface YTContinuationItemRenderer {
  trigger: string;
  continuationEndpoint: YTContinuationEndpoint;
}

export interface HideRepliesClass {
  buttonRenderer: HideRepliesButtonRenderer;
}

export interface HideRepliesButtonRenderer {
  text: YTRunContainer<YTTextRun>;
  icon: YTIcon;
  trackingParams: string;
  iconPosition: IconPosition;
}

export enum IconPosition {
  ButtonIconPositionTypeLeftOfText = "BUTTON_ICON_POSITION_TYPE_LEFT_OF_TEXT",
}
