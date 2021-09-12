#!/usr/bin/env/node

import { Masterchat, normalizeVideoId, runsToString } from "..";
import { fetchMetadataFromEmbed } from "../services/context";

function log(...obj: any) {
  console.log(...obj);
}

async function main({
  videoId,
  useCredentials = false,
}: {
  videoId: string;
  useCredentials?: boolean;
}) {
  // const m = await fetchMetadataFromEmbed(videoId);
  // console.log(JSON.stringify(m));

  const mc = await Masterchat.init(videoId, {
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

const videoId = process.argv[2] || process.env.MC_MSG_TEST_ID;
if (!videoId) {
  throw new Error("missing videoId");
}

const credentials = process.env.MC_MSG_TEST_CREDENTIALS;

main({ videoId: normalizeVideoId(videoId) });
