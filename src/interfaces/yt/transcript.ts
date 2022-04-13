export interface GetTranscriptResponse {
  responseContext: ResponseContext;
  actions: Action[];
  trackingParams: string;
}

export interface Action {
  clickTrackingParams: string;
  updateEngagementPanelAction: UpdateEngagementPanelAction;
}

export interface UpdateEngagementPanelAction {
  targetId: string;
  content: UpdateEngagementPanelActionContent;
}

export interface UpdateEngagementPanelActionContent {
  transcriptRenderer: TranscriptRenderer;
}

export interface TranscriptRenderer {
  trackingParams: string;
  content: TranscriptRendererContent;
}

export interface TranscriptRendererContent {
  transcriptSearchPanelRenderer: TranscriptSearchPanelRenderer;
}

export interface TranscriptSearchPanelRenderer {
  body: Body;
  footer: Footer;
  trackingParams: string;
  targetId: string;
}

export interface Body {
  transcriptSegmentListRenderer: TranscriptSegmentListRenderer;
}

export interface TranscriptSegmentListRenderer {
  initialSegments: InitialSegment[];
  noResultLabel: NoResultLabel;
  retryLabel: NoResultLabel;
}

export interface InitialSegment {
  transcriptSegmentRenderer: TranscriptSegmentRenderer;
}

export interface TranscriptSegmentRenderer {
  startMs: string;
  endMs: string;
  snippet: NoResultLabel;
  startTimeText: StartTimeText;
  trackingParams: string;
  accessibility: Accessibility;
}

export interface Accessibility {
  accessibilityData: AccessibilityData;
}

export interface AccessibilityData {
  label: string;
}

export interface NoResultLabel {
  runs: Run[];
}

export interface Run {
  text: string;
}

export interface StartTimeText {
  simpleText: string;
}

export interface Footer {
  transcriptFooterRenderer: TranscriptFooterRenderer;
}

export interface TranscriptFooterRenderer {
  languageMenu: LanguageMenu;
}

export interface LanguageMenu {
  sortFilterSubMenuRenderer: SortFilterSubMenuRenderer;
}

export interface SortFilterSubMenuRenderer {
  subMenuItems: SubMenuItem[];
  trackingParams: string;
}

export interface SubMenuItem {
  title: string;
  selected: boolean;
  continuation: Continuation;
  trackingParams: string;
}

export interface Continuation {
  reloadContinuationData: ReloadContinuationData;
}

export interface ReloadContinuationData {
  continuation: string;
  clickTrackingParams: string;
}

export interface ResponseContext {
  visitorData: string;
  serviceTrackingParams: ServiceTrackingParam[];
  mainAppWebResponseContext: MainAppWebResponseContext;
  webResponseContextExtensionData: WebResponseContextExtensionData;
}

export interface MainAppWebResponseContext {
  loggedOut: boolean;
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
