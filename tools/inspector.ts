#!/usr/bin/env/node
// livechat inspector

import chalk from "chalk";
import {
  AddChatItemAction,
  formatColor,
  Masterchat,
  stringify,
  SuperChat,
} from "masterchat";

const MAX_VISIBLE_CHATS = 2;
const CHAT_HISTORY_SIZE = 5000;

async function main({ videoIdOrUrl }: { videoIdOrUrl: string }) {
  const history = new ChatHistory();
  const mc = await Masterchat.init(videoIdOrUrl, { credentials });

  console.log(mc.title);
  console.log(mc.channelName);
  console.log("-----------------");

  mc.on("data", (data) => {
    const { actions, continuation } = data;
    // log("token", continuation?.token);
    log(
      "actions",
      actions.length,
      "timeoutMs",
      continuation?.timeoutMs,
      "now",
      new Date(),
      "next",
      continuation?.timeoutMs && new Date(Date.now() + continuation.timeoutMs)
    );
    let chatCount = 0;
    for (const action of actions) {
      switch (action.type) {
        case "replaceChatItemAction":
          const id = action.targetItemId;
          const item = action.replacementItem;
          // if ("liveChatPlaceholderItemRenderer" in item) {
          //   item.liveChatPlaceholderItemRenderer.id;
          // }
          const target = history.findOne(id);
          log(
            chalk.blue(`=================
[replace ${id}]
${target}
↓
${item}
=================`)
          );
          break;
        case "addChatItemAction": {
          if (chatCount === MAX_VISIBLE_CHATS) {
            log(chalk.gray("..."));
            chatCount += 1;
          }
          if (chatCount < MAX_VISIBLE_CHATS) {
            log(
              chalk.gray(`${action.authorChannelId} ${action.authorName}:`),
              stringify(action.rawMessage)
            );
            chatCount += 1;
          }

          history.insert(action);
          break;
        }
        case "addSuperChatItemAction": {
          log(
            chalk.yellow(`¥¥¥¥¥¥¥¥¥¥¥¥¥¥¥¥¥
${action.authorName}: ${chalkSc(action.superchat.color)(
              `${action.superchat.amount} ${action.superchat.currency}`
            )}
${stringify(action.rawMessage ?? "<empty message>")}
¥¥¥¥¥¥¥¥¥¥¥¥¥¥¥¥¥`)
          );
          break;
        }
        case "addSuperChatTickerAction": {
          log(
            chalkSc(action.superchat.color)(
              `【${formatColor(action.startBackgroundColor, "hex")} (${
                action.durationSec
              }/${action.fullDurationSec}) ${action.authorName}: ${
                action.amountText
              }】`
            )
          );
          break;
        }
        case "addMembershipItemAction": {
          log(
            chalk.green(`=================
[Membership Joined] Welcome${action.level ? ` ${action.level},` : ""} ${
              action.authorName
            } !
${action.membership.status} ${action.membership.since ?? ""}
=================`)
          );
          break;
        }
        case "addMembershipMilestoneItemAction": {
          log(
            chalk.green(`=================
[Milestone] ${action.authorName} (${action.membership.status} ${
              action.membership.since ?? ""
            })
Member${action.level ? ` of ${action.level}` : ""} for ${
              action.durationText
            } (${action.duration})
${action.message ? stringify(action.message) : "<empty message>"}
=================`)
          );
          break;
        }
        case "addBannerAction": {
          log(
            chalk.blue(`=================
${stringify(action.title)}
${stringify(action.message)}
${JSON.stringify(action)}
=================`)
          );
          break;
        }
        case "addViewerEngagementMessageAction": {
          log(
            chalk.red(`=================
[${action.messageType}] ${stringify(action.message)}
=================`)
          );
          break;
        }
        case "modeChangeAction": {
          log(
            chalk.cyan(`=================
[${action.mode} set to ${action.enabled}] ${stringify(action.description)}
=================`)
          );
          break;
        }
        case "showLiveChatActionPanelAction": {
          console.log(JSON.stringify(action));
          log(
            chalk.cyan(`=================
[open ${action.targetId}]
${action.contents.pollRenderer.choices.map((choice, i) => {
  return `${i + 1}: ${choice.text} ${choice.votePercentage} ${
    choice.voteRatio
  } ${choice.selected}\n`;
})}
${action.contents.pollRenderer.header.pollHeaderRenderer.liveChatPollType}
${stringify(
  action.contents.pollRenderer.header.pollHeaderRenderer.metadataText
)}
${stringify(
  action.contents.pollRenderer.header.pollHeaderRenderer.pollQuestion
)}
=================`)
          );
          break;
        }
        case "updateLiveChatPollAction": {
          log(
            chalk.cyan(`=================
${action.choices.map((choice, i) => {
  return `${i + 1}: ${choice.text} ${choice.votePercentage} ${
    choice.voteRatio
  } ${choice.selected}\n`;
})}
${action.header.pollHeaderRenderer.liveChatPollType}
${stringify(action.header.pollHeaderRenderer.pollQuestion)}
${stringify(action.header.pollHeaderRenderer.metadataText)}
=================`)
          );
          break;
        }
        case "closeLiveChatActionPanelAction": {
          log(
            chalk.cyan(`=================
[close ${action.targetPanelId}]
${action.skipOnDismissCommand}
=================`)
          );
          break;
        }
        case "markChatItemAsDeletedAction": {
          const chat = history.findOne(action.targetId);
          log(
            chalk.bgYellow.black(`=================
[${action.retracted ? "retracted" : "deleted"} ${action.targetId}]
${chat}
=================`)
          );
          break;
        }
        case "markChatItemsByAuthorAsDeletedAction": {
          const chats = history.findByChannelId(action.channelId);
          log(
            chalk.bgRed(`=================
[hidden|timeout ${action.channelId}]
${chats.map((chat) => `- ${chat}\n`)}
=================`)
          );
          break;
        }
      }
    }
  });

  const url = `https://youtu.be/${mc.videoId}`;
  mc.on("error", (err) => console.log("[ERROR]", err, url));
  mc.on("end", (reason) => console.log("[END]", `reason=${reason}`, url));

  mc.listen();
}

