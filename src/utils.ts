import debug from "debug";
import { DC } from "./constants";
import { YTEmoji, YTRun } from "./yt/chat";

export interface RunsToStringOptions {
  // add space between text and emoji tokens
  spaces?: boolean;

  // function to process emoji token
  emojiHandler?: (emoji: YTEmoji) => string;
}

export const debugLog = debug("masterchat");

export function normalizeVideoId(idOrUrl: string) {
  const match = /(?:[&=/]|^)([A-Za-z0-9_-]{11})(?=(?:[^A-Za-z0-9_-]|$))/.exec(
    idOrUrl
  );
  return match?.[1];
}

export function simpleEmojiHandler(emoji: YTEmoji) {
  const term = emoji.isCustomEmoji
    ? emoji.shortcuts[emoji.shortcuts.length - 1]
    : emoji.emojiId;

  return term;
}

export function runsToString(
  runs: YTRun[],
  {
    spaces = false,
    emojiHandler = simpleEmojiHandler,
  }: RunsToStringOptions = {}
): string {
  return runs
    .map((run) => {
      if ("text" in run) return run.text;
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
