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

it("members-only stream", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "members_only"
  );
  try {
    await Masterchat.init("M-sdpgv3gMQ");
  } catch (err) {
    expect(err.code).toBe("membersOnly");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
});

it("abandoned stream", async () => {
  const { completeRecording, assertScopesFinished } = await record("abandoned");
  try {
    await Masterchat.init("N5XoLCMQrFY");
  } catch (err) {
    expect(err.code).toBe("abandoned");
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
  } catch (err) {
    expect(err.code).toBe("unavailable");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
});
