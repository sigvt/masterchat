import { fetchChat, fetchContext } from "..";
import { ReloadContinuationType } from "../chat";

it("can fetch initial chat", async () => {
  const context = await fetchContext("QK75uDJ9eyk");
  if (!context.continuations || !context.metadata) {
    console.log("invalid request");
    return;
  }

  console.log(context);

  const res = await fetchChat({
    ...context.auth,
    continuation: context.continuations[ReloadContinuationType.All].token,
    isReplayChat: context.metadata.isLive,
  });

  expect(res).toHaveProperty("actions");

  if (res.error) {
    throw new Error(res.error.message);
  }

  console.log(res.actions[0]);

  expect(res.actions[0]).toHaveProperty("timestamp");
});
