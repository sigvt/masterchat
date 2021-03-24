import chalk from "chalk";
import { Action, Run } from "./types/chat";

export function guessFreeChat(title: string) {
  return /(?:[fF]ree\s?[cC]hat|(?:ふりー|フリー)(?:ちゃっと|チャット))/.test(
    title
  );
}

export function timeoutThen(duration: number): Promise<number> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

export function normalizeVideoId(idOrUrl: string) {
  return idOrUrl.replace(/^https?:\/\/www\.youtube\.com\/watch\?v=/, "");
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

export function convertRunsToString(runs: Run[]): string {
  try {
    return runs
      .map((run) => {
        if (run.text) {
          return run.text;
        }
        if (run.emoji) {
          return (
            ":" + run.emoji.image.accessibility.accessibilityData.label + ":"
          );
        }
      })
      .join("");
  } catch (err) {
    console.log(err, runs);
    throw new Error("failed to render runs into string");
  }
}

export function toSimpleChat(actions: Action[]): string[] {
  const simpleChat: string[] = [];

  for (const action of actions) {
    switch (action.type) {
      case "addChatItemAction":
        if (action.rawMessage || action.purchase) {
          simpleChat.push(
            (action.rawMessage
              ? convertRunsToString(action.rawMessage)
              : "EMPTY MESSAGE") +
              (action.purchase
                ? " (" +
                  action.purchase.amount +
                  " " +
                  action.purchase.currency +
                  ")"
                : "")
          );
        }
        break;
      case "markChatItemsByAuthorAsDeletedAction":
        simpleChat.push(
          chalk.red("markChatItemsByAuthorAsDeletedAction: " + action.channelId)
        );
        break;
      case "markChatItemAsDeletedAction":
        simpleChat.push(
          chalk.yellow(
            "markChatItemAsDeletedAction: " + action.targetId,
            action.retracted ? "[retracted]" : "[deleted]"
          )
        );
        break;
    }
  }
  return simpleChat;
}
