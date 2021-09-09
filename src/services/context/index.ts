import fetch from "cross-fetch";
import { writeFileSync } from "fs";
import { Base } from "../../base";
import { DEFAULT_HEADERS, DEFAULT_ORIGIN } from "../../constants";
import {
  AccessDeniedError,
  MasterchatError,
  MembersOnlyError,
  NoPermissionError,
  NoStreamRecordingError,
  UnavailableError,
} from "../../error";
import { runsToString } from "../../utils";
import { YTInitialData, YTPlayabilityStatus } from "../../yt/context";

// OK duration=">0" => Archived (replay chat may be available)
// OK duration="0" => Live (chat may be available)
// LIVE_STREAM_OFFLINE => Offline (chat may be available)
function assertPlayability(playabilityStatus: YTPlayabilityStatus | undefined) {
  if (!playabilityStatus) {
    throw new MasterchatError("unknown", "Missing playabilityStatus: ");
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

function findEmbedCfg(data: string) {
  const match = /ytcfg\.set\(({.+?})\);/.exec(data);
  if (!match) return;

  const epr = JSON.parse(
    JSON.parse(match[1])?.PLAYER_VARS?.embedded_player_response
  );
  return epr;
}

function findPlayabilityStatus(data: string): YTPlayabilityStatus | undefined {
  const match = /var ytInitialPlayerResponse = (.+?);var meta/.exec(data);
  if (match) {
    return JSON.parse(match[1]).playabilityStatus;
  }
}

function findInitialData(data: string): YTInitialData | undefined {
  const match =
    /(?:var ytInitialData|window\["ytInitialData"\]) = (.+?);<\/script>/.exec(
      data
    );
  if (match) {
    return JSON.parse(match[1]);
  }
}

export async function fetchMetadataFromEmbed(id: string) {
  const res = await fetch(`https://www.youtube-nocookie.com/embed/${id}`, {
    headers: DEFAULT_HEADERS,
  });

  // Check ban status
  if (res.status === 429) {
    throw new AccessDeniedError("Rate limit exceeded: " + id);
  }

  const html = await res.text();
  const cfg = findEmbedCfg(html);
  writeFileSync(`epr.json`, JSON.stringify(cfg));

  const ps = cfg.previewPlayabilityStatus;
  assertPlayability(ps);

  const ep = cfg.embedPreview;

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

export interface ContextService extends Base {}

export class ContextService {
  public async populateMetadata(): Promise<void> {
    const res = await fetch(DEFAULT_ORIGIN + "/watch?v=" + this.videoId, {
      headers: DEFAULT_HEADERS,
    });

    // Check ban status
    if (res.status === 429) {
      throw new AccessDeniedError("Rate limit exceeded: " + this.videoId);
    }

    const watchHtml = await res.text();
    const initialData = findInitialData(watchHtml)!;

    const playabilityStatus = findPlayabilityStatus(watchHtml);
    assertPlayability(playabilityStatus);

    // TODO
    // initialData.contents.twoColumnWatchNextResults.conversationBar.conversationBarRenderer.availabilityMessage.messageRenderer.text.runs[0].text === 'Chat is disabled for this live stream.'

    const results =
      initialData.contents?.twoColumnWatchNextResults?.results.results!;

    const primaryInfo = results.contents[0].videoPrimaryInfoRenderer;
    const videoOwner =
      results.contents[1].videoSecondaryInfoRenderer.owner.videoOwnerRenderer;

    const title = runsToString(primaryInfo.title.runs);
    const channelId = videoOwner.navigationEndpoint.browseEndpoint.browseId;
    const channelName = runsToString(videoOwner.title.runs);
    const isLive =
      primaryInfo.viewCount!.videoViewCountRenderer.isLive ?? false;

    this.title = title;
    this.channelId = channelId;
    this.channelName = channelName;
    this.isLive = isLive;
  }
}
