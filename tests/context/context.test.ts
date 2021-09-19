import { setupRecorder } from "nock-record";
import {
  DisabledChatError,
  InvalidArgumentError,
  Masterchat,
  MasterchatOptions,
  MembersOnlyError,
  NoPermissionError,
  NoStreamRecordingError,
  UnavailableError,
} from "../../src";

const actionsMatcher = expect.arrayContaining([
  expect.objectContaining({
    type: expect.any(String),
  }),
]);

type SetupObject = {
  shouldThrow: (obj: unknown) => Promise<void>;
  shouldEmitActions: () => Promise<void>;
};

function setup(videoId: string): SetupObject;
function setup(
  videoId: string,
  channelId: string,
  options?: MasterchatOptions
): SetupObject;
function setup(
  videoId: string,
  channelId?: string,
  options?: MasterchatOptions
): SetupObject {
  const setupMc = async () =>
    !channelId
      ? await Masterchat.init(videoId)
      : new Masterchat(videoId, channelId, options);

  return {
    shouldThrow(obj: unknown) {
      const promise = async () => {
        const mc = await setupMc();
        await mc
          .on("data", () => {
            throw new Error("Should not be called");
          })
          .on("error", (err) => {
            throw err;
          })
          .listen();
      };
      return expect(promise).rejects.toBeInstanceOf(obj);
    },
    shouldEmitActions() {
      const promise = async () => {
        const mc = await setupMc();
        await mc
          .on("data", (data) => {
            expect(data.continuation!.token).toBeTruthy();
            if (mc.isLive ?? true) {
              expect(data.continuation!.timeoutMs).toBeTruthy();
            } else {
              expect(data.continuation!.timeoutMs).toBeUndefined();
            }
            expect(data.actions).toEqual(actionsMatcher);
            mc.stop();
          })
          .on("error", (err) => {
            throw err;
          })
          .listen();
      };
      return promise();
    },
  };
}

const record = setupRecorder({
  mode: (process.env.NOCK_BACK_MODE as any) || "lockdown",
});

jest.setTimeout(20 * 1000);

it("abortion", async () => {
  expect.assertions(3);

  const videoId = "425-oc3ZEgg";

  const { completeRecording } = await record("abortion");

  const mc = await Masterchat.init(videoId);

  const endFn = jest.fn();

  let ts1 = 0;
  await mc
    .on("actions", (actions) => {
      ts1 = Date.now();
      expect(actions).toEqual(actionsMatcher);
      completeRecording();
      mc.stop();
    })
    .on("end", endFn)
    .on("error", () => {
      throw new Error("This must not be happened");
    })
    .listen();

  const ts2 = Date.now();
  expect(ts2 - ts1).toBeLessThan(500);
  expect(endFn).toBeCalled();
});

it("prechat", async () => {
  expect.assertions(5);

  const videoId = "Y8PUxGDEo2M";
  const channelId = "UChgTyjG-pdNvxxhdsXfHQ5Q";

  const { completeRecording } = await record("prechat");

  const mc = await Masterchat.init(videoId);
  expect(mc.isLive).toBe(true);
  expect(mc.channelId).toBe(channelId);

  await new Masterchat(videoId, channelId)
    .once("data", (chats, mc) => {
      expect(chats.continuation!.token).toBeTruthy();
      expect(chats.continuation!.timeoutMs).toBeTruthy();
      expect(chats.actions).toEqual(actionsMatcher);
      mc.stop();
    })
    .listen();

  completeRecording();
});

it("premiere prechat", async () => {
  expect.assertions(7);

  const videoId = "5KsXVs8Vg7U";
  const channelId = "UCqm3BQLlJfvkTsX_hvm0UmA";

  const { completeRecording } = await record("premiere");

  const mc = await Masterchat.init(videoId);
  expect(mc.isLive).toBe(true);
  expect(mc.channelId).toBe(channelId);
  expect(mc.channelName).toBe("Watame Ch. 角巻わため");
  expect(mc.title).toBe("Everlasting Soul／角巻わため【original】");

  await setup(videoId, channelId, { mode: "live" }).shouldEmitActions();

  completeRecording();
});

it("emojis in video title", async () => {
  expect.assertions(1);

  const videoId = "qz8dg-38NZY";

  const { completeRecording } = await record("emojis_in_title");

  const mc = await Masterchat.init(videoId);
  expect(mc.title).toBe(
    "🔴Irish Pub Music ♫♫ JOIN THE SESSION | Traditional Irish Music Session"
  );

  completeRecording();
});

it("live chat", async () => {
  expect.assertions(8);

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

  await setup(videoId, channelId).shouldEmitActions();
  await setup(videoId, channelId, { mode: "replay" }).shouldThrow(
    DisabledChatError
  );

  completeRecording();
});

it("replay chat", async () => {
  expect.assertions(11);

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

  await setup(videoId, channelId).shouldEmitActions();
  await setup(videoId, channelId, { mode: "live" }).shouldThrow(
    DisabledChatError
  );
  await setup(videoId, channelId, { mode: "replay" }).shouldEmitActions();

  completeRecording();
});

