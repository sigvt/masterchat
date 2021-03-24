import { fetchContext, iterateChat, normalizeVideoId } from "masterchat";
import { ReloadContinuationType } from "masterchat/lib/types/chat";
import { toSimpleChat } from "masterchat/lib/util";

export async function inspectChat(argv: any) {
  process.on("SIGINT", () => {
    process.exit(0);
  });

  const verbose = argv.verbose;
  const videoId = normalizeVideoId(argv.video);

  // get web player context
  const context = await fetchContext(videoId);
  const { metadata } = context;

  // check if the video is valid
  if (!metadata) {
    console.log("video source is unavailable. wrong video id?");
    process.exit(1);
  }

  // check if the stream is live
  const isLiveChat = metadata.isLive;

  console.log("title:", metadata.title);

  if (!metadata.continuations) {
    console.log(
      "reload continuation not found. try again later or possibility it's a normal video."
    );
    process.exit(1);
  }

  const initialToken = metadata.continuations[ReloadContinuationType.All].token;

  const liveChatIter = iterateChat({
    token: initialToken,
    apiKey: context.apiKey,
    client: context.client,
    isLiveChat,
  });

  let chatQueue: string[] = [];
  let wait = 0;

  // live chat visualizer
  if (isLiveChat) {
    new Promise(async () => {
      while (true) {
        const timeout = Math.ceil(wait / (chatQueue.length + 1)) || 0;
        await new Promise((resolve) => setTimeout(resolve, timeout));
        wait = Math.max(0, wait - timeout);
        if (chatQueue.length > 0) {
          console.log(chatQueue.shift());
        }
      }
    });
  }

  // fetch chat
  for await (const { actions, delay } of liveChatIter) {
    if (verbose) {
      console.log("incoming actions:", actions.length, "delay:", delay);
    }

    if (actions.length > 0) {
      const simpleChat: string[] = toSimpleChat(actions);

      if (simpleChat.length > 0) {
        chatQueue = [...chatQueue, ...simpleChat];
      }

      wait += delay || 0;
    }

    if (isLiveChat) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.log("Live stream is over");
  process.exit(0);
}
