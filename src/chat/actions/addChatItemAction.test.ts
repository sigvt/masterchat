import assert from "assert";
import { YTLiveChatViewerEngagementMessageRenderer } from "../../interfaces/yt/chat";
import { stringify } from "../../utils";
import { parseLiveChatViewerEngagementMessageRenderer } from "./addChatItemAction";

it("can parse poll", () => {
  const payload: YTLiveChatViewerEngagementMessageRenderer = {
    id: "aaa",
    timestampUsec: "2939499",
    icon: { iconType: "POLL" },
    message: {
      runs: [
        { text: "好きな子からもらいたいのはどっち？", bold: true },
        {
          emoji: {
            emojiId: "🍫",
            shortcuts: [":chocolate_bar:"],
            searchTerms: ["chocolate", "bar"],
            image: {
              thumbnails: [
                {
                  url: "https://www.youtube.com/s/gaming/emoji/828cb648/emoji_u1f36b.svg",
                },
              ],
              accessibility: { accessibilityData: { label: "🍫" } },
            },
          },
        },
        {
          emoji: {
            emojiId: "💕",
            shortcuts: [":two_hearts:"],
            searchTerms: ["two", "hearts"],
            image: {
              thumbnails: [
                {
                  url: "https://www.youtube.com/s/gaming/emoji/828cb648/emoji_u1f495.svg",
                },
              ],
              accessibility: { accessibilityData: { label: "💕" } },
            },
          },
        },
        { text: "\n" },
        { text: "精一杯の手作りチョコ" },
        {
          emoji: {
            emojiId: "🍫",
            shortcuts: [":chocolate_bar:"],
            searchTerms: ["chocolate", "bar"],
            image: {
              thumbnails: [
                {
                  url: "https://www.youtube.com/s/gaming/emoji/828cb648/emoji_u1f36b.svg",
                },
              ],
              accessibility: { accessibilityData: { label: "🍫" } },
            },
          },
        },
        { text: " (52%)" },
        { text: "\n" },
        { text: "一生懸命選んだチョコ" },
        {
          emoji: {
            emojiId: "🍫",
            shortcuts: [":chocolate_bar:"],
            searchTerms: ["chocolate", "bar"],
            image: {
              thumbnails: [
                {
                  url: "https://www.youtube.com/s/gaming/emoji/828cb648/emoji_u1f36b.svg",
                },
              ],
              accessibility: { accessibilityData: { label: "🍫" } },
            },
          },
        },
        { text: " (27%)" },
        { text: "\n" },
        { text: "むしろあげる" },
        {
          emoji: {
            emojiId: "🍫",
            shortcuts: [":chocolate_bar:"],
            searchTerms: ["chocolate", "bar"],
            image: {
              thumbnails: [
                {
                  url: "https://www.youtube.com/s/gaming/emoji/828cb648/emoji_u1f36b.svg",
                },
              ],
              accessibility: { accessibilityData: { label: "🍫" } },
            },
          },
        },
        { text: " (20%)" },
        { text: "\n" },
        { text: "\n" },
        { text: "Poll complete: 463 votes" },
      ],
    },
  };
  const result = parseLiveChatViewerEngagementMessageRenderer(payload);

  assert(result?.type === "addPollResultAction");

  expect(stringify(result.question!)).toBe(
    "好きな子からもらいたいのはどっち？🍫💕"
  );
  expect(result.total).toBe("463");

  const choices = result.choices.map((c) => stringify(c.text));
  expect(choices).toEqual(
    expect.arrayContaining([
      "精一杯の手作りチョコ🍫",
      "一生懸命選んだチョコ🍫",
      "むしろあげる🍫",
    ])
  );

  const percentages = result.choices.map((c) => c.votePercentage);
  expect(percentages).toEqual(expect.arrayContaining(["52%", "27%", "20%"]));
});

it("can parse poll missing question", () => {
  const payload: YTLiveChatViewerEngagementMessageRenderer = {
    id: "aaa",
    timestampUsec: "2939499",
    icon: { iconType: "POLL" },
    message: {
      runs: [
        { text: "2 (73%)" },
        { text: "\n" },
        { text: "4 (26%)" },
        { text: "\n" },
        { text: "\n" },
        { text: "Poll complete: 637 votes" },
      ],
    },
  };
  const result = parseLiveChatViewerEngagementMessageRenderer(payload);

  assert(result?.type === "addPollResultAction");

  expect(stringify(result.question!)).toBeUndefined();
  expect(result.total).toBe("637");

  const choices = result.choices.map((c) => stringify(c.text));
  expect(choices).toEqual(expect.arrayContaining(["2", "4"]));

  const percentages = result.choices.map((c) => c.votePercentage);
  expect(percentages).toEqual(expect.arrayContaining(["73%", "26%"]));
});
