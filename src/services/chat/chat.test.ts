import { setupRecorder } from "nock-record";
import fetch from "cross-fetch";
import { Masterchat, timeoutThen } from "../..";

const mode = (process.env.NOCK_BACK_MODE as any) || "lockdown";
const record = setupRecorder({ mode });

async function fetchUpcomingStreams() {
  const data = await fetch("https://holodex.net/api/v2/live?status=live").then(
    (res) => res.json()
  );
  return data;
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
    expect(mc.title).toBe(subject.title);
    expect(mc.channelId).toBe(subject.channel.id);
    expect(mc.channelName).toBe(subject.channel.name);
  });

  it("can fetch live chat", async () => {
    const { completeRecording } = await record("wildlife2");

    const chat = await mc.fetch({
      topChat: false,
    });
    expect(chat.error).toBeNull();
    expect(chat?.continuation?.token).toEqual(expect.any(String));
    expect(chat?.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "addChatItemAction" }),
      ])
    );
    const chats = chat.actions.filter(
      (action) => action.type === "addChatItemAction"
    );
    expect(chats[0]).toEqual(
      expect.objectContaining({
        authorName: expect.any(String),
        authorChannelId: expect.any(String),
        authorPhoto: expect.stringMatching(/^https:\/\/yt\d\.ggpht/),
        contextMenuEndpointParams: expect.any(String),
        id: expect.any(String),
        isModerator: expect.any(Boolean),
        isVerified: expect.any(Boolean),
        isOwner: expect.any(Boolean),
        membership: {
          since: expect.stringMatching(/^(2 months)$/),
          status: expect.stringMatching(/^(Member)$/),
          thumbnail: expect.stringMatching(/^https:\/\/yt\d\.ggpht/),
        },
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

    const token = chat?.continuation?.token;
    const timeoutMs = chat?.continuation?.timeoutMs;
    if (!timeoutMs || !token) {
      throw new Error("timeoutMs or token not found");
    }

    // console.log("waiting for", timeoutMs);
    if (mode !== "lockdown") await timeoutThen(timeoutMs);

    const consecutiveChat = await mc.fetch(token);
    completeRecording();

    expect(consecutiveChat.error).toBeNull();
    expect(consecutiveChat?.continuation?.token).toEqual(expect.any(String));
    expect(consecutiveChat).toHaveProperty("actions");
    const chats2 = consecutiveChat.actions.filter(
      (action) => action.type === "addChatItemAction"
    );
    expect(chats2[0]).toEqual(
      expect.objectContaining({
        authorName: expect.any(String),
        rawMessage: expect.arrayContaining([
          {
            text: expect.any(String),
          },
        ]),
      })
    );
  });
});
