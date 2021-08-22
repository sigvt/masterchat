import { setupRecorder } from "nock-record";
import { Masterchat } from "..";

const record = setupRecorder({
  mode: (process.env.NOCK_BACK_MODE as any) || "record",
});

it("normal prechat", async () => {
  const { completeRecording, assertScopesFinished } = await record("prechat");

  const mc = await Masterchat.init("R2LuOQF_dIs");

  completeRecording();
  assertScopesFinished();

  expect(mc.continuation.all.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTkdTMDlXWjFaaVIyMVlOalZTZUU4elJYUklNMmwzRWd0U01reDFUMUZHWDJSSmN4b1Q2cWpkdVFFTkNndFNNa3gxVDFGR1gyUkpjeUFCMAGCAQIIAQ%3D%3D"
  );
  expect(mc.continuation.top.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTkdTMDlXWjFaaVIyMVlOalZTZUU4elJYUklNMmwzRWd0U01reDFUMUZHWDJSSmN4b1Q2cWpkdVFFTkNndFNNa3gxVDFGR1gyUkpjeUFCMAGCAQIIBA%3D%3D"
  );
  expect(mc.metadata.isLive).toBe(true);
  expect(mc.metadata.id).toBe("R2LuOQF_dIs");
  expect(mc.metadata.channelId).toBe("UCFKOVgVbGmX65RxO3EtH3iw");
  expect(mc.metadata.title).toBe(
    "【帰り道/The Night Way Home】一緒に…帰る？【雪花ラミィ/ホロライブ】"
  );
  expect(mc.metadata.channelName).toBe("Lamy Ch. 雪花ラミィ");
});

it("forever waiting stream", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "forever_waiting"
  );
  const mc = await Masterchat.init("N5XoLCMQrFY");

  completeRecording();
  assertScopesFinished();

  expect(mc.continuation.top.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTmlOVXA0VmpaMlMyeFpWbXR1YjBwQ09GUnVlVmxuRWd0T05WaHZURU5OVVhKR1dSb1Q2cWpkdVFFTkNndE9OVmh2VEVOTlVYSkdXU0FCMAGCAQIIBA%3D%3D"
  );
  expect(mc.metadata.isLive).toBe(true);
  expect(mc.metadata.id).toBe("N5XoLCMQrFY");
  expect(mc.metadata.title).toBe("こんばんは");
});

it("archived stream with no chat replay", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "no_chat_replay"
  );
  const mc = await Masterchat.init("gAlQwtLnpBA");

  completeRecording();
  assertScopesFinished();

  expect(mc.continuation.all.token).toBe(
    "op2w0wRgGlhDaWtxSndvWVZVTndMVFYwT1ZOeVQxRjNXRTFWTjJsSmFsRm1RVkpuRWd0blFXeFJkM1JNYm5CQ1FSb1Q2cWpkdVFFTkNndG5RV3hSZDNSTWJuQkNRU0FCQAFyAggB"
  );
  expect(mc.metadata.isLive).toBe(false);
  expect(mc.metadata.id).toBe("gAlQwtLnpBA");
  expect(mc.metadata.title).toBe(
    "【マイクラ】マップアート準備！羊毛自動回収機をつくった！【 ホロライブ / 大神ミオ 】"
  );
});

it("unarchived stream", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "unarchived"
  );
  try {
    await Masterchat.init("xCKYp2lxywE");
  } catch (err) {
    expect(err.message).toContain("Continuation");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
  // const { completeRecording, assertScopesFinished } = await record(
  //   "no_recording_available"
  // );
  // const mc = await Masterchat.init("xCKYp2lxywE");
  // completeRecording();
  // assertScopesFinished();
  // // expect(mc.chat).toBeUndefined();
  // expect(mc.metadata.isLive).toBe(false);
  // expect(mc.metadata.id).toBe("xCKYp2lxywE");
  // expect(mc.metadata.title).toBe(
  //   "【爆弾コラボ】美人爆弾処理班いっきまーーす！！【Keep Talking and Nobody Explodes】"
  // );
});

it("invalid video id", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "invalid_video_id"
  );
  try {
    await Masterchat.init("invalid_video_id");
  } catch (err) {
    expect(err.message).toContain("Context");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
});

it("private stream", async () => {
  const { completeRecording, assertScopesFinished } = await record("private");
  try {
    await Masterchat.init("l65XbEUHiw4");
  } catch (err) {
    expect(err.message).toContain("Context");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
});

it("deleted stream", async () => {
  const { completeRecording, assertScopesFinished } = await record("deleted");
  try {
    await Masterchat.init("XBmtJiYt8Tw");
  } catch (err) {
    expect(err.message).toContain("Context");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
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
