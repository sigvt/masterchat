import fetch from "node-fetch";
import { Context, fetchChat, fetchContext, timeoutThen } from "..";

async function fetchUpcomingStreams() {
  const data = await fetch(
    "https://holodex.net/api/v2/live?status=upcoming"
  ).then((res) => res.json());
  return data;
}

describe("wildlife test", () => {
  jest.setTimeout(60000);

  let subject: any;
  let ctx: Context | undefined;

  beforeAll(async () => {
    const index = await fetchUpcomingStreams();
    subject = index[0];
    ctx = await fetchContext(subject.id);
  });

  it("context match", async () => {
    expect(ctx?.metadata?.id).toBe(subject.id);
    expect(ctx?.metadata?.title).toBe(subject.title);
    expect(ctx?.metadata?.channelId).toBe(subject.channel.id);
    expect(ctx?.metadata?.channelName).toBe(subject.channel.name);
  });

  it("can fetch live chat", async () => {
    const chat = await fetchChat({
      continuation: ctx?.continuations?.all.token!,
      apiKey: ctx?.apiKey!,
      isReplayChat: false,
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

    const token = chat?.continuation?.token;
    const timeoutMs = chat?.continuation?.timeoutMs;
    if (!timeoutMs || !token) {
      throw new Error("timeoutMs or token not found");
    }

    console.log("waiting for", timeoutMs);
    await timeoutThen(timeoutMs);

    const consecutiveChat = await fetchChat({
      continuation: token,
      apiKey: ctx?.apiKey!,
      isReplayChat: false,
    });
    if (consecutiveChat.error) {
      throw new Error(consecutiveChat.error.message);
    }

    expect(consecutiveChat.error).toBeNull();
    expect(consecutiveChat?.continuation?.token).toEqual(expect.any(String));
    expect(consecutiveChat).toHaveProperty("actions");
  });
});
