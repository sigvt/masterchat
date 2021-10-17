import chalk from "chalk";
import fetch from "cross-fetch";
import { StreamPool } from "masterchat";
import { ChatHistory, printData } from "./common";

async function getStreams(
  org: string = "All Vtubers",
  upcomingHours: number = 4
) {
  const res = await fetch(
    `https://holodex.net/api/v2/live?org=${encodeURIComponent(
      org
    )}&max_upcoming_hours=${upcomingHours}`
  );
  const streams = (await res.json()) as any;
  return streams;
}

async function main(org?: string) {
  const history = new ChatHistory();
  const streams = new StreamPool({ mode: "live" });

  streams.on("data", (data, mc) =>
    printData({ data, history, prefix: mc.videoId, mc })
  );

  streams.on("end", (reason, { videoId }) =>
    console.log(
      chalk.bgBlue.black(`[ENDED] ${videoId}${reason ? `: ${reason}` : ""}`)
    )
  );

  streams.on("error", (err, { videoId }) =>
    console.error(chalk.bgRed.black(`[ERROR] ${videoId}`), err)
  );

  for (const stream of await getStreams(org)) {
    streams.subscribe(stream.id, stream.channel.id);
  }
}

const org = process.argv[2];
main(org);
