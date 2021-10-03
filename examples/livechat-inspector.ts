#!/usr/bin/env/node

import { Masterchat, asString, SuperChat } from "masterchat";
import chalk from "chalk";

function log(...obj: any) {
  console.log(...obj);
}

function chalkSc(color: SuperChat["color"]) {
  switch (color) {
    case "blue":
      return chalk.blue;
    case "green":
      return chalk.green;
    case "lightblue":
      return chalk.blueBright;
    case "magenta":
      return chalk.magenta;
    case "orange":
      return chalk.yellowBright;
    case "red":
      return chalk.red;
    case "yellow":
      return chalk.yellow;
  }
}

async function main({ videoIdOrUrl }: { videoIdOrUrl: string }) {
  const mc = await Masterchat.init(videoIdOrUrl, {
    credentials,
  });

  mc.on("data", (data) => {
    const { actions, continuation } = data;
    log("token", continuation?.token);
    log("timeoutMs", continuation?.timeoutMs);
    log(
      "now",
      new Date(),
      "next",
      continuation?.timeoutMs && new Date(Date.now() + continuation.timeoutMs)
    );
    log("actions", actions.length);
    for (const action of actions) {
      switch (action.type) {
        case "addChatItemAction": {
          log(chalk.gray(`${action.authorName}:`), asString(action.rawMessage));
          break;
        }
        case "addSuperChatItemAction": {
          log(
            chalkSc(action.superchat.color)(`$$$$$$$$$$$$$$$$$
${action.authorName}: ${action.superchat.amount} ${
              action.superchat.currency
            } (${action.superchat.color})
${asString(action.rawMessage ?? "<empty message>")}
$$$$$$$$$$$$$$$$$`)
          );
          break;
        }
        case "addMembershipItemAction": {
          log(
            chalk.green(`=================
Welcome ${action.tenant}, ${action.authorName} !
${action.membership.status} ${action.membership.since ?? ""}
=================`)
          );
          break;
        }
        case "addMembershipMilestoneItemAction": {
          log(
            chalk.green(`=================
${action.authorName} (${action.membership.status} ${
              action.membership.since ?? ""
            })
Member of ${action.tenant} for ${action.durationText}
${action.message ? asString(action.message) : "<empty message>"}
=================`)
          );
          break;
        }
        case "addBannerAction": {
          log(
            chalk.blue(`=================
${asString(action.title)}
${asString(action.message)}
${action}
=================`)
          );
          break;
        }
        case "addViewerEngagementMessageAction": {
          log(
            chalk.red(`=================
[${action.icon.iconType}] ${asString(action.message)}
=================`)
          );
          break;
        }
      }
    }
  });

  mc.on("error", (err) => console.log("ERROR", err));
  mc.on("end", () => console.log("END"));

  mc.listen();
}

const videoIdOrUrl = process.argv[2] || process.env.MC_MSG_TEST_ID;
if (!videoIdOrUrl) {
  throw new Error("missing videoId or URL");
}

const credentials = process.env.MC_MSG_TEST_CREDENTIALS;

main({ videoIdOrUrl });
