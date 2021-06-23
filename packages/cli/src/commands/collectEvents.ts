import { logAndExit } from "epicfail";
import fs from "fs";
import {
  fetchContext,
  iterateChat,
  normalizeVideoId,
  timeoutThen,
  Action,
  ReloadContinuationType,
} from "masterchat";

export async function collectEvents(argv: any) {
  console.log("Event collection mode is enabled");

  process.on("SIGINT", () => {
    process.exit(0);
  });

  const videoId: string = normalizeVideoId(argv.video);
  const type = argv.type as ReloadContinuationType;

  // get web player context
  const context = await fetchContext(videoId);
  if (!context) {
    throw new Error("context not found");
  }
  const { metadata } = context;

  // check if the video is valid
  if (!metadata) {
    logAndExit(
      "video source is unavailable. wrong video id or membership-only stream?"
    );
  }

  // check if the stream is live
  const isLive = metadata.isLive;

  if (!isLive) {
    logAndExit("only live stream is supported");
  }

  if (!context.continuations) {
    logAndExit(
      "reload continuation not found. try again later or maybe it's a normal video."
    );
  }

  console.log("title:", metadata.title);

  const initialToken = context.continuations[type].token;

  const liveChatIter = iterateChat({
    ...context.auth,
    token: initialToken,
  });

  const ignoredTypes: Action["type"][] = [];

  // fetch chat
  for await (const response of liveChatIter) {
    if (response.error) {
      const { error } = response;

      console.log(`Error(${error.status}): ${error.message}`);
      break;
    }

    const { actions, continuation } = response;

    // console.log("incoming actions:", actions.length, "delay:", delay);

    for (const action of actions) {
      const type = action.type;
      const payload = action;

      if (ignoredTypes.includes(type)) continue;

      fs.appendFileSync(`${type}.jsonl`, JSON.stringify(payload) + "\n");
    }

    const delay = continuation?.timeoutMs || 0;
    await timeoutThen(delay);
  }

  console.log("Live stream is over");
  process.exit(0);
}
