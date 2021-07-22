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
import { iterateChat, fetchContext } from "masterchat";

const { chat, apiKey } = await fetchContext("<videoId>");

const token = chat.continuations.top.token;
const history = [];

for await (const res of iterateChat({ apiKey, token })) {
  if (res.error) break;

  const { actions } = res;

  history.push(...actions);
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
