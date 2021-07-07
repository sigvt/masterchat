# MasterChat Core

A JavaScript library for YouTube Live Chat.

## Install

```
npm i masterchat
```

## Use

```js
import { iterateChat, fetchContext } from "masterchat";

const { continuations, apiKey } = await fetchContext("<videoId>");

const token = continuations.top.token;
const history = [];

for await (const res of iterateChat({ apiKey, token })) {
  if (res.error) break;

  const { actions } = res;

  history.push(...actions);
}
```
