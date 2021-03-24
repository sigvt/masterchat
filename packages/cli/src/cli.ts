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
        });
    },
    inspectChat
  )
  .demandCommand()
  .help().argv;
