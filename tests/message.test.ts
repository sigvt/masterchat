import { setupRecorder } from "nock-record";
import { Masterchat } from "..";

const id = process.env.MC_MSG_TEST_ID;
const credentialsB64 = process.env.MC_MSG_TEST_CREDENTIALS;
const enabled = id && credentialsB64;

const credentials = JSON.parse(
  Buffer.from(credentialsB64!, "base64").toString()
) as any;
const itif = enabled ? it : it.skip;

const record = setupRecorder({
  mode: (process.env.NOCK_BACK_MODE as any) || "record",
});

describe("subscribers-only mode", () => {
  it("can init", async () => {
    const { completeRecording, assertScopesFinished } = await record(
      "subscribers_only"
    );
    const mc = await Masterchat.init("lqhYHycrsHk", { credentials });
    completeRecording();
    // expect((mc as any).liveChatContext.sendMessageParams).toBeUndefined();
  });
});

describe("normal message handling", () => {
  let mc: Masterchat;
  let chatId: string;
  let chatParams: string;

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
      chatParams =
        res.contextMenuEndpoint!.liveChatItemContextMenuEndpoint.params;
    });
  });

  describe("remove message", () => {
    itif("can remove message", async () => {
      const { completeRecording } = await record("message_remove");
      const res = await mc.remove(chatParams);
      completeRecording();
      const targetId = res?.targetItemId;
      expect(targetId).toBe(chatId);
    });
  });
});
