import { debuglog } from "util";
import { DC } from "./constants";
import {
  YTEmoji,
  YTRun,
  YTTextRun,
  YTUrlEndpointContainer,
  YTWatchEndpointContainer,
} from "./yt/chat";
import { FluffyBrowseEndpoint, YTBrowseEndpointContainer } from "./yt/context";

export interface RunsToStringOptions {
  // add space between text and emoji tokens
  spaces?: boolean;

  // function to process emoji token
  emojiHandler?: (emoji: YTEmoji) => string;
  urlHandler?: (text: string, url: string) => string;
}

export const debugLog = debuglog("masterchat");

export function toVideoId(idOrUrl: string) {
  const match = /(?:[&=/]|^)([A-Za-z0-9_-]{11})(?=(?:[^A-Za-z0-9_-]|$))/.exec(
    idOrUrl
  );
  return match?.[1];
}

export function removeYoutubeRedirection(url: string) {
  if (!url.startsWith("https://www.youtube.com/redirect?")) {
    return url;
  }
  const a = url.substr(url.indexOf("?") + 1).split("&");
  const queryParams: Record<string, string> = {};
  for (let i = 0; i < a.length; i++) {
    const p = a[i].split("=");
    queryParams[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
  }
  return queryParams.q || url;
}

export function fixYoutubeUrl(url: string) {
  const match =
    /^([A-Za-z]{3,9}:)?(\/\/)?((?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)?((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?$/
      .exec(url)
      ?.slice(1);
  if (match) {
    match[0] ??= "https:";
    match[1] ??= "//";
    match[2] ??= "www.youtube.com";
    url = match.join("");
  }
  return removeYoutubeRedirection(url);
}

export function endpointToUrl(
  navigationEndpoint: YTTextRun["navigationEndpoint"]
): string {
  if (!navigationEndpoint) return "";
  if ("commandMetadata" in navigationEndpoint) {
    const url = (navigationEndpoint as YTUrlEndpointContainer).commandMetadata
      ?.webCommandMetadata?.url;
    if (url) return fixYoutubeUrl(url);
  }
  if ("watchEndpoint" in navigationEndpoint) {
    const watchEndpoint = (navigationEndpoint as YTWatchEndpointContainer)
      .watchEndpoint;
    let url = `/watch?v=${watchEndpoint.videoId}`;
    if (watchEndpoint.playlistId) url += "&list=" + watchEndpoint.playlistId;
    if (watchEndpoint.index) url += "&index=" + watchEndpoint.index;
    if (watchEndpoint.startTimeSeconds)
      url += "&t=" + watchEndpoint.startTimeSeconds;
    return fixYoutubeUrl(url);
  }
  if ("browseEndpoint" in navigationEndpoint) {
    const browseEndpoint = (navigationEndpoint as YTBrowseEndpointContainer)
      .browseEndpoint;
    const browseId = browseEndpoint.browseId;
    let url = "";
    if ("canonicalBaseUrl" in browseEndpoint) {
      url = (browseEndpoint as FluffyBrowseEndpoint).canonicalBaseUrl;
    } else if (browseId) {
      const prefix = browseId.substr(0, 2);
      if (prefix === "FE") {
        if (browseId === "FEwhat_to_watch") url = "/";
        else if (browseId === "FEmy_videos") url = "/my_videos";
        else url = "/feed/" + browseId.substr(2);
      } else if (prefix === "VL") {
        url = "/playlist?list=" + browseId.substr(2);
      } else {
        url = "/channel/" + browseId;
      }
    }
    if (url) return fixYoutubeUrl(url);
  }
  if ("urlEndpoint" in navigationEndpoint) {
    return fixYoutubeUrl(
      (navigationEndpoint as YTUrlEndpointContainer).urlEndpoint.url
    );
  }
  return "";
}

export function simpleEmojiHandler(emoji: YTEmoji) {
  const term = emoji.isCustomEmoji
    ? emoji.shortcuts[emoji.shortcuts.length - 1]
    : emoji.emojiId;

  return term;
}

export function simpleUrlHandler(text: string, url: string) {
  return text;
}

export function runsToString(
  runs: YTRun[],
  {
    spaces = false,
    emojiHandler = simpleEmojiHandler,
    urlHandler = simpleUrlHandler,
  }: RunsToStringOptions = {}
): string {
  return runs
    .map((run) => {
      if ("text" in run) {
        if ("navigationEndpoint" in run) {
          const url = endpointToUrl(run.navigationEndpoint);
          if (url) return urlHandler(run.text, url);
        }
        return run.text;
      }
      if ("emoji" in run) return emojiHandler(run.emoji);
      throw new Error(`Unrecognized run token: ${JSON.stringify(run)}`);
    })
    .join(spaces ? " " : "");
}

export function timeoutThen(duration: number): Promise<number> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export function guessFreeChat(title: string) {
  return /(?:[fF]ree\s?[cC]hat|(?:ふりー|フリー)(?:ちゃっと|チャット))/.test(
    title
  );
}

export function groupBy<T, K extends keyof T, S extends Extract<T[K], string>>(
  lst: T[],
  key: K
) {
  return lst.reduce((result, o) => {
    const index = o[key] as S;
    if (!result[index]) result[index] = [];
    result[index].push(o as any);
    return result;
  }, {} as { [k in S]: (T extends { [s in K]: k } ? T : never)[] });
}

export function withContext(input: any = {}) {
  return {
    ...input,
    context: {
      ...input?.context,
      client: DC,
    },
  };
}
