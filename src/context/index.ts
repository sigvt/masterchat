import {
  MembersOnlyError,
  NoPermissionError,
  NoStreamRecordingError,
  UnavailableError,
} from "../errors";
import { runsToString } from "../utils";
import { YTInitialData, YTPlayabilityStatus } from "../interfaces/yt/context";

// OK duration=">0" => Archived (replay chat may be available)
// OK duration="0" => Live (chat may be available)
// LIVE_STREAM_OFFLINE => Offline (chat may be available)
function assertPlayability(playabilityStatus: YTPlayabilityStatus | undefined) {
  if (!playabilityStatus) {
    throw new Error("playabilityStatus missing");
  }
  switch (playabilityStatus.status) {
    case "ERROR":
      throw new UnavailableError(playabilityStatus.reason!);
    case "LOGIN_REQUIRED":
      throw new NoPermissionError(playabilityStatus.reason!);
    case "UNPLAYABLE": {
      if (
        "playerLegacyDesktopYpcOfferRenderer" in playabilityStatus.errorScreen!
      ) {
        throw new MembersOnlyError(playabilityStatus.reason!);
      }
      throw new NoStreamRecordingError(playabilityStatus.reason!);
    }
    case "LIVE_STREAM_OFFLINE":
    case "OK":
  }
}

export function findCfg(data: string) {
  const match = /ytcfg\.set\(({.+?})\);/.exec(data);
  if (!match) return;
  return JSON.parse(match[1]);
}

export function findIPR(data: string): unknown {
  const match = /var ytInitialPlayerResponse = (.+?);var meta/.exec(data);
  if (!match) return;
  return JSON.parse(match[1]);
}

export function findInitialData(data: string): YTInitialData | undefined {
  const match =
    /(?:var ytInitialData|window\["ytInitialData"\]) = (.+?);<\/script>/.exec(
      data
    );
  if (!match) return;
  return JSON.parse(match[1]);
}

export function findEPR(data: string) {
  return findCfg(data)?.PLAYER_VARS?.embedded_player_response;
}

export function findPlayabilityStatus(
  data: string
): YTPlayabilityStatus | undefined {
  const ipr = findIPR(data);
  return (ipr as any)?.playabilityStatus;
}
// embed disabled https://www.youtube.com/embed/JfJYHfrOGgQ
// unavailable video https://www.youtube.com/embed/YEAINgb2xfo
// private video https://www.youtube.com/embed/UUjdYGda4N4
// 200 OK

export async function parseMetadataFromEmbed(html: string) {
  const epr = findEPR(html);

  const ps = epr.previewPlayabilityStatus;
  assertPlayability(ps);

  const ep = epr.embedPreview;

  const prevRdr = ep.thumbnailPreviewRenderer;
  const vdRdr = prevRdr.videoDetails.embeddedPlayerOverlayVideoDetailsRenderer;
  const expRdr =
    vdRdr.expandedRenderer.embeddedPlayerOverlayVideoDetailsExpandedRenderer;

  const title = runsToString(prevRdr.title.runs);
  const thumbnail =
    prevRdr.defaultThumbnail.thumbnails[
      prevRdr.defaultThumbnail.thumbnails.length - 1
    ].url;
  const channelId = expRdr.subscribeButton.subscribeButtonRenderer.channelId;
  const channelName = runsToString(expRdr.title.runs);
  const channelThumbnail = vdRdr.channelThumbnail.thumbnails[0].url;
  const duration = Number(prevRdr.videoDurationSeconds);

  return {
    title,
    thumbnail,
    channelId,
    channelName,
    channelThumbnail,
    duration,
    status: ps.status,
    statusText: ps.reason,
  };
}

export function parseMetadataFromWatch(html: string) {
  const initialData = findInitialData(html)!;

  const playabilityStatus = findPlayabilityStatus(html);
  assertPlayability(playabilityStatus);

  // TODO: initialData.contents.twoColumnWatchNextResults.conversationBar.conversationBarRenderer.availabilityMessage.messageRenderer.text.runs[0].text === 'Chat is disabled for this live stream.'
  const results =
    initialData.contents?.twoColumnWatchNextResults?.results.results!;

  const primaryInfo = results.contents[0].videoPrimaryInfoRenderer;
  const videoOwner =
    results.contents[1].videoSecondaryInfoRenderer.owner.videoOwnerRenderer;

  const title = runsToString(primaryInfo.title.runs);
  const channelId = videoOwner.navigationEndpoint.browseEndpoint.browseId;
  const channelName = runsToString(videoOwner.title.runs);
  const isLive = primaryInfo.viewCount!.videoViewCountRenderer.isLive ?? false;

  return {
    title,
    channelId,
    channelName,
    isLive,
  };
}
