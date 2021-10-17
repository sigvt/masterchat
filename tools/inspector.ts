#!/usr/bin/env/node
// livechat inspector

import chalk from "chalk";
import {
  AddChatItemAction,
  ChatResponse,
  formatColor,
  Masterchat,
  stringify,
  SuperChat,
} from "masterchat";
import { ChatHistory, printData } from "./common";

async function main({ videoIdOrUrl }: { videoIdOrUrl: string }) {
  const history = new ChatHistory();
  const mc = await Masterchat.init(videoIdOrUrl, { credentials });

  const url = `https://youtu.be/${mc.videoId}`;

  console.log(mc.title);
  console.log(mc.channelName);
  console.log(url);
  console.log("-----------------");

  mc.on("data", (data) => printData({ data, history, mc }));
  mc.on("error", (err) => console.log("[ERROR]", err, url));
  mc.on("end", (reason) => console.log("[END]", `reason=${reason}`, url));

  mc.listen();
}

const videoIdOrUrl = process.argv[2] || process.env.MC_MSG_TEST_ID;
if (!videoIdOrUrl) {
  throw new Error("missing videoId or URL");
}

const credentials = process.env.MC_MSG_TEST_CREDENTIALS;

main({ videoIdOrUrl });
