const { Masterchat, stringify } = require("masterchat");

async function main() {
  const mc = await Masterchat.init("oyxvhJW1Cf8");

  for await (const action of mc.iter()) {
    switch (action.type) {
      case "addChatItemAction": {
        console.log(`${action.authorName}: ${stringify(action.message)}`);
        break;
      }
      case "addSuperChatItemAction": {
        const label = `SC ${action.amount} ${action.currency}`;
        console.log(
          `[${label}] ${action.authorName}: ${stringify(action.message)}`
        );
        break;
      }
    }
  }
}

main();
