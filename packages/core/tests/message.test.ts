import { setupRecorder } from "nock-record";
import { fetchContext, sendMessage } from "..";

const id = process.env.MC_MSG_TEST_ID;
const credentialsB64 = process.env.MC_MSG_TEST_CREDENTIALS;
const enabled = id && credentialsB64;

const itif = enabled ? it : it.skip;

const record = setupRecorder({
  mode: (process.env.NOCK_BACK_MODE as any) || "record",
});

itif("send message", async () => {
  const { completeRecording } = await record("send_message");
  const credentials = JSON.parse(
    Buffer.from(credentialsB64!, "base64").toString()
  ) as any;

  const ctx = await fetchContext(id!, { credentials });
  const { apiKey, chat } = ctx!;
  const msg = "hello" + Math.random() * 1000;
  const res = await sendMessage(msg, {
    apiKey,
    credentials,
    params: chat?.params!,
  });
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
});
