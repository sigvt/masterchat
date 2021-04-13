import chalk from "chalk";
import { logAndExit } from "epicfail";
import {
  convertRunsToString,
  fetchContext,
  iterateChat,
  normalizeVideoId,
} from "masterchat";
import {
  Action,
  AddChatItemAction,
  ReloadContinuationType,
} from "masterchat/lib/chat";
import { timeoutThen } from "masterchat/lib/util";
import { VM, VMScript } from "vm2";

interface CustomAddChatAction extends AddChatItemAction {
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
      case "addSuperChatItemAction": {
        let text = "";

        if (showAuthor) {
          text += chalk.gray(action.authorName);
          text += ": ";
        }

        text += action.rawMessage
          ? convertRunsToString(action.rawMessage)
          : "<empty message>";

        text += ` (${action.superchat.amount} ${action.superchat.currency})`;

        simpleChat.push(text);
        break;
      }
      case "addChatItemAction": {
        let text = "";

        if (showAuthor) {
          const colorize = action.membership ? chalk.green : chalk.gray;
          const badges = [];

          if (action.isModerator) {
            badges.push("🛠");
          }

          if (action.isVerified) {
            badges.push("✅");
          }

          if (action.isOwner) {
            badges.push("⚡️");
          }

          text += colorize(action.authorName);

          if (badges.length >= 1) {
            text += "( " + badges.join(" ") + " )";
          }

          text += ": ";
        }

        text += convertRunsToString(action.rawMessage);

        simpleChat.push(text);
        break;
      }
      case "markChatItemsByAuthorAsDeletedAction": {
        if (!ignoreModerationEvents) {
          simpleChat.push(chalk.red(`[banned]: ${action.channelId}`));
        }
        break;
      }
      case "markChatItemAsDeletedAction": {
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
  }
  return simpleChat;
}

function compileFilter(
  rule: string | undefined
): ((args: any) => boolean) | undefined {
  if (!rule) {
    return undefined;
  }

  const compiledRule = new VMScript(rule).compile();

  return (args: any) => {
    return new VM({
      sandbox: args,
      eval: false,
      wasm: false,
    }).run(compiledRule);
  };
}

export async function inspectChat(argv: any) {
  process.on("SIGINT", () => {
    process.exit(0);
  });

  const videoId: string = normalizeVideoId(argv.video);
  const verbose: boolean = argv.verbose;
  const showModeration: boolean = argv.mod;
  const showAuthor: boolean = argv.author;
  const ignoreChat: boolean = !!argv.ignoreChat;
  const type = argv.type as ReloadContinuationType;
  const filterExp: string = Array.isArray(argv.filter)
    ? argv.filter[0]
    : argv.filter;
  const filter = compileFilter(filterExp);

  // get web player context
  const context = await fetchContext(videoId);
  const { metadata } = context;

  // check if the video is valid
  if (!metadata) {
    logAndExit("video source is unavailable. wrong video id?");
  }

  // check if the stream is live
  const isLive = metadata.isLive;

  if (!isLive) {
    logAndExit("only live stream is supported");
  }

  if (!context.continuations) {
    logAndExit(
      "reload continuation not found. try again later or maybe it's a normal video."
    );
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
          // stringified message
          (action as CustomAddChatAction).message = action.rawMessage
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
