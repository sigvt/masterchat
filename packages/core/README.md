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
const token = context.continuations.top.token;

for await (const response of iterateChat({ ...context.auth, token })) {
  if (response.error) break;

  const { actions } = response;

  history.push(...actions);
}
```
