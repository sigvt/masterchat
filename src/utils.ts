import crossFetch from "cross-fetch";
import debug from "debug";
import { DC, DH, DO } from "./constants";
import { AbortError } from "./errors";
import { Color } from "./modules/chat/types";
import { YTEmojiRun, YTRun, YTText, YTTextRun } from "./yt/chat";
import { FluffyBrowseEndpoint } from "./yt/context";

export type ColorFormat = "rgb" | "hex";

export interface RunsToStringOptions {
  // add space between text and emoji tokens
  spaces?: boolean;

  // function to process text token
  textHandler?: (text: YTTextRun) => string;

  // function to process emoji token
  emojiHandler?: (emoji: YTEmojiRun) => string;
}

export function formatColor(color: Color, format: ColorFormat = "rgb"): string {
  switch (format) {
    case "rgb":
      return `rgba(${color.r},${color.g},${color.b},${color.opacity / 255})`;
    case "hex":
      return `#${color.r.toString(16)}${color.g.toString(16)}${color.b.toString(
        16
      )}${color.opacity.toString(16)}`;
  }
}

export function ytFetch(input: string, init?: RequestInit) {
  if (!input.startsWith("http")) {
    input = DO + input;
  }
  const parsedUrl = new URL(input);

  const requestUrl = parsedUrl.toString();
  const requestInit = {
    ...init,
    headers: {
      ...DH,
      ...init?.headers,
    },
  };
  return crossFetch(requestUrl, requestInit);
}

export const debugLog = debug("masterchat");

export function toVideoId(idOrUrl: string) {
  const match = /(?:[&=/]|^)([A-Za-z0-9_-]{11})(?=(?:[^A-Za-z0-9_-]|$))/.exec(
    idOrUrl
  );
  return match?.[1];
}

function stripYtRedirection(url: string): string {
  if (!url.startsWith("https://www.youtube.com/redirect?")) {
    return url;
  }

  const target = new URL(url);
  const q = target.searchParams.get("q");

  return q ? q : target.href;
}

export function endpointToUrl(
  navigationEndpoint: NonNullable<YTTextRun["navigationEndpoint"]>
): string | undefined {
  if ("urlEndpoint" in navigationEndpoint) {
    return stripYtRedirection(navigationEndpoint.urlEndpoint.url);
  }

  if ("watchEndpoint" in navigationEndpoint) {
    const { watchEndpoint } = navigationEndpoint;

    let url = DO + `/watch?v=${watchEndpoint.videoId}`;

    if (watchEndpoint.playlistId) url += "&list=" + watchEndpoint.playlistId;
    if (watchEndpoint.index) url += "&index=" + watchEndpoint.index;
    if (watchEndpoint.startTimeSeconds)
      url += "&t=" + watchEndpoint.startTimeSeconds;

    return url;
  }

  if ("browseEndpoint" in navigationEndpoint) {
    const { browseEndpoint } = navigationEndpoint;
    const { browseId } = browseEndpoint;

    if ("canonicalBaseUrl" in browseEndpoint) {
      return stripYtRedirection(
        (browseEndpoint as FluffyBrowseEndpoint).canonicalBaseUrl
      );
    } else if (browseId) {
      const prefix = browseId.substr(0, 2);

      let url = DO;
      if (prefix === "FE") {
        if (browseId === "FEwhat_to_watch") url = "/";
        else if (browseId === "FEmy_videos") url = "/my_videos";
        else url = "/feed/" + browseId.substr(2);
      } else if (prefix === "VL") {
        url = "/playlist?list=" + browseId.substr(2);
      } else {
        url = "/channel/" + browseId;
      }
      return url;
    }
  }
}

export function textRunToPlainText(run: YTTextRun): string {
  const { text, navigationEndpoint } = run;
  if (navigationEndpoint) {
    if ("urlEndpoint" in navigationEndpoint) {
      return endpointToUrl(navigationEndpoint) ?? text;
    }
    if ("watchEndpoint" in navigationEndpoint && text.startsWith("https://")) {
      return endpointToUrl(navigationEndpoint) ?? text;
    }
  }
  return text;
}

export function emojiRunToPlainText(run: YTEmojiRun): string {
  const { emoji } = run;
  const term = emoji.isCustomEmoji
    ? emoji.shortcuts[emoji.shortcuts.length - 1]
    : emoji.emojiId;

  return term;
}

/**
 * Convert any yt text container into string
 * `[...] | {runs: [...]} | {simpleText: "..."} -> string`
 */
export function stringify(
  payload: YTText | YTRun[] | string,
  runsToStringOptions?: RunsToStringOptions
): string;
export function stringify(
  payload: undefined,
  runsToStringOptions?: RunsToStringOptions
): undefined;
export function stringify(
  payload: YTText | YTRun[] | string | undefined,
  runsToStringOptions?: RunsToStringOptions
): string | undefined {
  if (payload === undefined) return undefined;
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) return runsToString(payload, runsToStringOptions);
  if ("runs" in payload) return runsToString(payload.runs, runsToStringOptions);
  if ("simpleText" in payload) return payload.simpleText;
  throw new Error(`Invalid payload format: ${payload}`);
}

export function runsToString(
  runs: YTRun[],
  {
    spaces = false,
    textHandler = textRunToPlainText,
    emojiHandler = emojiRunToPlainText,
  }: RunsToStringOptions = {}
): string {
  return runs
    .map((run) => {
      if ("text" in run) return textHandler(run);
      if ("emoji" in run) return emojiHandler(run);
      throw new Error(`Unrecognized run token: ${JSON.stringify(run)}`);
    })
    .join(spaces ? " " : "");
}

export function delay(duration: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject): void => {
    if (signal?.aborted) {
      reject(new AbortError());
      return;
    }

    const onAbort = () => {
      clearTimeout(timer);
      reject(new AbortError());
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, duration);

    signal?.addEventListener("abort", onAbort);
  });
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

export function toISO8601Duration(durationText: string): string {
  const match = /^(a|\d+)\s(year|month|week|day|hour|minute|second)s?$/.exec(
    durationText
  );
  if (!match) throw new Error(`Invalid duration: ${durationText}`);

  const [_, duration, unit] = match;
  const durationInt = parseInt(duration) || 1;
  const durationUnit = {
    year: "Y",
    month: "M",
    week: "W",
    day: "D",
    hour: "TH",
    minute: "TM",
    second: "TS",
  }[unit];
  if (!durationUnit) throw new Error(`Invalid duration unit: ${unit}`);

  return `P${durationInt}${durationUnit}`;
}
