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
        if ("text" in run) {
          return run.text;
        }

        if ("emoji" in run) {
          if (emojiHandler) {
            return emojiHandler(run.emoji);
          }

          const isCustomEmoji = run.emoji.isCustomEmoji;
          const term = isCustomEmoji
            ? ":" +
              run.emoji.searchTerms[run.emoji.searchTerms.length - 1] +
              ":"
            : run.emoji.emojiId;

          return term;
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

/*
# Custom Emoji
{
  "emojiId": "UCQ0UDLQCjY0rmuxCDE38FGg/kde7X-mJFYbl-gOTuaGoBQ",
  "shortcuts": [
    ":_[omitted]:",
    ":[omitted]:",
    ":_[omitted]:",
    ":[omitted]:"
  ],
  "searchTerms": [
    "_[omitted]",
    "[omitted]",
    "_[omitted]",
    "[omitted]"
  ],
  "image": {
    "thumbnails": [
      {
        "url": "[omitted]",
        "width": 24,
        "height": 24
      },
      {
        "url": "[omitted]",
        "width": 48,
        "height": 48
      }
    ],
    "accessibility": {
      "accessibilityData": {
        "label": "[omitted]"
      }
    }
  },
  "isCustomEmoji": true
}

# Emoji
{
  "emojiId": "🎶",
  "shortcuts": [
    ":musical_notes:",
    ":notes:"
  ],
  "searchTerms": [
    "musical",
    "notes"
  ],
  "image": {
    "thumbnails": [
      {
        "url": "https://www.youtube.com/s/gaming/emoji/7ff574f2/emoji_u1f3b6.svg"
      }
    ]
  }
}
*/
