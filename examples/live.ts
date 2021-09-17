#!/usr/bin/env/node

import { AddBannerAction, Masterchat, runsToString } from "masterchat";

function log(...obj: any) {
  console.log(...obj);
}

async function main({
  videoIdOrUrl,
  useCredentials = false,
}: {
  videoIdOrUrl: string;
  useCredentials?: boolean;
}) {
  const mc = await Masterchat.init(videoIdOrUrl, {
    credentials: useCredentials ? credentials : undefined,
  });

  for await (const res of mc.iterate()) {
    const { actions, continuation } = res;
    log("token", continuation?.token);
    log("timeoutMs", continuation?.timeoutMs);
    log(
      "now",
      new Date(),
      "next",
      continuation?.timeoutMs && new Date(Date.now() + continuation.timeoutMs)
    );
    log("actions", actions.length, res.error);
    for (const action of actions) {
      switch (action.type) {
        case "addBannerAction": {
          log("=================");
          log(
            runsToString(action.header.liveChatBannerHeaderRenderer.text.runs)
          );
          log(
            runsToString(
              action.contents.liveChatTextMessageRenderer.message.runs
            )
          );
          log("=================");
          break;
        }
        case "addChatItemAction": {
          log(`-${action.authorName}>`, runsToString(action.rawMessage));
          break;
        }
        case "addSuperChatItemAction": {
          log(
            `$${action.authorName}>`,
            runsToString(action.rawMessage ?? []),
            action.superchat.amount,
            action.superchat.currency
          );
          break;
        }
      }
    }
  }
}

const videoIdOrUrl = process.argv[2] || process.env.MC_MSG_TEST_ID;
if (!videoIdOrUrl) {
  throw new Error("missing videoId or URL");
}

const credentials = process.env.MC_MSG_TEST_CREDENTIALS;

main({ videoIdOrUrl });