it("abandoned stream", async () => {
  expect.assertions(4);

  const videoId = "N5XoLCMQrFY";
  const channelId = "UCb5JxV6vKlYVknoJB8TnyYg";
  const { completeRecording } = await record("abandoned");

  const mc = await Masterchat.init(videoId);
  expect(mc.isLive).toBe(true);

  await setup(videoId, channelId, { mode: "live" }).shouldEmitActions();

  completeRecording();
});

it("members-only stream", async () => {
  expect.assertions(3);

  const videoId = "n5cIlKx1hMQ";
  const channelId = "UCdn5BQ06XqgXoAxIhbqw5Rg";

  const { completeRecording } = await record("members_only");

  await setup(videoId).shouldThrow(MembersOnlyError);
  await setup(videoId, channelId, { mode: "live" }).shouldThrow(
    MembersOnlyError
  );
  await setup(videoId, channelId, { mode: "replay" }).shouldThrow(
    DisabledChatError
  );

  completeRecording();
});

it("members-only archive with no replay chat available", async () => {
  expect.assertions(5);

  const videoId = "hzpbFlE_TVg";
  const channelId = "UC1DCedRgGHBdm81E1llLhOQ";

  const { completeRecording } = await record("members_only_no_replay");

  await setup(videoId).shouldThrow(MembersOnlyError);
  await setup(videoId, channelId, { mode: "live" }).shouldThrow(
    DisabledChatError
  );

  // why though
  await setup(videoId, channelId, { mode: "replay" }).shouldEmitActions();

  completeRecording();
});

it("pre-chat disabled", async () => {
  expect.assertions(4);

  const videoId = "lN_nMOfvynw";
  const channelId = "UCmbs8T6MWqUHP1tIQvSgKrg";
  const { completeRecording } = await record("prechat_disabled");

  const mc = await Masterchat.init(videoId);
  expect(mc.isLive).toBe(true);
  expect(mc.channelId).toBe(channelId);

  await setup(videoId, channelId, { mode: "live" }).shouldThrow(
    DisabledChatError
  );
  await setup(videoId, channelId, { mode: "replay" }).shouldThrow(
    DisabledChatError
  );

  completeRecording();
});

it("archived stream with chat replay being prepared", async () => {
  expect.assertions(3);

  const videoId = "K769BpJroos";
  const channelId = "UC8rcEBzJSleTkf_-agPM20g";
  const { completeRecording } = await record("no_chat_replay");

  const mc = await Masterchat.init(videoId);
  expect(mc.isLive).toBe(false);

  await setup(videoId, channelId, { mode: "live" }).shouldThrow(
    DisabledChatError
  );
  await setup(videoId, channelId, { mode: "replay" }).shouldThrow(
    DisabledChatError
  );

  completeRecording();
});

it("unarchived stream", async () => {
  expect.assertions(3);

  const videoId = "xCKYp2lxywE";
  const channelId = "UCtjQoCilYbnxUXquXcVU3uA";
  const { completeRecording } = await record("unarchived");

  await setup(videoId).shouldThrow(NoStreamRecordingError);
  await setup(videoId, channelId).shouldThrow(DisabledChatError);
  await setup(videoId, channelId, { mode: "replay" }).shouldThrow(
    DisabledChatError
  );

  completeRecording();
});

it("private stream", async () => {
  expect.assertions(3);

  const videoId = "Yhkrk9K2KpY";
  const channelId = "UCES4K104k-D2HthE46z9VHQ";
  const { completeRecording } = await record("private");

  await setup(videoId).shouldThrow(NoPermissionError);
  await setup(videoId, channelId, { mode: "live" }).shouldThrow(
    NoPermissionError
  );
  await setup(videoId, channelId, { mode: "replay" }).shouldThrow(
    NoPermissionError
  );

  completeRecording();
});

it("deleted stream", async () => {
  expect.assertions(3);

  const videoId = "YEAINgb2xfo";
  const channelId = "UCgmPnx-EEeOrZSg5Tiw7ZRQ";
  const { completeRecording } = await record("deleted");

  await setup(videoId).shouldThrow(UnavailableError);
  await setup(videoId, channelId, { mode: "live" }).shouldThrow(
    UnavailableError
  );
  await setup(videoId, channelId, { mode: "replay" }).shouldThrow(
    UnavailableError
  );

  completeRecording();
});

it("invalid video and channel", async () => {
  expect.assertions(3);

  const { completeRecording } = await record("invalid_video_id");

  await setup("invalid_video_id").shouldThrow(InvalidArgumentError);

  await setup("invalid_video_id", "UCtjQoCilYbnxUXquXcVU3uA").shouldThrow(
    InvalidArgumentError
  );
  await setup("invalid_video_id", "invalid_channel_id", {
    mode: "replay",
  }).shouldThrow(InvalidArgumentError);

  completeRecording();
});
