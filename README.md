# MasterChat

[![npm](https://badgen.net/npm/v/masterchat)](https://npmjs.org/package/masterchat)
[![npm: total downloads](https://badgen.net/npm/dt/masterchat)](https://npmjs.org/package/masterchat)
[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/holodata/masterchat)

A JavaScript library for YouTube Live Chat.

- [Documentation](https://holodata.github.io/masterchat/)

## Install

```
npm i masterchat
```

## Examples

### Iterate live chats

```js
import { Masterchat, convertRunsToString } from "masterchat";

let mc;
try {
  mc = await Masterchat.init("<videoId>");
} catch (err) {
  console.log(err.code);
  // "private" => Private video
  // "unavailable" => Deleted video OR wrong video id
  // "unarchived" => Live stream recording is not available
  // "disabled" => Live chat is disabled
  // "abandoned" => Abandoned stream
  // "membersOnly" => No permission (members-only)
  // "denied" => Access denied
  // "invalid" => Invalid request
  // "unknown"; => Unknown error
}

for await (const res of mc.iterateChat({ tokenType: "top" })) {
  if (res.error) {
    console.log(res.error);
    break;
  }

  const { actions } = res;
  const chats = actions.filter((action) => action.type === "addChatItemAction");

  for (const chat of chats) {
    console.log(chat.authorName, convertRunsToString(chat.rawMessage));
  }
}
```

### Auto-moderation bot

```js
import { Masterchat, convertRunsToString } from "masterchat";
import { isSpam } from "spamreaper";

// YouTube session cookie
const credentials = {
  SAPISID: "<value>",
  APISID: "<value>",
  HSID: "<value>",
  SID: "<value>",
  SSID: "<value>",
};
const mc = await Masterchat.init("<videoId>", { credentials });

for await (const { actions } of mc.iterateChat({ tokenType: "all" })) {
  for (const action of actions) {
    if (action.type !== "addChatItemAction") continue;

    if (isSpam(convertRunsToString(action.rawMessage))) {
      await mc.remove(action.contextMenuEndpointParams);
    }
  }
}
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
- [ ] Moderation functionality

## Contribution

See [Contribution Guide](./CONTRIBUTING.md) for more information.

## Community

Ask questions in `#masterchat` channel on [holodata Discord server](https://holodata.org/discord).
