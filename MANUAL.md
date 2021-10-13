# Manual

## Usage

[API Documentation](https://holodata.github.io/masterchat)

### Iterate live chats

```js
import { Masterchat, stringify } from "masterchat";

async function main() {
  const mc = await Masterchat.init("<videoId>");

  // listen for chats
  mc.on("chats", (chats) => {
    for (const chat of chats) {
      console.log(chat.authorName, stringify(chat.rawMessage));
    }
  });

  // listen for every event
  mc.on("actions", (actions) => {
    const chats = actions.filter(
      (action) => action.type === "addChatItemAction"
    );
    const superchats = actions.filter(
      (action) => action.type === "addSuperChatItemAction"
    );
    const placeholderEvents = actions.filter(
      (action) => action.type === "AddPlaceholderItemAction"
    );
  });

  mc.on("error", (err) => {
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

  mc.on("end", () => {
    console.log("Live stream has ended");
  }

  mc.listen();
}

main();
```

### Download replay chat as JSONLines

```js
import { Masterchat } from "masterchat";
import { appendFile, writeFile, readFile } from "fs/promises";

async function main() {
  const mc = await Masterchat.init("<videoId>");

  const lastContinuation = await readFile("./checkpoint").catch(
    () => undefined
  );

  mc.on("chats", async (chats) => {
    const jsonl = chats.map((chat) => JSON.stringify(chat)).join("\n");
    await appendFile("./chats.jsonl", jsonl + "\n");

    // save checkpoint
    await writeFile("./checkpoint", continuation.token);
  });

  await mc.listen({ continuation: lastContinuation });
}

main();
```

### Auto-moderator

```js
import { Masterchat, stringify } from "masterchat";
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

  mc.on("chats", async (chats) => {
    for (const chat of chats) {
      const message = stringify(chat.rawMessage, {
        emojiHandler: (emoji) => "",
      });

      if (isSpam(message)) {
        await mc.remove(action.id);
      }
    }
  });

  mc.listen();
}

main();
```

## Advanced Usage

### Faster instantiation

To skip loading watch page, use `new Masterchat(videoId: string, channelId: string, { mode?: "live" | "replay" })`:

```js
const live = new Masterchat(videoId, channelId, { mode: "live" });
```

instead of:

```js
const live = await Masterchat.init(videoId);
```

The former won't fetch metadata. If you need metadata, call:

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

| type                                            | metadata.isLive | Masterchat.init()            | mode: undefined        | mode: "live"           | mode: "replay"         |
| ----------------------------------------------- | --------------- | ---------------------------- | ---------------------- | ---------------------- | ---------------------- |
| live/pre stream                                 | `true`          | OK                           | OK                     | OK                     | `DisabledChatError`    |
| pre stream but chat disabled                    | `true`          | `DisabledChatError`          | `DisabledChatError`    | `DisabledChatError`    | `DisabledChatError`    |
| archived stream                                 | `false`         | OK                           | OK                     | `DisabledChatError`    | OK                     |
| archived stream but replay chat being processed | `false`         | `DisabledChatError`          | `DisabledChatError`    | `DisabledChatError`    | `DisabledChatError`    |
| members-only live stream                        | N/A             | `MembersOnlyError`           | `DisabledChatError`    | `MembersOnlyError`     | `DisabledChatError`    |
| members-only archived stream                    | N/A             | `MembersOnlyError`           | **OK**                 | `DisabledChatError`    | **OK**                 |
| unarchived stream                               | N/A             | **`NoStreamRecordingError`** | `DisabledChatError`    | `DisabledChatError`    | `DisabledChatError`    |
| privated stream                                 | N/A             | `NoPermissionError`          | `NoPermissionError`    | `NoPermissionError`    | `NoPermissionError`    |
| deleted stream                                  | N/A             | `UnavailableError`           | `UnavailableError`     | `UnavailableError`     | `UnavailableError`     |
| invalid video/channel id                        | N/A             | `InvalidArgumentError`       | `InvalidArgumentError` | `InvalidArgumentError` | `InvalidArgumentError` |
