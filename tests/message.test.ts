import { setupRecorder } from "nock-record";
import { Masterchat } from "..";

const id = process.env.MC_MSG_TEST_ID;
const credentialsB64 = process.env.MC_MSG_TEST_CREDENTIALS;
const enabled = id && credentialsB64;

const itif = enabled ? it : it.skip;

const record = setupRecorder({
  mode: (process.env.NOCK_BACK_MODE as any) || "record",
});
let mc: Masterchat;
let chatId: string;
let chatParams: string;

beforeAll(async () => {
  const { completeRecording } = await record("message_prelude");
  const credentials = JSON.parse(
    Buffer.from(credentialsB64!, "base64").toString()
  ) as any;
  mc = await Masterchat.init(id!, { credentials });
  completeRecording();
});

describe("send message", () => {
  itif("can send message", async () => {
    const { completeRecording } = await record("message_send");

    const msg = "hello" + Math.random() * 1000;
    const res = await mc.sendMessage(msg);
    completeRecording();

    expect(res.actions[0]).toMatchObject({
      addChatItemAction: {
        item: {
          liveChatTextMessageRenderer: {
            message: { runs: [{ text: msg }] },
          },
        },
      },
    });

    // Remove
    chatId =
      res.actions[0].addChatItemAction.item.liveChatTextMessageRenderer.id;
    chatParams =
      res.actions[0].addChatItemAction.item.liveChatTextMessageRenderer
        .contextMenuEndpoint.liveChatItemContextMenuEndpoint.params;
  });
});

describe("remove message", () => {
  itif("can remove message", async () => {
    const { completeRecording } = await record("message_remove");
    const res = await mc.remove(chatParams);
    completeRecording();
    const targetId = res?.actions[0].markChatItemAsDeletedAction?.targetItemId;
    expect(targetId).toBe(chatId);
  });
});
