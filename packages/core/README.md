# MasterChat Core

A JavaScript library for YouTube Live Chat.

## Install

```
npm i masterchat
```

## Use

```js
import { iterateChat, fetchContext } from "masterchat";

const history = [];
const context = await fetchContext("<videoId>");

for await (const { actions } of iterateChat(context)) {
  history.push(...actions);
}
```
