import fetch from "cross-fetch";
import { StreamPool, stringify } from "masterchat";

async function getStreams() {
  const res = await fetch(
    "https://holodex.net/api/v2/live?org=Hololive&max_upcoming_hours=0"
  );
  const streams = (await res.json()) as any;
  return streams.slice(0, 3);
}

async function main() {
  const streams = new StreamPool({ mode: "live" });

  streams.on(
    "chats",
    (chats, { videoId }) =>
      console.log(
        videoId,
        "received",
        chats.length,
        "chats",
        chats[0] ? stringify(chats[0].rawMessage) : ""
      )

    // if (youWant) streams.unsubscribe(videoId)
  );
  streams.on("end", (reason, { videoId }) =>
    console.log(videoId, "ended.", "reason is", reason)
  );
  streams.on("error", (err, { videoId }) =>
    console.error(videoId, err.message)
  );

  for (const stream of await getStreams()) {
    streams.subscribe(stream.id, stream.channel.id);
  }
}

main();
