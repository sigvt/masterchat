import { setupRecorder } from "nock-record";
import { fetchContext } from "..";

const record = setupRecorder({
  mode: (process.env.NOCK_BACK_MODE as any) || "record",
});

it("normal prechat", async () => {
  const { completeRecording, assertScopesFinished } = await record("prechat");

  const ctx = await fetchContext("g9KTW9kWGFo");

  completeRecording();
  assertScopesFinished();

  if (!ctx) throw new Error("Invalid ctx");

  expect(ctx.apiKey).toBe("AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8");
  expect(ctx.chat?.continuations.all.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTk1YM0ZvWjNSUGVUQmtlVEZCWjNBNGRtdDVVMUZuRWd0bk9VdFVWemxyVjBkR2J4b1Q2cWpkdVFFTkNndG5PVXRVVnpsclYwZEdieUFCMAGCAQIIAQ%3D%3D"
  );
  expect(ctx.chat?.continuations.top.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTk1YM0ZvWjNSUGVUQmtlVEZCWjNBNGRtdDVVMUZuRWd0bk9VdFVWemxyVjBkR2J4b1Q2cWpkdVFFTkNndG5PVXRVVnpsclYwZEdieUFCMAGCAQIIBA%3D%3D"
  );
  expect(ctx.metadata.isLive).toBe(true);
  expect(ctx.metadata.id).toBe("g9KTW9kWGFo");
  expect(ctx.metadata.channelId).toBe("UCL_qhgtOy0dy1Agp8vkySQg");
  expect(ctx.metadata.title).toBe(
    "【Phantasy Star Online 2 New Genesis】S P A C E.... A D V E N T U R E ?!?! #hololiveEnglish #ad"
  );
  expect(ctx.metadata.channelName).toBe("Mori Calliope Ch. hololive-EN");
});

it("forever waiting stream", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "forever_waiting"
  );
  const ctx = await fetchContext("N5XoLCMQrFY");
  completeRecording();
  assertScopesFinished();
  if (!ctx) throw new Error("Invalid ctx");
  expect(ctx.apiKey).toBe("AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8");
  expect(ctx.chat?.continuations.top.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTmlOVXA0VmpaMlMyeFpWbXR1YjBwQ09GUnVlVmxuRWd0T05WaHZURU5OVVhKR1dSb1Q2cWpkdVFFTkNndE9OVmh2VEVOTlVYSkdXU0FCMAGCAQIIBA%3D%3D"
  );
  expect(ctx.metadata.isLive).toBe(true);
  expect(ctx.metadata.id).toBe("N5XoLCMQrFY");
  expect(ctx.metadata.title).toBe("こんばんは");
});

it("archived stream with no chat replay", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "no_chat_replay"
  );
  const ctx = await fetchContext("gAlQwtLnpBA");
  completeRecording();
  assertScopesFinished();
  if (!ctx) throw new Error("Invalid ctx");

  expect(ctx.apiKey).toBe("AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8");
  expect(ctx.chat).toBeUndefined();
  expect(ctx.metadata.isLive).toBe(false);
  expect(ctx.metadata.id).toBe("gAlQwtLnpBA");
  expect(ctx.metadata.title).toBe(
    "【マイクラ】マップアート準備！羊毛自動回収機をつくった！【 ホロライブ / 大神ミオ 】"
  );
});

it("unarchived stream", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "no_recording_available"
  );
  const ctx = await fetchContext("xCKYp2lxywE");
  completeRecording();
  assertScopesFinished();
  if (!ctx) throw new Error("Invalid ctx");
  expect(ctx.apiKey).toBe("AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8");
  expect(ctx.chat).toBeUndefined();
  expect(ctx.metadata.isLive).toBe(false);
  expect(ctx.metadata.id).toBe("xCKYp2lxywE");
  expect(ctx.metadata.title).toBe(
    "【爆弾コラボ】美人爆弾処理班いっきまーーす！！【Keep Talking and Nobody Explodes】"
  );
});

it("invalid video id", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "invalid_video_id"
  );
  const ctx = await fetchContext("invalid_video_id");
  completeRecording();
  assertScopesFinished();
  expect(ctx).toBeUndefined();
});

it("private stream", async () => {
  const { completeRecording, assertScopesFinished } = await record("private");
  const ctx = await fetchContext("l65XbEUHiw4");
  completeRecording();
  assertScopesFinished();
  expect(ctx).toBeUndefined();
});

it("deleted stream", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "unavailable"
  );
  const ctx = await fetchContext("XBmtJiYt8Tw");
  completeRecording();
  assertScopesFinished();
  expect(ctx).toBeUndefined();
});

// const SNAPSHOT_ROOT = join(__dirname, "snapshots", "context");

// function withSnapshot(uri: string) {
//   const fs = require("fs");
//   const snapshotId = /watch\?v=([^?/]+)/.exec(uri)?.[1];
//   if (!snapshotId) throw new Error("Invalid snapshot");

//   const data: string = fs.readFileSync(
//     join(SNAPSHOT_ROOT, snapshotId + ".html"),
//     "utf-8"
//   );

//   const head = /^HTTP\/1.1 (\d{3}) (.+?)\n/.exec(data);
//   if (!head) throw new Error("Invalid format");

//   const statusCode = parseInt(head[1]);

//   const sepIndex = data.indexOf("\n\n");
//   const headers = Object.fromEntries(
//     data
//       .slice(0, sepIndex)
//       .split("\n")
//       .slice(1)
//       .map((s) => s.split(": "))
//   );
//   const body = data.slice(sepIndex + 2);

//   return [statusCode, body, headers];
// }

// beforeEach(() => {
// nock("https://www.youtube.com", { allowUnmocked: true })
//   .get(/^\/watch\?v=/)
//   .reply(withSnapshot);
// });
