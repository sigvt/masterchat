import { setupRecorder } from "nock-record";
import { AddChatItemAction, Masterchat } from "../../..";
import {
  DisabledChatError,
  InvalidArgumentError,
  MembersOnlyError,
  NoPermissionError,
  NoStreamRecordingError,
  UnavailableError,
} from "../../../error";

const record = setupRecorder({
  mode: (process.env.NOCK_BACK_MODE as any) || "lockdown",
});

jest.setTimeout(20 * 1000);

const actionsMatcher = expect.arrayContaining([
  expect.objectContaining({
    type: expect.any(String),
  }),
]);

it("prechat", async () => {
  const videoId = "Y8PUxGDEo2M";
  const channelId = "UChgTyjG-pdNvxxhdsXfHQ5Q";

  const { completeRecording } = await record("prechat");

  const mc = await Masterchat.init(videoId);
  expect(mc.isLive).toBe(true);
  expect(mc.channelId).toBe(channelId);

  const chats = await new Masterchat(videoId, channelId).fetch();
  expect(chats.continuation!.token).toBeTruthy();
  expect(chats.continuation!.timeoutMs).toBeTruthy();
  expect(chats.actions).toEqual(actionsMatcher);

  completeRecording();
});

it("premiere prechat", async () => {
  const videoId = "5KsXVs8Vg7U";
  const channelId = "UCqm3BQLlJfvkTsX_hvm0UmA";

  const { completeRecording } = await record("premiere");

  const mc = await Masterchat.init(videoId);
  expect(mc.isLive).toBe(true);
  expect(mc.channelId).toBe(channelId);
  expect(mc.channelName).toBe("Watame Ch. 角巻わため");
  expect(mc.title).toBe("Everlasting Soul／角巻わため【original】");

  const chats = await new Masterchat(videoId, channelId, {
    isLive: true,
  }).fetch();
  expect(chats.continuation!.token).toBeTruthy();
  expect(chats.continuation!.timeoutMs).toBeTruthy();
  expect(chats.actions).toEqual(actionsMatcher);

  completeRecording();
});

it("emojis in video title", async () => {
  const videoId = "qz8dg-38NZY";

  const { completeRecording } = await record("emojis_in_title");

  const mc = await Masterchat.init(videoId);
  expect(mc.title).toBe(
    "🔴Irish Pub Music ♫♫ JOIN THE SESSION | Traditional Irish Music Session"
  );

  completeRecording();
});

it("live chat", async () => {
  const videoId = "9nComULZvUg";
  const channelId = "UCFKOVgVbGmX65RxO3EtH3iw";
  const { completeRecording } = await record("livechat");

  const mc = await Masterchat.init(videoId);
  expect(mc.isLive).toBe(true);
  expect(mc.channelId).toBe(channelId);
  expect(mc.title).toBe(
    "【Undertale】アンダイン戦から！！絶対に勝つ！！（Nルート）【雪花ラミィ/ホロライブ】"
  );
  expect(mc.channelName).toBe("Lamy Ch. 雪花ラミィ");

  const auto = await new Masterchat(videoId, channelId).fetch();
  expect(auto.continuation!.token).toBeTruthy();
  expect(auto.continuation!.timeoutMs).toBeTruthy();
  expect(auto.actions).toEqual(actionsMatcher);

  await expect(
    new Masterchat(videoId, channelId, {
      isLive: false,
    }).fetch()
  ).rejects.toBeInstanceOf(DisabledChatError);

  completeRecording();
});

it("replay chat", async () => {
  const videoId = "mLVSjBoLX5o";
  const channelId = "UCDqI2jOz0weumE8s7paEk6g";

  const { completeRecording } = await record("replay");

  const mc = await Masterchat.init(videoId);
  expect(mc.isLive).toBe(false);
  expect(mc.channelId).toBe(channelId);
  expect(mc.channelName).toBe("Roboco Ch. - ロボ子");
  expect(mc.title).toBe(
    "【＃ド深夜ホラー】UNOができないので恒例ホラー👻【ホロライブ/ロボ子さん/兎田ぺこら/獅白ぼたん/星街すいせい】"
  );

  const auto = await new Masterchat(videoId, channelId).fetch();
  expect(auto.continuation!.token).toBeTruthy();
  expect(auto.continuation!.timeoutMs).toBeUndefined();
  expect(auto.actions).toEqual(actionsMatcher);

  await expect(
    new Masterchat(videoId, channelId, {
      isLive: true,
    }).fetch()
  ).rejects.toBeInstanceOf(DisabledChatError);

  const explicit = await new Masterchat(videoId, channelId, {
    isLive: false,
  }).fetch();
  expect(explicit.continuation).toBeTruthy();
  expect(explicit.actions).toEqual(actionsMatcher);

  completeRecording();
});

it("abandoned stream", async () => {
  const videoId = "N5XoLCMQrFY";
  const channelId = "UCb5JxV6vKlYVknoJB8TnyYg";
  const { completeRecording } = await record("abandoned");

  const mc = await Masterchat.init(videoId);
  expect(mc.isLive).toBe(true);

  const chats = await new Masterchat(videoId, channelId, {
    isLive: true,
  }).fetch();
  expect(chats.continuation!.token).toBeTruthy();
  expect(chats.continuation!.timeoutMs).toBeTruthy();
  expect(chats.actions).toEqual(actionsMatcher);

  completeRecording();
});

