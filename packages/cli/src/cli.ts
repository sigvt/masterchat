#!/usr/bin/env node

import yargs from "yargs";
import { inspectChat } from "./commands/inspectChat";
import epicfail from "epicfail";

epicfail();

yargs(process.argv.slice(2))
  .scriptName("masterchat")
  .command(
    "inspect <video>",
    "inspect the live chat messages",
    (yargs) => {
      yargs
        .positional("video", {
          describe: "video id or video url",
        })
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
        });
    },
    inspectChat
  )
  .demandCommand()
  .help().argv;
