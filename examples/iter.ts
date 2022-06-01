import { AddChatItemAction, Masterchat, stringify } from "masterchat";

async function main() {
  const mc = await Masterchat.init("oyxvhJW1Cf8");

  const iter = mc
    .iter()
    .filter(
      (action): action is AddChatItemAction =>
        action.type === "addChatItemAction"
    );

  for await (const action of iter) {
    console.log(`${action.authorName}: ${stringify(action.message!)}`);
  }
}

main();
