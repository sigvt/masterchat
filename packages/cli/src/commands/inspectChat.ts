import chalk from "chalk";
import {
  Action,
  convertRunsToString,
  fetchContext,
  iterateChat,
  normalizeVideoId,
  ReloadContinuationType,
} from "masterchat";
import { compileExpression } from "filtrex";
import { timeoutThen } from "masterchat/lib/util";
import { ChatAdditionAction } from "masterchat/lib/types/chat";

interface CustomAddChatItemAction extends ChatAdditionAction {
  message?: string;
}

export function flattenActions(
  actions: Action[],
  {
    ignoreModerationEvents = true,
    showAuthor = true,
  }: { ignoreModerationEvents?: boolean; showAuthor?: boolean } = {}
): string[] {
  const simpleChat: string[] = [];

  for (const action of actions) {
    switch (action.type) {
      case "addChatItemAction":
        if (action.rawMessage || action.superchat) {
          let text = "";

          if (showAuthor) {
            const colorize = action.isModerator ? chalk.green : chalk.gray;
            text += `${colorize(action.authorName + ": ")}`;
          }

          text += action.rawMessage
            ? convertRunsToString(action.rawMessage)
            : "<empty message>";

          if (action.superchat) {
            text += ` (${action.superchat.amount} ${action.superchat.currency})`;
          }

          simpleChat.push(text);
        }
        break;
      case "markChatItemsByAuthorAsDeletedAction":
        if (!ignoreModerationEvents) {
          simpleChat.push(chalk.red(`[banned]: ${action.channelId}`));
        }
        break;
      case "markChatItemAsDeletedAction":
        if (!ignoreModerationEvents) {
          simpleChat.push(
            chalk.yellow(
              `${action.retracted ? "[retracted]" : "[deleted]"}: ${
                action.targetId
              }`
            )
          );
        }
        break;
    }
  }
  return simpleChat;
}

export async function inspectChat(argv: any) {
  process.on("SIGINT", () => {
    process.exit(0);
  });

  const videoId: string = normalizeVideoId(argv.video);
  const verbose: boolean = argv.verbose;
  const showModeration: boolean = argv.mod;
  const showAuthor: boolean = argv.author;
  const type = argv.type as ReloadContinuationType;
  const filterExp: string = Array.isArray(argv.filter)
    ? argv.filter[0]
    : argv.filter;
  const filter = filterExp
    ? compileExpression(filterExp, {
        extraFunctions: {
          match: function (query: string, match: string, flags?: string) {
            return new RegExp(match, flags).test(query);
          },
        },
      })
    : undefined;

  // get web player context
  const context = await fetchContext(videoId);
  const { metadata } = context;

  // check if the video is valid
  if (!metadata) {
    console.log("video source is unavailable. wrong video id?");
    process.exit(1);
  }

  // check if the stream is live
  const isLive = metadata.isLive;

  if (!isLive) {
    console.log("only live stream is supported");
    process.exit(1);
  }

  if (!context.continuations) {
    console.log(
      "reload continuation not found. try again later or maybe it's a normal video."
    );
    process.exit(1);
  }

  console.log("title:", metadata.title);

  const initialToken = context.continuations[type].token;

  const liveChatIter = iterateChat({
    ...context.auth,
    token: initialToken,
    isLiveChat: isLive,
  });

  let chatQueue: string[] = [];
  let wait = 0;

  new Promise(async () => {
    while (true) {
      const timeout = Math.ceil(wait / (chatQueue.length + 1)) || 0;
      await new Promise((resolve) => setTimeout(resolve, timeout));
      wait = Math.max(0, wait - timeout);
      if (chatQueue.length > 0) {
        console.log(chatQueue.shift());
      }
    }
  });

  // fetch chat
  for await (const { actions, delay } of liveChatIter) {
    if (verbose) {
      console.log("incoming actions:", actions.length, "delay:", delay);
    }

    if (actions.length > 0) {
      let aggregatedActions = actions;

      for (const action of aggregatedActions) {
        if (action.type === "addChatItemAction") {
          (action as CustomAddChatItemAction).message = action.rawMessage
            ? convertRunsToString(action.rawMessage)
            : "";
        }
      }

      if (filter) {
        aggregatedActions = aggregatedActions.filter(
          (action) => action.type !== "addChatItemAction" || filter(action)
        );
      }

      const simpleChat: string[] = flattenActions(aggregatedActions, {
        ignoreModerationEvents: !showModeration,
        showAuthor,
      });

      if (simpleChat.length > 0) {
        chatQueue = [...chatQueue, ...simpleChat];
      }

      wait += delay || 0;
    }

    await timeoutThen(delay);
  }

  console.log("Live stream is over");
  process.exit(0);
}
