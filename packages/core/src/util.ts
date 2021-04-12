import debug from "debug";
import { YTEmoji, YTRun } from "./types/chat";

export const log = debug("masterchat");

export function guessFreeChat(title: string) {
  return /(?:[fF]ree\s?[cC]hat|(?:ふりー|フリー)(?:ちゃっと|チャット))/.test(
    title
  );
}

export function normalizeVideoId(idOrUrl: string) {
  return idOrUrl.replace(/^https?:\/\/www\.youtube\.com\/watch\?v=/, "");
}

export function convertRunsToString(
  runs: YTRun[],
  {
    emojiHandler = undefined,
  }: { emojiHandler?: (emoji: YTEmoji) => string } = {}
): string {
  try {
    return runs
      .map((run) => {
        if (run.text) {
          return run.text;
        }
        if (run.emoji) {
          if (emojiHandler) {
            return emojiHandler(run.emoji);
          }

          return (
            "<" + run.emoji.image.accessibility.accessibilityData.label + ">"
          );
        }
      })
      .join("");
  } catch (err) {
    console.log(err, runs);
    throw new Error("failed to render runs into string");
  }
}

export function timeoutThen(duration: number): Promise<number> {
  return new Promise((resolve) => setTimeout(resolve, duration));
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
