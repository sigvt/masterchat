import { setupRecorder } from "nock-record";
import fetch from "cross-fetch";
import { Masterchat, timeoutThen } from "..";

const record = setupRecorder({
  mode: (process.env.NOCK_BACK_MODE as any) || "record",
});

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
    expect(mc.metadata.id).toBe(subject.id);
    expect(mc.metadata.title).toBe(subject.title);
    expect(mc.metadata.channelId).toBe(subject.channel.id);
    expect(mc.metadata.channelName).toBe(subject.channel.name);
  });

  it("can fetch live chat", async () => {
    const { completeRecording } = await record("wildlife2");

    const chat = await mc.fetchChat({
      continuation: mc.continuation.all.token,
    });

    if (chat.error) {
      throw new Error(chat.error.message);
    }
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
    await timeoutThen(timeoutMs);

    const consecutiveChat = await mc.fetchChat({
      continuation: token,
    });
    completeRecording();
    if (consecutiveChat.error) {
      throw new Error(consecutiveChat.error.message);
    }

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
