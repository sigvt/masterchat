import nock from "nock";
import { join } from "path";
import { fetchChat, fetchContext } from "..";

// nockBack.fixtures = __dirname + "/__fixtures__";
// nockBack.setMode("record");

const SNAPSHOT_ROOT = join(__dirname, "snapshots", "context");

function withSnapshot(snapshotId: string) {
  const fs = require("fs");

  const data: string = fs.readFileSync(
    join(SNAPSHOT_ROOT, snapshotId + ".html"),
    "utf-8"
  );

  const head = /^HTTP\/1.1 (\d{3}) (.+?)\n/.exec(data);
  if (!head) throw new Error("Invalid format");

  const statusCode = parseInt(head[1]);

  const sepIndex = data.indexOf("\n\n");
  const headers = Object.fromEntries(
    data
      .slice(0, sepIndex)
      .split("\n")
      .slice(1)
      .map((s) => s.split(": "))
  );
  const body = data.slice(sepIndex + 2);

  return () => {
    return [statusCode, body, headers];
  };
}

beforeEach(() => {
  nock("https://www.youtube.com")
    .get("/watch?v=prechat")
    .reply(withSnapshot("prechat"))
    .get("/watch?v=invalid_video_id")
    .reply(withSnapshot("invalid_video_id"))
    .get("/watch?v=private")
    .reply(withSnapshot("private"))
    .get("/watch?v=unavailable")
    .reply(withSnapshot("unavailable"))
    .get("/watch?v=no_recording_available")
    .reply(withSnapshot("no_recording_available"))
    .get("/watch?v=forever_waiting")
    .reply(withSnapshot("forever_waiting"));
});

it("normal prechat", async () => {
  const ctx = await fetchContext("prechat");
  expect(ctx?.apiKey).toBe("AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8");
  expect(ctx?.continuations?.all.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTk1YM0ZvWjNSUGVUQmtlVEZCWjNBNGRtdDVVMUZuRWd0bk9VdFVWemxyVjBkR2J4b1Q2cWpkdVFFTkNndG5PVXRVVnpsclYwZEdieUFCMAGCAQIIAQ%3D%3D"
  );
  expect(ctx?.continuations?.top.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTk1YM0ZvWjNSUGVUQmtlVEZCWjNBNGRtdDVVMUZuRWd0bk9VdFVWemxyVjBkR2J4b1Q2cWpkdVFFTkNndG5PVXRVVnpsclYwZEdieUFCMAGCAQIIBA%3D%3D"
  );
  expect(ctx?.metadata?.id).toBe("g9KTW9kWGFo");
  expect(ctx?.metadata?.channelName).toBe("Mori Calliope Ch. hololive-EN");
  expect(ctx?.metadata?.channelId).toBe("UCL_qhgtOy0dy1Agp8vkySQg");
  expect(ctx?.metadata?.title).toBe(
    "【Phantasy Star Online 2 New Genesis】S P A C E.... A D V E N T U R E ?!?! #hololiveEnglish #ad"
  );
  expect(ctx?.metadata?.isLive).toBe(true);
});

it("invalid video id", async () => {
  const ctx = await fetchContext("invalid_video_id");
  expect(ctx?.apiKey).toBe("AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8");
  expect(ctx?.continuations).toBeUndefined();
  expect(ctx?.metadata).toBeUndefined();
});

it("private stream", async () => {
  const ctx = await fetchContext("private");
  expect(ctx?.apiKey).toBe("AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8");
  expect(ctx?.continuations).toBeUndefined();
  expect(ctx?.metadata).toBeUndefined();
});

it("deleted stream", async () => {
  const ctx = await fetchContext("unavailable");
  expect(ctx?.apiKey).toBe("AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8");
  expect(ctx?.continuations).toBeUndefined();
  expect(ctx?.metadata).toBeUndefined();
});

it("unarchived stream", async () => {
  const ctx = await fetchContext("no_recording_available");
  expect(ctx?.apiKey).toBe("AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8");
  expect(ctx?.continuations).toBeUndefined();
  expect(ctx?.metadata?.id).toBe("xCKYp2lxywE");
  expect(ctx?.metadata?.isLive).toBe(false);
});

it("forever waiting stream", async () => {
  const ctx = await fetchContext("forever_waiting");
  expect(ctx?.apiKey).toBe("AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8");
  expect(ctx?.continuations?.top.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTmlOVXA0VmpaMlMyeFpWbXR1YjBwQ09GUnVlVmxuRWd0T05WaHZURU5OVVhKR1dSb1Q2cWpkdVFFTkNndE9OVmh2VEVOTlVYSkdXU0FCMAGCAQIIBA%3D%3D"
  );
  expect(ctx?.metadata?.id).toBe("N5XoLCMQrFY");
  expect(ctx?.metadata?.isLive).toBe(true);
});
