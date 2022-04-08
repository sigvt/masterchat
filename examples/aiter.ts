import { AddChatItemAction, Masterchat, stringify } from "masterchat";

async function main() {
  const mc = await Masterchat.init("https://holodex.net/watch/q0cauV_jA1E", {
    mode: "live",
  });

  console.log(mc.title, mc.channelName, mc.isLive);

  const iter = mc
    .iter()
    .filter((m): m is AddChatItemAction => m.type === "addChatItemAction")
    .map((m) => stringify(m.message!));

  try {
    for await (const msg of iter) {
      console.log(msg);
    }
  } catch (err: any) {
    console.log(err.code);
  }
}

async function main2() {
  const mc = await Masterchat.init("3PAeFZSaRH4");

  const iter = await mc
    .iter()
    .take(100)
    .groupBy((m) => m.type);

  for (const [type, items] of Object.entries(iter)) {
    console.log(type, items.length);
  }
}

async function main3() {
  const mc = await Masterchat.init("3PAeFZSaRH4");

  const iter = mc
    .iter()
    .filter((m): m is AddChatItemAction => m.type === "addChatItemAction");

  for await (const res of iter) {
    console.log(res.authorName);
  }
}

main().then(() => console.log("done"));
