import chalk from "chalk";
import { logAndExit } from "epicfail";
import fs from "node:fs";
import {
  Action,
  convertRunsToString,
  fetchContext,
  iterateChat,
  normalizeVideoId,
  timeoutThen,
} from "masterchat";
import { VM, VMScript } from "vm2";

export function stringifyActions(
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
  const collectionMode: boolean = argv.collect;
  const type = argv.type as "top" | "all";
  const filterExp: string = Array.isArray(argv.filter)
    ? argv.filter[0]
    : argv.filter;
  const filter = compileFilter(filterExp);

  // get web player context
  const context = await fetchContext(videoId);
  if (!context) {
    throw new Error("context not found");
  }
  const { metadata, chat, apiKey } = context;

  // check if the stream is live
  const isLive = metadata.isLive;

  if (!isLive) {
    logAndExit("only live stream is supported");
  }

  if (!chat) {
    logAndExit(
      "reload continuation not found. try again later or maybe it's a normal video."
    );
  }

  console.log("title:", metadata.title);

  const initialToken = chat.continuations[type].token;

  const liveChatIter = iterateChat({
    apiKey,
    token: initialToken,
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
  for await (const response of liveChatIter) {
    if (response.error) {
      const { error } = response;
      console.log(`Error(${error.status}): ${error.message}`);
      break;
    }
    const { actions, continuation } = response;
    const delay = continuation?.timeoutMs || 0;

    if (verbose) {
      console.log("incoming actions:", actions.length, "delay:", delay);
    }

    if (collectionMode) {
      for (const action of actions) {
        const type = action.type;
        const payload = action;

        fs.appendFileSync(`${type}.jsonl`, JSON.stringify(payload) + "\n");
      }
    }

    if (actions.length > 0) {
      let aggregatedActions = actions;

      if (filter) {
        aggregatedActions = aggregatedActions.filter((action) => {
          const filterContext = {
            ...action,
            isSuperchat: action.type === "addSuperChatItemAction",
            message:
              "rawMessage" in action && action.rawMessage
                ? convertRunsToString(action.rawMessage)
                : "",
          };
          return filter(filterContext);
        });
      }

      const chat: string[] = stringifyActions(aggregatedActions, {
        ignoreModerationEvents: !showModeration,
        showAuthor,
      });

      if (chat.length > 0) {
        chatQueue = [...chatQueue, ...chat];
      }

      wait += delay || 0;
    }

    await timeoutThen(delay);
  }

  console.log("Live stream is over");
  process.exit(0);
}
