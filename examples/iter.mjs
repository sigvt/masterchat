import { Masterchat, stringify } from "masterchat";

const mc = await Masterchat.init("oyxvhJW1Cf8");

const chats = mc.iter().filter((action) => action.type === "addChatItemAction");

for await (const chat of chats) {
  console.log(`${chat.authorName}: ${stringify(chat.message)}`);
}