it.skip("members-only stream", async () => {
  const videoId = "aQdznx3GFyc";
  const channelId = "UC5CwaMl1eIgY8h02uZw7u8A";

  const { completeRecording } = await record("members_only");

  await expect(Masterchat.init(videoId)).rejects.toBeInstanceOf(
    MembersOnlyError
  );

  await expect(
    new Masterchat(videoId, channelId, { isLive: true }).fetch()
  ).rejects.toBeInstanceOf(MembersOnlyError);

  await expect(
    new Masterchat(videoId, channelId, { isLive: false }).fetch()
  ).rejects.toBeInstanceOf(MembersOnlyError);

  completeRecording();
});

it("members-only archive with no replay chat available", async () => {
  const videoId = "hzpbFlE_TVg";
  const channelId = "UC1DCedRgGHBdm81E1llLhOQ";

  const { completeRecording } = await record("members_only_no_replay");

  await expect(Masterchat.init(videoId)).rejects.toBeInstanceOf(
    MembersOnlyError
  );

  await expect(
    new Masterchat(videoId, channelId, {
      isLive: true,
    }).fetch()
  ).rejects.toBeInstanceOf(DisabledChatError);

  // why though
  const chats = await new Masterchat(videoId, channelId, {
    isLive: false,
  }).fetch();
  expect(chats.continuation!.token).toBeTruthy();
  expect(chats.continuation!.timeoutMs).toBeUndefined();
  expect(chats.actions).toEqual(actionsMatcher);

  completeRecording();
});

it("pre-chat disabled", async () => {
  const videoId = "lN_nMOfvynw";
  const channelId = "UCmbs8T6MWqUHP1tIQvSgKrg";
  const { completeRecording } = await record("prechat_disabled");

  const mc = await Masterchat.init(videoId);
  expect(mc.isLive).toBe(true);
  expect(mc.channelId).toBe(channelId);

  await expect(
    new Masterchat(videoId, channelId, { isLive: true }).fetch()
  ).rejects.toBeInstanceOf(DisabledChatError);

  await expect(
    new Masterchat(videoId, channelId, { isLive: false }).fetch()
  ).rejects.toBeInstanceOf(DisabledChatError);

  completeRecording();
});

it.skip("archived stream with chat replay being prepared", async () => {
  const videoId = "HiAGXND3oq0";
  const channelId = "UCwL7dgTxKo8Y4RFIKWaf8gA";
  const { completeRecording } = await record("no_chat_replay");

  const mc = await Masterchat.init(videoId);
  expect(mc.isLive).toBe(false);

  await expect(
    new Masterchat(videoId, channelId, { isLive: true }).fetch()
  ).rejects.toBeInstanceOf(DisabledChatError);

  await expect(
    new Masterchat(videoId, channelId, { isLive: false }).fetch()
  ).rejects.toBeInstanceOf(DisabledChatError);

  completeRecording();
});

it("unarchived stream", async () => {
  const videoId = "xCKYp2lxywE";
  const channelId = "UCtjQoCilYbnxUXquXcVU3uA";
  const { completeRecording } = await record("unarchived");

  await expect(Masterchat.init(videoId)).rejects.toBeInstanceOf(
    NoStreamRecordingError
  );

  await expect(
    new Masterchat(videoId, channelId).fetch()
  ).rejects.toBeInstanceOf(DisabledChatError);

  await expect(
    new Masterchat(videoId, channelId, { isLive: false }).fetch()
  ).rejects.toBeInstanceOf(DisabledChatError);

  completeRecording();
});

it("private stream", async () => {
  const videoId = "Yhkrk9K2KpY";
  const channelId = "UCES4K104k-D2HthE46z9VHQ";
  const { completeRecording } = await record("private");

  await expect(Masterchat.init(videoId)).rejects.toBeInstanceOf(
    NoPermissionError
  );

  await expect(
    new Masterchat(videoId, channelId, { isLive: true }).fetch()
  ).rejects.toBeInstanceOf(NoPermissionError);

  await expect(
    new Masterchat(videoId, channelId, { isLive: false }).fetch()
  ).rejects.toBeInstanceOf(NoPermissionError);

  completeRecording();
});

it("deleted stream", async () => {
  const videoId = "YEAINgb2xfo";
  const channelId = "UCgmPnx-EEeOrZSg5Tiw7ZRQ";
  const { completeRecording } = await record("deleted");

  await expect(Masterchat.init(videoId)).rejects.toBeInstanceOf(
    UnavailableError
  );

  await expect(
    new Masterchat(videoId, channelId, { isLive: true }).fetch()
  ).rejects.toBeInstanceOf(UnavailableError);

  await expect(
    new Masterchat(videoId, channelId, { isLive: false }).fetch()
  ).rejects.toBeInstanceOf(UnavailableError);

  completeRecording();
});

it("invalid video and channel", async () => {
  const { completeRecording } = await record("invalid_video_id");

  await expect(Masterchat.init("invalid_video_id")).rejects.toBeInstanceOf(
    UnavailableError
  );

  await expect(
    new Masterchat("invalid_video_id", "UCtjQoCilYbnxUXquXcVU3uA").fetch()
  ).rejects.toBeInstanceOf(InvalidArgumentError);

  await expect(
    new Masterchat("invalid_video_id", "invalid_channel_id", {
      isLive: false,
    }).fetch()
  ).rejects.toBeInstanceOf(InvalidArgumentError);

  completeRecording();
});