function log(...obj: any) {
  console.log(...obj);
}

function chalkSc(color: SuperChat["color"]) {
  switch (color) {
    case "blue":
      return chalk.bgBlue.black;
    case "green":
      return chalk.bgGreen.black;
    case "lightblue":
      return chalk.bgBlueBright.black;
    case "magenta":
      return chalk.bgMagenta.black;
    case "orange":
      return chalk.bgYellowBright.black;
    case "red":
      return chalk.bgRed.black;
    case "yellow":
      return chalk.bgYellow.black;
  }
}

class ChatHistory {
  db: [string, string, string][] = [];
  private sweep() {
    this.db.splice(0, this.db.length - CHAT_HISTORY_SIZE);
  }
  private transform(action: AddChatItemAction): [string, string, string] {
    return [action.id, action.authorChannelId, stringify(action.rawMessage)];
  }
  insert(action: AddChatItemAction) {
    this.db.push(this.transform(action));
    this.sweep();
  }
  bulkInsert(actions: AddChatItemAction[]) {
    this.db.push(...actions.map(this.transform));
    this.sweep();
  }
  findByChannelId(channelId: string) {
    return this.db.filter((rec) => rec[1] === channelId).map((rec) => rec[2]);
  }
  findOne(chatId: string) {
    return this.db.find((rec) => rec[0] === chatId)?.[2];
  }
}

const videoIdOrUrl = process.argv[2] || process.env.MC_MSG_TEST_ID;
if (!videoIdOrUrl) {
  throw new Error("missing videoId or URL");
}

const credentials = process.env.MC_MSG_TEST_CREDENTIALS;

main({ videoIdOrUrl });
