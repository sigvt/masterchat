import fetch from "cross-fetch";
import { MasterchatManager } from "masterchat";

async function getStreams() {
  const res = await fetch(
    "https://holodex.net/api/v2/live?org=Hololive&max_upcoming_hours=0"
  );
  const streams = (await res.json()) as any;
  return streams.slice(0, 3);
}

async function main() {
  const manager = new MasterchatManager({ isLive: true });

  manager.on("chats", ({ videoId }, chats) =>
    console.log(videoId, "received", chats.length, "chats")
  );
  manager.on("end", ({ videoId }, reason) =>
    console.log(videoId, "ended", reason)
  );
  manager.on("error", ({ videoId }, err) =>
    console.error(videoId, err.message)
  );

  for (const stream of await getStreams()) {
    manager.subscribe(stream.id, stream.channel.id);
  }

  manager.ensure();
}

main();
