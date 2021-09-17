# Manual

## Usage

[API Documentation](https://holodata.github.io/masterchat)

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

## Stream type

| type                                            | isLive (auto) | auto                     | direct (isLive: true)  | direct (isLive: false) |
| ----------------------------------------------- | ------------- | ------------------------ | ---------------------- | ---------------------- |
| live/pre stream                                 | `true`        | **OK**                   | **OK**                 | `DisabledChatError`    |
| pre stream but chat disabled                    | `true`        | `DisabledChatError`      | `DisabledChatError`    | `DisabledChatError`    |
| archived stream                                 | `false`       | **OK**                   | `DisabledChatError`    | **OK**                 |
| archived stream but replay chat being processed | `false`       | `DisabledChatError`      | `DisabledChatError`    | `DisabledChatError`    |
| members-only live stream                        | N/A           | `MembersOnlyError`       | `DisabledChatError`    | `MembersOnlyError`     |
| members-only archived stream                    | N/A           | `MembersOnlyError`       | `DisabledChatError`    | **OK**                 |
| unarchived stream                               | N/A           | `NoStreamRecordingError` | `DisabledChatError`    | `DisabledChatError`    |
| privated stream                                 | N/A           | `NoPermissionError`      | `NoPermissionError`    | `NoPermissionError`    |
| deleted stream                                  | N/A           | `UnavailableError`       | `UnavailableError`     | `UnavailableError`     |
| invalid video/channel id                        | N/A           | `InvalidArgumentError`   | `InvalidArgumentError` | `InvalidArgumentError` |
