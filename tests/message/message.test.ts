import { setupRecorder } from "nock-record";
import { AddChatItemAction, delay, Masterchat } from "../../src";

const id = process.env.MC_MSG_TEST_ID;
const channelId = process.env.MC_MSG_TEST_CHANNEL_ID;
const credentialsB64 = process.env.MC_MSG_TEST_CREDENTIALS;
const credentialsB64_second = process.env.MC_MSG_TEST_CREDENTIALS_SECOND;
const credentials = credentialsB64
  ? JSON.parse(Buffer.from(credentialsB64!, "base64").toString())
  : undefined;
const credentials_second = credentialsB64_second
  ? JSON.parse(Buffer.from(credentialsB64_second!, "base64").toString())
  : undefined;

const enabled = id && channelId && credentialsB64 && credentials_second;
if (!enabled) {
  console.log("message test disabled");
}
const itif = enabled ? it : it.skip;

const mode = (process.env.NOCK_BACK_MODE as any) || "lockdown";
const record = setupRecorder({ mode });

describe("normal message handling", () => {
  let mc: Masterchat;
  let chatId: string;

  describe("send message", () => {
    beforeAll(async () => {
      const { completeRecording } = await record("message_prelude");

      mc = await Masterchat.init(id!, { credentials });
      completeRecording();
    });

    itif("can send message", async () => {
      const { completeRecording } = await record("message_send");

      const msg = "hello world";
      const res = await mc.sendMessage(msg);
      completeRecording();

      if (!res || "error" in res) {
        throw new Error("invalid res");
      }

      expect(res).toMatchObject({
        message: { runs: [{ text: msg }] },
      });

      // Remove
      chatId = res.id;
    });
  });

  describe("retract message", () => {
    itif("can retract message", async () => {
      const { completeRecording } = await record("message_remove");
      const res = await mc.remove(chatId);
      completeRecording();
      const targetId = res?.targetItemId;
      expect(targetId).toBe(chatId);
    });
  });
});

describe("moderation (delete)", () => {
  let me: Masterchat;
  let other: Masterchat;
  let chatId: string;
  let recorder: any;

  beforeAll(async () => {
    recorder = await record("mod_send");
    me = new Masterchat(id!, channelId!, { credentials });
    other = new Masterchat(id!, channelId!, {
      credentials: credentials_second,
    });
  });

  afterAll(() => {
    recorder.completeRecording();
  });

  describe("send message", () => {
    itif("send message", async () => {
      const msg = "hello world";
      const res = await other.sendMessage(msg);
      expect(res).toMatchObject({
        message: { runs: [{ text: msg }] },
      });
      chatId = res.id;
    });
  });

  describe("check message", () => {
    itif("receive message", async () => {
      if (mode === "record") await delay(3000);

      const res = await me.fetch();
      const chat = res.actions.find(
        (action): action is AddChatItemAction =>
          action.type === "addChatItemAction" && action.id === chatId
      );
      expect(chat).not.toBeUndefined();
    });

    itif("delete message", async () => {
      const del = await me.remove(chatId);
      expect(del.targetItemId).toBe(chatId);
    });
  });
});
