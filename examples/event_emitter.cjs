const { Masterchat, stringify } = require("masterchat");

async function main() {
  const mc = await Masterchat.init("oyxvhJW1Cf8");

  mc.on("chat", (chat) => {
    console.log(`${chat.authorName}: ${stringify(chat.message)}`);
  });

  mc.on("actions", (actions) => {
    const superchats = actions.filter(
      (action) => action.type === "addSuperChatItemAction"
    );

    for (const sc of superchats) {
      const label = `SC ${sc.amount} ${sc.currency}`;
      console.log(`[${label}] ${sc.authorName}: ${stringify(sc.message)}`);
    }
  });

  mc.listen();
}

main();
