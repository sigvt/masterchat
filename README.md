# Masterchat

[![npm](https://badgen.net/npm/v/masterchat)](https://npmjs.org/package/masterchat)
[![npm: total downloads](https://badgen.net/npm/dt/masterchat)](https://npmjs.org/package/masterchat)

JavaScript library for YouTube Live Chat.

- [Documentation](https://holodata.github.io/masterchat/classes/index.Masterchat.html)

## Install

```
npm i masterchat
```

## Usage

### Iterate live chats

```js
import { Masterchat, runsToString } from "masterchat";

async function main() {
  try {
    const client = await Masterchat.init("<videoId>");

    for await (const { actions } of client.iterate()) {
      const chats = actions.filter(
        (action) => action.type === "addChatItemAction"
      );

      for (const chat of chats) {
        console.log(chat.authorName, runsToString(chat.rawMessage));
      }
    }
  } catch (err) {
    console.log(err.code);
    // "disabled" => Live chat is disabled
    // "membersOnly" => No permission (members-only)
    // "private" => No permission (private video)
    // "unavailable" => Deleted OR wrong video id
    // "unarchived" => Live stream recording is not available
    // "denied" => Access denied
    // "invalid" => Invalid request
    // "unknown" => Unknown error
  }
}

main();
```

### Download replay chat as JSONLines

```js
import { Masterchat, convertRunsToString } from "masterchat";
import { appendFile, writeFile, readFile } from "fs/promises";

async function main() {
  const client = await Masterchat.init("<videoId>");

  const lastContinuation = await readFile("./checkpoint").catch(
    () => undefined
  );

  for await (const { actions, continuation } of client.iterate({
    continuation: lastContinuation,
  })) {
    const chats = actions.filter(
      (action) => action.type === "addChatItemAction"
    );

    const jsonl = chats.map((chat) => JSON.stringify(chat)).join("\n");
    await appendFile("./chats.jsonl", jsonl + "\n");

    // save checkpoint
    await writeFile("./checkpoint", continuation.token);
  }
}

main();
```

### Auto-moderator

```js
import { Masterchat, runsToString } from "masterchat";
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

  const client = await Masterchat.init("<videoId>", { credentials });

  for await (const { actions } of client.iterate({
    ignoreFirstResponse: true,
  })) {
    for (const action of actions) {
      if (action.type !== "addChatItemAction") continue;

      if (isSpam(runsToString(action.rawMessage))) {
        await client.remove(action.id);
      }
    }
  }
}

main();
```

## Advanced Usage

### Faster instantiation

To skip loading watch page, use `new Masterchat(videoId: string, channelId: string, { isLive?: boolean })`:

```js
const live = new Masterchat(videoId, channelId, { isLive: true });
```

instead of:

```js
const live = await Masterchat.init(videoId);
```

The former won't populate metadata. If you need metadata, call:

```js
await live.populateMetadata(); // will scrape metadata from watch page
console.log(live.title);
console.log(live.channelName);
```

### Fetch credentials

```bash
cd extra/credentials-fetcher
npm i
npm start
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

## Projects use masterchat

- [https://holodex.net](Holodex): for their TLDex backend
- [https://github.com/holodata/honeybee](Honeybee): large-scale chat collection cluster
- [https://github.com/holodata/Komet](Komet): Tweetdeck-like live chat client for macOS/Windows

## Contribute

- Use masterchat with your product and [report bugs](https://github.com/holodata/masterchat/issues/new)
- Squash [TODOs](https://github.com/holodata/masterchat/search?l=TypeScript&q=TODO)

See [Contribution Guide](./CONTRIBUTING.md) for more information.

## Community

Ask questions in `#masterchat` channel on [holodata Discord server](https://holodata.org/discord).
