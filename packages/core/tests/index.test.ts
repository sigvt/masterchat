import { fetchChat, fetchContext } from "../src";

it("can fetch initial chat", async () => {
  const context = await fetchContext("QK75uDJ9eyk");
  if (!context) {
    throw new Error("Invalid context");
  }
  const { metadata, continuations, auth } = context;
  if (!continuations || !metadata) {
    console.log("invalid request");
    return;
  }

  console.log(context);

  const res = await fetchChat({
    auth,
    continuation: continuations.all.token,
    isReplayChat: metadata.isLive,
  });

  expect(res).toHaveProperty("actions");

  if (res.error) {
    throw new Error(res.error.message);
  }

  console.log(res.actions[0]);

  expect(res.actions[0]).toHaveProperty("timestamp");
});
