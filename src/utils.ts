import debug from "debug";
import { DC } from "./constants";
import { YTEmoji, YTRun } from "./yt/chat";

export const debugLog = debug("masterchat");

export function guessFreeChat(title: string) {
  return /(?:[fF]ree\s?[cC]hat|(?:ふりー|フリー)(?:ちゃっと|チャット))/.test(
    title
  );
}

export function normalizeVideoId(idOrUrl: string) {
  return idOrUrl.replace(/^https?:\/\/www\.youtube\.com\/watch\?v=/, "");
}

export function runsToString(
  runs: YTRun[],
  {
    emojiHandler = undefined,
  }: { emojiHandler?: (emoji: YTEmoji) => string } = {}
): string {
  return runs
    .map((run) => {
      if ("text" in run) {
        return run.text;
      }

      if ("emoji" in run) {
        const { emoji } = run;

        if (emojiHandler) {
          return emojiHandler(emoji);
        }

        const term = emoji.isCustomEmoji
          ? emoji.shortcuts[emoji.shortcuts.length - 1] + ":"
          : emoji.emojiId;

        return term;
      }
    })
    .join("");
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

export function withContext(input: any = {}) {
  return {
    ...input,
    context: {
      ...input?.context,
      client: DC,
    },
  };
}

export function h(b: TemplateStringsArray) {
  return Buffer.from(b.raw[0], "hex").toString();
}
