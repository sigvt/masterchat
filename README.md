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

## Use

```js
import { Masterchat, convertRunsToString } from "masterchat";

const mc = await Masterchat.init("<videoId>");

for await (const res of mc.iterateChat({ tokenType: "top" })) {
  if (res.error) break;

  const { actions } = res;
  const chats = actions.filter((action) => action.type === "addChatItemAction");

  for (const chat of chats) {
    console.log(chat.authorName, convertRunsToString(chat.rawMessage));
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
