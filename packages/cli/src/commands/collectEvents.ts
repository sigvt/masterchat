import { logAndExit } from "epicfail";
import fs from "fs";
import { fetchContext, iterateChat, normalizeVideoId } from "masterchat";
import {
  ChatAdditionAction,
  ReloadContinuationType,
} from "masterchat/lib/chat";
import { timeoutThen } from "masterchat/lib/util";

interface CustomAddChatItemAction extends ChatAdditionAction {
  message?: string;
}

export async function collectEvents(argv: any) {
  console.log("Event collection mode is enabled");

  process.on("SIGINT", () => {
    process.exit(0);
  });

  const videoId: string = normalizeVideoId(argv.video);
  const type = argv.type as ReloadContinuationType;

  // get web player context
  const context = await fetchContext(videoId);
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
    isLiveChat: isLive,
  });

  // fetch chat
  for await (const { actions, delay } of liveChatIter) {
    console.log("incoming actions:", actions.length, "delay:", delay);

    for (const action of actions) {
      const type = action.type;
      const payload = action;
      fs.appendFileSync(`${type}.jsonl`, JSON.stringify(payload) + "\n");
    }

    await timeoutThen(delay);
  }

  console.log("Live stream is over");
  process.exit(0);
}
