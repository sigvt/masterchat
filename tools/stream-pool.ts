import chalk from "chalk";
import fetch from "cross-fetch";
import { StreamPool } from "masterchat";
import { ChatHistory, handleData } from "./common";

async function getStreams(org: string = "All Vtubers") {
  const res = await fetch(
    `https://holodex.net/api/v2/live?org=${encodeURIComponent(
      org
    )}&max_upcoming_hours=2`
  );
  const streams = (await res.json()) as any;
  return streams;
}

async function main(org?: string) {
  const history = new ChatHistory();
  const streams = new StreamPool({ mode: "live" });

  streams.on("data", (data, { videoId }) =>
    handleData({ data, history, prefix: videoId })
  );

  streams.on("end", (reason, { videoId }) =>
    console.log(chalk.bgBlue.black(`[ENDED] ${videoId}: ${reason}`))
  );

  streams.on("error", (err, { videoId }) =>
    console.error(chalk.bgRed.black(`[ERROR] ${videoId}: ${err}`))
  );

  for (const stream of await getStreams(org)) {
    streams.subscribe(stream.id, stream.channel.id);
  }
}

const org = process.argv[2];
main(org);
