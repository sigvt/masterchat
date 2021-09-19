import fetch from "node-fetch";
import { StreamPool } from "masterchat";

async function getStreams() {
  const res = await fetch(
    "https://holodex.net/api/v2/live?org=Hololive&max_upcoming_hours=0"
  );
  const streams = await res.json();
  return streams.slice(0, 3);
}

async function main() {
  const streams = new StreamPool({ isLive: true });

  streams.on("chats", (chats, { videoId }) =>
    console.log(
      videoId,
      "received",
      chats.length,
      "chats",
      chats[0]?.rawMessage
    )
  );
  streams.on("end", ({ videoId }) => console.log(videoId, "ended"));
  streams.on("error", (err, { videoId }) =>
    console.error(videoId, err.message)
  );

  for (const stream of await getStreams()) {
    streams.subscribe(stream.id, stream.channel.id);
  }

  streams.ensure();
}

main();
