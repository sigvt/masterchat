# MasterChat

[![npm](https://badgen.net/npm/v/masterchat)](https://npmjs.org/package/masterchat)
[![npm: total downloads](https://badgen.net/npm/dt/masterchat)](https://npmjs.org/package/masterchat)
[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/holodata/masterchat)

Battle-tested YouTube Live Chat client for JavaScript.

- [Documentation](https://holodata.github.io/masterchat/classes/index.Masterchat.html)

## Install

```
npm i masterchat
```

## Examples

### Iterate live chats

```js
import { Masterchat, convertRunsToString } from "masterchat";

async function main() {
  const mc = await Masterchat.init("<videoId>").catch((err) => {
    console.log(err.code);
    // "disabled" => Live chat is disabled
    // "membersOnly" => No permission (members-only)
    // "private" => No permission (private video)
    // "unavailable" => Deleted OR wrong video id
    // "unarchived" => Live stream recording is not available
    // "denied" => Access denied
    // "invalid" => Invalid request
    // "unknown" => Unknown error
  });

  for await (const res of mc.iterateChat("top" /* or "all" */)) {
    if (res.error) {
      console.log(res.error);
      break;
    }

    const { actions } = res;
    const chats = actions.filter(
      (action) => action.type === "addChatItemAction"
    );

    for (const chat of chats) {
      console.log(chat.authorName, convertRunsToString(chat.rawMessage));
    }
  }
}

main();
```

### Download replay chat as JSONLines

```js
import { Masterchat, convertRunsToString } from "masterchat";
import { appendFile } from "fs/promises";

async function main() {
  const mc = await Masterchat.init("<videoId>");

  for await (const { actions } of mc.iterateChat("all", {
    ignoreReplayTimeout: true,
  })) {
    const chats = actions.filter(
      (action) => action.type === "addChatItemAction"
    );

    const jsonl = chats.map((chat) => JSON.stringify(chat)).join("\n");

    await appendFile("./chats.jsonl", jsonl + "\n");
  }
}

main();
```

### Auto-moderator

```js
import { Masterchat, convertRunsToString } from "masterchat";
import { isSpam } from "spamreaper";

async function main() {
  // `credentials` is an object containing YouTube session cookie or a base64-encoded JSON string of them
  const credentials = {
    SAPISID: "<value>",
    APISID: "<value>",
    HSID: "<value>",
    SID: "<value>",
    SSID: "<value>",
  };

  const mc = await Masterchat.init("<videoId>", { credentials });

  for await (const { actions } of mc.iterateChat("all", {
    ignoreFirstResponse: true,
  })) {
    for (const action of actions) {
      if (action.type !== "addChatItemAction") continue;

      if (isSpam(convertRunsToString(action.rawMessage))) {
        await mc.remove(action.contextMenuEndpointParams);
      }
    }
  }
}

main();
```

## CLI

[![npm](https://badgen.net/npm/v/masterchat-cli)](https://npmjs.org/package/masterchat-cli)
[![npm: total downloads](https://badgen.net/npm/dt/masterchat-cli)](https://npmjs.org/package/masterchat-cli)

See YouTube Live Chat through flexible filtering engine.

- [Documentation](https://github.com/holodata/masterchat-cli/blob/master/README.md)
- [Source](https://github.com/holodata/masterchat-cli)

```
npm i -g masterchat-cli
```

## Desktop

For a desktop app, see [Komet](https://github.com/holodata/komet).

## Roadmap

- [x] Release `masterchat`
- [x] Release `masterchat-cli`
- [x] Auth support
- [x] Ability to send chat
- [x] Moderation functionality

## Contribute

We welcome your contribution such as:

- Use masterchat with your product and [report bugs](https://github.com/holodata/masterchat/issues/new)
- Squash [TODOs](https://github.com/holodata/masterchat/search?l=TypeScript&q=TODO)
- Join API discussions on [holodata Discord server](https://holodata.org/discord)

See [Contribution Guide](./CONTRIBUTING.md) for more information.

## Community

Ask questions in `#masterchat` channel on [holodata Discord server](https://holodata.org/discord).
