# Masterchat Manual

- [Documentation](https://holodata.github.io/masterchat)
- [Usage](#usage)
- [Reference](#reference)

## Usage

### Just grab metadata

```js
import { Masterchat, stringify } from "masterchat";

const { title, channelId, channelName } = await Masterchat.init("<videoId>");

console.log(`info: ${title} @ ${channelName} (${channelId})`);
```

### Iterate over live chats

#### Event Emitter API

```js
import { Masterchat, stringify } from "masterchat";

const mc = await Masterchat.init("<videoId>");

// Listen for live chat
mc.on("chat", (chat) => {
  console.log(chat.authorName, stringify(chat.message));
});

// Listen for any events
//   See below for a list of available action types
mc.on("actions", (actions) => {
  const chats = actions.filter(
    (action) => action.type === "addChatItemAction"
  );
  const superChats = actions.filter(
    (action) => action.type === "addSuperChatItemAction"
  );
  const superStickers = actions.filter(
    (action) => action.type === "addSuperStickerItemAction"
  );
  // ...
});

// Handle errors
mc.on("error", (err) => {
  console.log(err.code);
  // "disabled" => Live chat is disabled
  // "membersOnly" => No permission (members-only)
  // "private" => No permission (private video)
  // "unavailable" => Deleted OR wrong video id
  // "unarchived" => Live stream recording is not available
  // "denied" => Access denied (429)
  // "invalid" => Invalid request
});

// Handle end event
mc.on("end", () => {
  console.log("Live stream has ended");
}

// Start polling live chat API
mc.listen();
```

#### Async Iterator API

```js
import { Masterchat, MasterchatError, stringify } from "masterchat";

try {
  const mc = await Masterchat.init("<videoId>");

  const chats = mc
    .iter()
    .filter((action) => action.type === "addChatItemAction");

  for await (const chat of chats) {
    console.log(`${chat.authorName}: ${stringify(chat.message)}`);
  }
} catch (err) {
  // Handle errors
  if (err instanceof MasterchatError) {
    console.log(err.code);
    // "disabled" => Live chat is disabled
    // "membersOnly" => No permission (members-only)
    // "private" => No permission (private video)
    // "unavailable" => Deleted OR wrong video id
    // "unarchived" => Live stream recording is not available
    // "denied" => Access denied (429)
    // "invalid" => Invalid request
    return;
  }

  throw err;
}

console.log("Live stream has ended");
```

### Save replay chats in .jsonl

```js
import { Masterchat } from "masterchat";
import { appendFile, writeFile, readFile } from "node:fs/promises";

const mc = await Masterchat.init("<videoId>");

await mc
  .iter()
  .filter((action) => action.type === "addChatItemAction") // only chat events
  .map((chat) => JSON.stringify(chat) + "\n") // convert to JSONL
  .forEach((jsonl) => appendFile("./chats.jsonl", jsonl)) // append to the file
```

### Chat moderation bot

```js
import { Masterchat, stringify } from "masterchat";
import { isSpam } from "spamreaper";

// `credentials` is an object containing YouTube session cookie or a base64-encoded JSON string of them
const credentials = {
  SAPISID: "<value>",
  APISID: "<value>",
  HSID: "<value>",
  SID: "<value>",
  SSID: "<value>",
};

const mc = await Masterchat.init("<videoId>", { credentials });

const iter = mc.iter().filter((action) => action.type === "addChatItemAction");

for await (const chat of iter) {
  const message = stringify(chat.message, {
    // omit emojis
    emojiHandler: (emoji) => "",
  });

  if (isSpam(message) || /UGLY/.test(message)) {
    // delete chat
    // if flagged as spam by Spamreaper
    // or contains "UGLY"
    await mc.remove(action.id);
  }
}
```

### Get video comments (≠ live chats)

```js
import { Masterchat } from "masterchat";

const mc = new Masterchat("<videoId>", "");

// Iterate over all comments
let res = await mc.getComments({ top: true });
while (true) {
  console.log(res.comments);

  if (!res.next) break;
  res = await res.next();
}

// Get comment by id
const comment = await mc.getComment("<commentId>");
console.log(comment);
```

### Get transcript

```js
import { Masterchat, stringify } from "masterchat";

const mc = new Masterchat("<videoId>", "");

const transcript = await mc.getTranscript();

for (const item of transcript) {
  console.log(item.startMs, stringify(item.snippet));
}
```

## Advanced usage

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

> credential-fetcher@0.0.0 start
> electron .

Login succeeded. Use credential token below:
eyJTSUQiOiJL[omit]iJBSEwx
```

Set credentials.

```js
const credentials = "eyJTSUQiOiJL[omit]iJBSEwx";

const client = await Masterchat.init(id, { credentials });
```

### Custom axios client

```js
import axios from "axios";
import https from "https";
import { Masterchat } from "masterchat";

const axiosInstance = axios.create({
  timeout: 4000,
  httpsAgent: new https.Agent({ keepAlive: true }),
});
const mc = await Masterchat.init("<videoId>", { axiosInstance });
```

## Reference

[API Documentation](https://holodata.github.io/masterchat)

### Action type

| `type`                                                                                                                             | description                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [addChatItemAction](https://holodata.github.io/masterchat/interfaces/AddChatItemAction.html)                                       | Live chat message                                                  |
| [addSuperChatItemAction](https://holodata.github.io/masterchat/interfaces/AddSuperChatItemAction.html)                             | Super chat message                                                 |
| [addSuperStickerItemAction](https://holodata.github.io/masterchat/interfaces/AddSuperStickerItemAction.html)                       | Super sticker message                                              |
| [addMembershipItemAction](https://holodata.github.io/masterchat/interfaces/AddMembershipItemAction.html)                           | Membership joining message                                         |
| [addMembershipMilestoneItemAction](https://holodata.github.io/masterchat/interfaces/AddMembershipMilestoneItemAction.html)         | Membership milestone message                                       |
| [addPlaceholderItemAction](https://holodata.github.io/masterchat/interfaces/AddPlaceholderItemAction.html)                         | Add a placeholder for later usage (invisible)                      |
| [replaceChatItemAction](https://holodata.github.io/masterchat/interfaces/ReplaceChatItemAction.html)                               | Replace a live chat or placeholder with a placeholder or live chat |
| [markChatItemAsDeletedAction](https://holodata.github.io/masterchat/interfaces/MarkChatItemAsDeletedAction.html)                   | Delete live chat by id                                             |
| [markChatItemsByAuthorAsDeletedAction](https://holodata.github.io/masterchat/interfaces/MarkChatItemsByAuthorAsDeletedAction.html) | Delete live chats by authorChannelId                               |
| [addSuperChatTickerAction](https://holodata.github.io/masterchat/interfaces/AddSuperChatTickerAction.html)                         | Ticker for super chat                                              |
| [addSuperStickerTickerAction](https://holodata.github.io/masterchat/interfaces/AddSuperStickerTickerAction.html)                   | Ticker for super sticker                                           |
| [addMembershipTickerAction](https://holodata.github.io/masterchat/interfaces/AddMembershipTickerAction.html)                       | Ticker for membership joining event                                |
| [addBannerAction](https://holodata.github.io/masterchat/interfaces/AddBannerAction.html)                                           | Pin a message                                                      |
| [removeBannerAction](https://holodata.github.io/masterchat/interfaces/RemoveBannerAction.html)                                     | Remove a pinned message                                            |
| [addViewerEngagementMessageAction](https://holodata.github.io/masterchat/interfaces/AddViewerEngagementMessageAction.html)         | Viewer engagement message                                          |
| [showPanelAction](https://holodata.github.io/masterchat/interfaces/ShowPanelAction.html)                                           | Show a panel (generic)                                             |
| [showPollPanelAction](https://holodata.github.io/masterchat/interfaces/ShowPollPanelAction.html)                                   | Show a poll panel                                                  |
| [updatePollAction](https://holodata.github.io/masterchat/interfaces/UpdatePollAction.html)                                         | Update a poll panel content                                        |
| [closePanelAction](https://holodata.github.io/masterchat/interfaces/ClosePanelAction.html)                                         | Close a panel                                                      |
| [addPollResultAction](https://holodata.github.io/masterchat/interfaces/AddPollResultAction.html)                                   | Poll result                                                        |
| [showTooltipAction](https://holodata.github.io/masterchat/interfaces/ShowTooltipAction.html)                                       | Tooltip                                                            |
| [modeChangeAction](https://holodata.github.io/masterchat/interfaces/ModeChangeAction.html)                                         | Notify mode changes (slow mode, members-only, subscribers-only)    |
| [membershipGiftPurchaseAction](https://holodata.github.io/masterchat/interfaces/MembershipGiftPurchaseAction.html)                 | Membership gift purchase notification                              |
| [membershipGiftRedemptionAction](https://holodata.github.io/masterchat/interfaces/MembershipGiftRedemptionAction.html)             | Membership gift redemption notification                            |
| [moderationMessageAction](https://holodata.github.io/masterchat/interfaces/ModerationMessageAction.html)                           | Moderation message                                                 |
| [addRedirectBannerAction](https://holodata.github.io/masterchat/interfaces/AddRedirectBannerAction.html)                           | Redirect banner notification (raid event)                          |

### Stream type

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
