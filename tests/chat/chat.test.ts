import axios from "axios";
import { setupRecorder } from "nock-record";
import { Masterchat } from "../../src";

const mode = (process.env.NOCK_BACK_MODE as any) || "lockdown";
const record = setupRecorder({ mode });

async function fetchUpcomingStreams() {
  const data = await axios.get(
    "https://holodex.net/api/v2/live?status=live&org=Hololive"
  );
  return data.data;
}

describe("normal live chat", () => {
  jest.setTimeout(60000);

  let subject: any;
  let mc: Masterchat;

  beforeAll(async () => {
    const { completeRecording, assertScopesFinished } = await record(
      "wildlife"
    );
    const index = await fetchUpcomingStreams();
    subject = index[Math.round(index.length / 2)];
    mc = await Masterchat.init(subject.id);
    completeRecording();
    assertScopesFinished();
  });

  it("context match", async () => {
    expect(mc.channelId).toBe(subject.channel.id);
    expect(mc.channelName).toBe(subject.channel.name);
  });

  it("can fetch live chat", async () => {
    expect.assertions(3);

    const { completeRecording } = await record("wildlife2");

    const errFn = jest.fn();

    let times = 0;
    await mc
      .on("chats", (chats) => {
        const textChat = chats.find(
          (chat) => chat.membership && "text" in chat.message![0]
        );
        expect(textChat).toEqual(
          expect.objectContaining({
            authorName: expect.any(String),
            authorChannelId: expect.any(String),
            authorPhoto: expect.stringMatching(/^https:\/\/yt\d\.ggpht/),
            contextMenuEndpointParams: expect.any(String),
            id: expect.any(String),
            isModerator: expect.any(Boolean),
            isVerified: expect.any(Boolean),
            isOwner: expect.any(Boolean),
            timestamp: expect.any(Date),
            timestampUsec: expect.stringMatching(/^\d+$/),
            type: "addChatItemAction",
            rawMessage: expect.arrayContaining([
              {
                text: expect.any(String),
              },
            ]),
          })
        );

        times += 1;
        if (times >= 2) mc.stop();
      })
      .on("error", errFn)
      .listen({ topChat: false });

    completeRecording();

    expect(errFn).not.toBeCalled();
  });
});
