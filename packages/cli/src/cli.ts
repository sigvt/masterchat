#!/usr/bin/env node

import yargs from "yargs";
import { inspectChat } from "./commands/liveChat";
import epicfail from "epicfail";

epicfail();

const argv = yargs(process.argv.slice(2))
  .scriptName("masterchat")
  .usage("$0 <video>", "inspect chat", (yargs) =>
    yargs.positional("video", {
      describe: "video id or video url",
    })
  )
  .option("verbose", {
    describe: "Print additional info",
    alias: "v",
    default: false,
    type: "boolean",
  })
  .option("type", {
    describe: "Chat type",
    alias: "t",
    default: "top",
    choices: ["top", "all"],
  })
  .option("filter", {
    describe: "Filter rule",
    alias: "f",
    type: "string",
  })
  .option("mod", {
    describe: "Show moderation events",
    alias: "m",
    type: "boolean",
    default: false,
  })
  .option("author", {
    describe: "Show author name",
    alias: "a",
    type: "boolean",
    default: false,
  })
  .option("collect", {
    describe: "Save received actions in JSONLines format",
    alias: "c",
    type: "boolean",
  })
  .showHelpOnFail(false).argv;

inspectChat(argv);
