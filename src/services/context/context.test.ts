import assert from "assert";
import { setupRecorder } from "nock-record";
import { Masterchat } from "../..";

const record = setupRecorder({
  mode: (process.env.NOCK_BACK_MODE as any) || "lockdown",
});

it("live chat", async () => {
  const { completeRecording, assertScopesFinished } = await record("livechat");

  const mc = await Masterchat.init("6WFU2wzPKfA");

  completeRecording();
  assertScopesFinished();

  assert(mc.metadata);

  expect(mc.metadata.isLive).toBe(true);
  expect(mc.metadata.channelId).toBe("UCmbs8T6MWqUHP1tIQvSgKrg");
  expect(mc.metadata.title).toBe("【SUPERHOT】That's Hot");
  expect(mc.metadata.channelName).toBe("Ouro Kronii Ch. hololive-EN");
});

it("premiere", async () => {
  const { completeRecording, assertScopesFinished } = await record("premiere");

  const mc = await Masterchat.init("OJNb6lYcd_0");

  completeRecording();
  assertScopesFinished();

  assert(mc.metadata);
  expect(mc.metadata.isLive).toBe(true);
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

  assert(mc.metadata);
  expect(mc.metadata.isLive).toBe(true);
  expect(mc.metadata.channelId).toBe("UCFKOVgVbGmX65RxO3EtH3iw");
  expect(mc.metadata.title).toBe(
    "【帰り道/The Night Way Home】一緒に…帰る？【雪花ラミィ/ホロライブ】"
  );
  expect(mc.metadata.channelName).toBe("Lamy Ch. 雪花ラミィ");
});

it("abandoned stream", async () => {
  const { completeRecording, assertScopesFinished } = await record("abandoned");
  const mc = await Masterchat.init("N5XoLCMQrFY");
  completeRecording();
  assertScopesFinished();

  assert(mc.metadata);
  expect(mc.metadata.isLive).toBe(true);
});

it("members-only stream", async () => {
  const { completeRecording, assertScopesFinished } = await record(
    "members_only"
  );
  try {
    await Masterchat.init("M-sdpgv3gMQ");
    throw new Error("this should not occur");
  } catch (err) {
    expect((err as any).code).toBe("membersOnly");
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
    expect((err as any).code).toBe("disabled");
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
    const mc = await Masterchat.init("32qr8wO1mV4");
    throw new Error("this should not occur");
  } catch (err) {
    console.log(err);
    expect((err as any).code).toBe("disabled");
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
    expect((err as any).code).toBe("unarchived");
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
    expect((err as any).code).toBe("unavailable");
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
    expect((err as any).code).toBe("private");
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
    expect((err as any).code).toBe("unavailable");
  } finally {
    completeRecording();
    assertScopesFinished();
  }
});
