import { setupRecorder } from "nock-record";
import { Masterchat } from "..";

const record = setupRecorder({
  mode: (process.env.NOCK_BACK_MODE as any) || "record",
});

it("live chat", async () => {
  const { completeRecording, assertScopesFinished } = await record("livechat");

  const mc = await Masterchat.init("6WFU2wzPKfA");

  completeRecording();
  assertScopesFinished();

  expect(mc.metadata.isLive).toBe(true);
  expect(mc.continuation.all.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTnRZbk00VkRaTlYzRlZTRkF4ZEVsUmRsTm5TM0puRWdzMlYwWlZNbmQ2VUV0bVFSb1Q2cWpkdVFFTkNnczJWMFpWTW5kNlVFdG1RU0FCMAGCAQIIAQ%3D%3D"
  );
  expect(mc.continuation.top.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTnRZbk00VkRaTlYzRlZTRkF4ZEVsUmRsTm5TM0puRWdzMlYwWlZNbmQ2VUV0bVFSb1Q2cWpkdVFFTkNnczJWMFpWTW5kNlVFdG1RU0FCMAGCAQIIBA%3D%3D"
  );
  expect(mc.metadata.id).toBe("6WFU2wzPKfA");
  expect(mc.metadata.channelId).toBe("UCmbs8T6MWqUHP1tIQvSgKrg");
  expect(mc.metadata.title).toBe("【SUPERHOT】That's Hot");
  expect(mc.metadata.channelName).toBe("Ouro Kronii Ch. hololive-EN");
});

it("premiere", async () => {
  const { completeRecording, assertScopesFinished } = await record("premiere");

  const mc = await Masterchat.init("OJNb6lYcd_0");

  completeRecording();
  assertScopesFinished();

  expect(mc.continuation.top.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTnpaeTFaY1dSeFVTMUxSa1l3VEU1ck1qTkNXVFJCRWd0UFNrNWlObXhaWTJSZk1Cb1Q2cWpkdVFFTkNndFBTazVpTm14WlkyUmZNQ0FCMAGCAQIIBA%3D%3D"
  );
  expect(mc.metadata.isLive).toBe(true);
  expect(mc.metadata.id).toBe("OJNb6lYcd_0");
  expect(mc.metadata.channelId).toBe("UCsg-YqdqQ-KFF0LNk23BY4A");
  expect(mc.metadata.title).toBe(
    "【全曲試聴動画】メジャー2ndシングル『Baddest』/ 樋口楓"
  );
  expect(mc.metadata.channelName).toBe("樋口楓【にじさんじ所属】");
});

it("prechat", async () => {
  const { completeRecording, assertScopesFinished } = await record("prechat");

  const mc = await Masterchat.init("R2LuOQF_dIs");

  completeRecording();
  assertScopesFinished();

  expect(mc.metadata.isLive).toBe(true);
  expect(mc.continuation.all.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTkdTMDlXWjFaaVIyMVlOalZTZUU4elJYUklNMmwzRWd0U01reDFUMUZHWDJSSmN4b1Q2cWpkdVFFTkNndFNNa3gxVDFGR1gyUkpjeUFCMAGCAQIIAQ%3D%3D"
  );
  expect(mc.continuation.top.token).toBe(
    "0ofMyANhGlhDaWtxSndvWVZVTkdTMDlXWjFaaVIyMVlOalZTZUU4elJYUklNMmwzRWd0U01reDFUMUZHWDJSSmN4b1Q2cWpkdVFFTkNndFNNa3gxVDFGR1gyUkpjeUFCMAGCAQIIBA%3D%3D"
  );
  expect(mc.metadata.id).toBe("R2LuOQF_dIs");
  expect(mc.metadata.channelId).toBe("UCFKOVgVbGmX65RxO3EtH3iw");
  expect(mc.metadata.title).toBe(
    "【帰り道/The Night Way Home】一緒に…帰る？【雪花ラミィ/ホロライブ】"
  );
  expect(mc.metadata.channelName).toBe("Lamy Ch. 雪花ラミィ");
});

it("abandoned stream", async () => {
  const { completeRecording, assertScopesFinished } = await record("abandoned");
  const res = await Masterchat.init("N5XoLCMQrFY");
  completeRecording();
  assertScopesFinished();
  expect(res.metadata.isLive).toBe(true);
});

it("members-only stream", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "members_only"
  );
  try {
    await Masterchat.init("M-sdpgv3gMQ");
    throw new Error("this should not occur");
  } catch (err) {
    expect(err.code).toBe("membersOnly");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
});

it("pre stream but chat disabled", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "prechat_disabled"
  );
  try {
    await Masterchat.init("l3T2COhIouU");
    throw new Error("this should not occur");
  } catch (err) {
    expect(err.code).toBe("disabled");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
});

it.todo("archived stream with chat replay explicitly disabled");

it("archived stream with chat replay being prepared", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "no_chat_replay"
  );
  try {
    await Masterchat.init("32qr8wO1mV4");
    throw new Error("this should not occur");
  } catch (err) {
    expect(err.code).toBe("disabled");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
});

it("unarchived stream", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "unarchived"
  );
  try {
    await Masterchat.init("xCKYp2lxywE");
    throw new Error("this should not occur");
  } catch (err) {
    expect(err.code).toBe("unarchived");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
});

it("invalid video id", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "invalid_video_id"
  );
  try {
    await Masterchat.init("invalid_video_id");
    throw new Error("this should not occur");
  } catch (err) {
    expect(err.code).toBe("unavailable");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
});

it("private stream", async () => {
  const { completeRecording, assertScopesFinished } = await record("private");
  try {
    await Masterchat.init("wchTnTjAiHg");
    throw new Error("this should not occur");
  } catch (err) {
    expect(err.code).toBe("private");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
});

it("deleted stream", async () => {
  const { completeRecording, assertScopesFinished } = await record("deleted");
  try {
    await Masterchat.init("XBmtJiYt8Tw");
    throw new Error("this should not occur");
  } catch (err) {
    expect(err.code).toBe("unavailable");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
});
