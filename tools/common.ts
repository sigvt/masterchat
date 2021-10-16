import chalk, { gray } from "chalk";
import {
  AddChatItemAction,
  ChatResponse,
  formatColor,
  stringify,
  SuperChat,
} from "masterchat";

const CHAT_HISTORY_SIZE = 10000;

export function handleData({
  data,
  history,
  prefix,
  maxChats = 0,
  verbose = false,
  showTicker = false,
}: {
  data: ChatResponse;
  history: ChatHistory;
  prefix?: string;
  maxChats?: number;
  verbose?: boolean;
  showTicker?: boolean;
}) {
  function log(...obj: any) {
    const lines = obj.join(" ").split("\n");
    for (const line of lines) {
      if (prefix) process.stdout.write(chalk.gray(prefix) + " ");
      console.log(line);
    }
  }

  const { actions, continuation } = data;
  if (verbose) {
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
  }

  let chatCount = 0;
  for (const action of actions) {
    switch (action.type) {
      case "addPlaceholderItemAction": {
        const id = action.id;
        const target = history.findOne(id)?.[2];
        log(
          chalk.blue(
            `[placeholder]${target ? " " + target : ""} ${chalk.gray(
              action.id
            )}`
          )
        );
        break;
      }
      case "replaceChatItemAction": {
        const id = action.targetItemId;
        const item = action.replacementItem;
        const itemType = Object.keys(item)[0];
        // const target = history.findOne(id)?.[2];
        log(chalk.blue(`[replace] ${id} → ${itemType}`));
        break;
      }
      case "addChatItemAction": {
        if (chatCount < maxChats) {
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
          chalk.yellow(
            `[sc] ${chalkSc(action.superchat.color)(
              `${action.superchat.amount} ${action.superchat.currency}`
            )} ${action.authorName}: ${stringify(
              action.rawMessage ?? "<empty message>"
            )}`
          )
        );
        break;
      }
      case "addSuperStickerItemAction": {
        log(
          chalk.yellow(
            `[super sticker] ${stringify(action.authorName)}: ${
              action.sticker.accessibility.accessibilityData.label
            }`
          )
        );
        break;
      }
      case "addMembershipItemAction": {
        log(
          chalk.green(
            `[membership joined] Welcome${
              action.level ? ` ${action.level},` : ""
            } ${action.authorName} !: ${action.membership.status} ${
              action.membership.since ?? ""
            }`
          )
        );
        break;
      }
      case "addMembershipMilestoneItemAction": {
        log(
          chalk.green(
            `[milestone ${action.authorName} (${action.membership.status} ${
              action.membership.since ?? ""
            })] Member${action.level ? ` of ${action.level}` : ""} for ${
              action.durationText
            } (${action.duration}): ${
              action.message ? stringify(action.message) : "<empty message>"
            }`
          )
        );
        break;
      }
      case "addMembershipTickerAction": {
        if (!showTicker) break;
        log(
          chalk.green(
            `<membership (${action.durationSec}/${
              action.fullDurationSec
            }) ${stringify(action.detailText)}>`
          )
        );
        break;
      }
      case "addSuperChatTickerAction": {
        if (!showTicker) break;
        log(
          chalk.yellow(
            `<sc ${chalkSc(action.superchat.color)(
              formatColor(action.startBackgroundColor, "hex")
            )} (${action.durationSec}/${action.fullDurationSec}) ${
              action.authorName
            }: ${action.amountText}>`
          )
        );
        break;
      }
      case "addSuperStickerTickerAction": {
        if (!showTicker) break;
        log(
          chalk.yellow(
            `<super sticker (${action.durationSec}/${action.fullDurationSec}) ${action.authorExternalChannelId}>`
          )
        );
        break;
      }
      case "addBannerAction": {
        log(
          chalk.blue(`=================
[${action.type}] ${stringify(action.title)}
${action.authorName}: ${stringify(action.message)}
=================`)
        );
        break;
      }
      case "addViewerEngagementMessageAction": {
        log(chalk.cyan(`[${action.messageType}] ${stringify(action.message)}`));
        break;
      }
      case "modeChangeAction": {
        log(
          chalk.blue(`=================
[mode change] ${action.mode} set to ${action.enabled}: ${stringify(
            action.description
          )}
=================`)
        );
        break;
      }
      case "showPollPanelAction": {
        log(JSON.stringify(action));
        log(
          chalk.cyan(`=================
[openPoll ${action.targetId}]
${action.choices
  .map((choice, i) => {
    return `${i + 1}: ${stringify(choice.text)} ${stringify(
      choice.votePercentage!
    )} ${choice.voteRatio} ${choice.selected}`;
  })
  .join("\n")}
${action.pollType}
${action.question}
${action.authorName}
=================`)
        );
        break;
      }
      case "updateLiveChatPollAction": {
        log(
          chalk.cyan(
            `[updatePoll ${action.liveChatPollId}]: ${stringify(
              action.header.pollHeaderRenderer.pollQuestion
            )} - ${stringify(action.header.pollHeaderRenderer.metadataText)}`
          )
        );
        break;
      }
      case "closeLiveChatActionPanelAction": {
        log(
          chalk.cyan(`=================
[closePanel ${action.targetPanelId}]
${action.skipOnDismissCommand}
=================`)
        );
        break;
      }
      case "markChatItemAsDeletedAction": {
        const chat = history.findOne(action.targetId);
        log(
          chalk.red(
            `[${action.retracted ? "retracted" : "deleted"}]${
              chat ? " " + `${chat[2]} (${chat[1]})` : ""
            } ${chalk.gray(action.targetId)}`
          )
        );
        break;
      }
      case "markChatItemsByAuthorAsDeletedAction": {
        const chats = history.findByChannelId(action.channelId);
        log(
          chalk.bgRed(`=================
[hidden|timeout ${action.channelId}]
${chats.map((chat) => `- ${chat}\n`).join("")}=================`)
        );
        break;
      }
      case "showTooltipAction": {
        if (action.promoConfig.promoId === "tip-edu-c-live-chat-banner-w")
          break;

        log(
          chalk.bgBlue.black(
            `[tooltip ${action.targetId}] ${stringify(
              action.promoConfig.promoId
            )}`
          )
        );
        break;
      }
      default:
        log(chalk.gray(JSON.stringify(action)));
        log(chalk.bgCyan.black("[unhandled]", action.type));
    }
  }
}

export function chalkSc(color: SuperChat["color"]) {
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

export class ChatHistory {
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
    return this.db.find((rec) => rec[0] === chatId);
  }
}
