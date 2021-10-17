import crossFetch from "cross-fetch";
import debug from "debug";
import { DC, DH, DO } from "./constants";
import { AbortError } from "./errors";
import { Color, TimedContinuation } from "./interfaces/misc";
import {
  YTAction,
  YTContinuationContents,
  YTEmojiRun,
  YTRun,
  YTSimpleTextContainer,
  YTText,
  YTTextRun,
} from "./interfaces/yt/chat";
import { FluffyBrowseEndpoint } from "./interfaces/yt/context";

export type ColorFormat = "rgb" | "hex";

export interface RunsToStringOptions {
  // add space between runs
  spaces?: boolean;

  // function to process text token
  textHandler?: (text: YTTextRun) => string;

  // function to process emoji token
  emojiHandler?: (emoji: YTEmojiRun) => string;
}

/**
 * Convert timestampUsec into Date
 */
export function tsToDate(timestampUsec: string): Date {
  return new Date(Number(BigInt(timestampUsec) / BigInt(1000)));
}

/**
 * Convert timestampUsec into number (in seconds)
 */
export function tsToNumber(timestampUsec: string): number {
  return Number(BigInt(timestampUsec) / BigInt(1000));
}

export function formatColor(color: Color, format: ColorFormat = "hex"): string {
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
  // undefined
  if (payload == undefined) return undefined;

  // string
  if (typeof payload === "string") return payload;

  // Run[]
  if (Array.isArray(payload)) return runsToString(payload, runsToStringOptions);

  // YTRunContainer
  if ("runs" in payload) return runsToString(payload.runs, runsToStringOptions);

  // YTSimpleTextContainer
  // TODO: add option for expanding accessibility label
  if ("simpleText" in payload) return simpleTextToString(payload, false);

  throw new Error(`Invalid payload format: ${payload}`);
}

export function simpleTextToString(
  payload: YTSimpleTextContainer,
  expand: boolean = false
) {
  if (payload.accessibility && expand) {
    return payload.accessibility.accessibilityData.label;
  }
  return payload.simpleText;
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

export function durationToSeconds(durationText: string): number {
  const match = /^(a|\d+)\s(year|month|week|day|hour|minute|second)s?$/.exec(
    durationText
  );
  if (!match) throw new Error(`Invalid duration: ${durationText}`);

  const [_, duration, unit] = match;
  const durationInt = parseInt(duration) || 1;
  const multiplier = {
    year: 31536000,
    month: 2628000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  }[unit];
  if (!multiplier) throw new Error(`Invalid duration unit: ${unit}`);

  return durationInt * multiplier;
}

export function durationToISO8601(durationText: string): string {
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

export function unwrapReplayActions(rawActions: YTAction[]) {
  return rawActions.map(
    // TODO: verify that an action always holds a single item.
    (action): YTAction => {
      const replayAction = Object.values(omitTrackingParams(action))[0] as any;

      return replayAction.actions[0];
    }
  );
}

export function getTimedContinuation(
  continuationContents: YTContinuationContents
): TimedContinuation | undefined {
  /**
   * observed k: invalidationContinuationData | timedContinuationData | liveChatReplayContinuationData
   * continuations[1] would be playerSeekContinuationData
   */
  if (
    Object.keys(
      continuationContents.liveChatContinuation.continuations[0]
    )[0] === "playerSeekContinuationData"
  ) {
    // only playerSeekContinuationData
    return undefined;
  }

  const continuation = Object.values(
    continuationContents.liveChatContinuation.continuations[0]
  )[0];
  if (!continuation) {
    // no continuation
    return undefined;
  }
  return {
    token: continuation.continuation,
    timeoutMs: continuation.timeoutMs,
  };
}

export type OmitTrackingParams<T> = Omit<
  T,
  "clickTrackingParams" | "trackingParams"
>;

/**
 * Remove `clickTrackingParams` and `trackingParams` from object
 */
export function omitTrackingParams<T>(obj: T): OmitTrackingParams<T> {
  return Object.entries(obj)
    .filter(([k]) => k !== "clickTrackingParams" && k !== "trackingParams")
    .reduce(
      (sum, [k, v]) => ((sum[k as keyof OmitTrackingParams<T>] = v), sum),
      {} as OmitTrackingParams<T>
    );
}
