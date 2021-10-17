# Changelog

## v0.13.0

### New

- New action: `AddMembershipMilestoneItemAction`. Refer to `duration` for a precise membership duration
- New action: `ShowPollPanelAction`.
- Add `timestampColor` and `authorNameTextColor` to `SuperChat`
- New util `stringify` to transform `YTRun[]`, `YTRunContainer` and `YTSimpleText` into string
- New util `formatColor` to format `Color` into CSS rgba() or HEX string
- New util `durationToISO8601` to format duration text into ISO8601 duration string
- New util `durationToSeconds` to format duration text into integer seconds
- New util `tsToDate` to format timestampUsec to Date
- New util `tsToNumber` to format timestampUsec to number

### Improvements

- BREAKING: normalized all the raw interfaces:
  - `AddBannerAction`
  - `AddMembershipItemAction`
  - `AddMembershipTickerAction`
  - `AddPlaceholderItemAction`
  - `AddSuperChatTickerAction`
  - `AddSuperStickerItemAction`
  - `AddSuperStickerTickerAction`
  - `AddViewerEngagementMessageAction`
  - `ClosePanelAction`
  - `ShowPanelAction`
  - `ShowTooltipAction`
- BREAKING: renamed `ShowLiveChatActionPanelAction` -> `ShowPanelAction`
- BREAKING: renamed `UpdateLiveChatPollAction` -> `UpdatePollAction`
- BREAKING: renamed `CloseLiveChatActionPanelAction` -> `ClosePanelAction`
- DEPRECATED: `AddChatItemAction.rawMessage` -> `AddChatItemAction.message`
- DEPRECATED: `AddSuperChatItemAction.rawMessage` -> `AddSuperChatItemAction.message`
- DEPRECATED: props of `AddSuperChatItemAction.superchat` has been flattened into `AddSuperChatItemAction`
- BREAKING: `end` event will provide a reason (`'privated' | 'deleted' | 'disabled' | 'aborted' | null`)
  - `streamPool.on('end', (mc) => {})` -> `streamPool.on('end', (reason, mc) => {})`
- BREAKING: instance will emits `end` instead of `error` in some special cases where the unrecoverable error code is either `private` or `unavailable` and it was not occurred during the first request (this usually happens when a streamer deletes or privates their live stream after the stream ends)
- BREAKING: `runsToPlainText` will expand `watchEndpoint` when `text` is a fragment of URL
- use Uint8Array instead of Buffer in protobuf lib (by @jprochazk)

### Fixes

- BREAKING: remove `unknown` type from `MasterchatError`
- Deprecate `Credentials.SESSION_ID` in favor of `Credentials.DELEGATED_SESSION_ID`

## v0.12.0

- BREAKING: Merged `MasterchatAgent` into `Masterchat`
  - Use `on` and `listen`. `iterate` and `fetch` are still available for advanced users
- BREAKING: `new Masterchat(..., {isLive?: boolean})` -> `new Masterchat(..., {mode?: "live" | "replay"})`
- Added type definition for `once`
- New `metadata` property
- BREAKING: Renamed `MasterchatManager` -> `StreamPool`
- BREAKING: In `StreamPool` event callback, `(metadata: Metadata, ...) => {}` -> `(..., mc: Masterchat) => {}`
  - i.e. `on("actions", ({ videoId }, actions) => {})` -> `on("actions", (actions, { videoId }) => {})`
  - e.g. `on("data", (data, mc) => { if (...) { mc.stop() } })`

before:

```js
const mc = new Masterchat(videoId, ...)

try {
  for await (const { actions } of mc.iterate()) {
    const chats = actions.filter(action => action.type === "addChatItemAction")
    ...
    if (youWant) break;
  }
} catch(err) {
  ...
}
```

now:

```js
const mc = new Masterchat(videoId, ...)
  .on("chats", chats => {
    ...
    if (youWant) mc.stop();
  })
  .on("error", err => {
    ...
  })

mc.listen()
```

### utils

- BREAKING: `emojiHandler` in `runsToString` now takes `YTEmojiRun` instead of `YTEmoji`
- Added `textHandler` option to `runsToString`
- BREAKING: `runsToString` will expand truncated urls (by @stu43005)

## v0.11.0

- Masterchat Agent for handling events using EventEmitter
- Masterchat Manager for processing multiple live streams
- Required Node.js version is now v16.6.0 or higher
- Re-export more yt types

### utils

- Renamed `normalizedVideoId` -> `toVideoId`
  - `toVideoId` will returns `undefined` when the given string doesn't contains any valid id pattern
- Fix format issue in default emoji handler of `runsToString`

## v0.10.0

- Support legacy pageId session (append `SESSION_ID` to `Credentials`)

### chatActions

- `.remove` will use homebrew pb params

### chat

- `.fetch` will attempt to switch an API endpoint to the replay chat if failed to fetch chats from the live chat. Explicitly set `isLive` option `true` or `false` when instiantiating Masterchat to disable this behavior.
  - if unset,
    - live -> OK
    - archive -> first request fails, then try fetching replay chat -> OK
  - if set `true`:
    - live -> OK
    - archive -> throw DisabledChatError
  - if set `false`:
    - live -> throw DisabledChatError
    - archive -> OK
- Supported `.fetch` overloading
  - `.fetch(options?: FetchChatOptions)`
  - `.fetch(token: string, options?: FetchChatOptions)`
- Renamed `SucceededChatResponse` -> `ChatResponse`
- Dropped `ignoreReplayTimeout` option from `.iterate`

### extra

- credential-fetcher now supports parsing legacy session id

## v0.9.0

- Full Protocol Buffer support
- Use `new Masterchat(videoId, channelId, {isLive})` for skipping metadata fetching. `Masterchat.init(videoId)` scrapes watch page in order to obtain channelId and livechat status
- Renamed `masterchat/types/...` -> `masterchat/yt/...`
- Renamed `Masterchat.metadata.isLive` -> `Masterchat.isLive`
- Renamed `Masterchat.metadata.channelId` -> `Masterchat.channelId`
- Renamed `Masterchat.metadata.channelName` -> `Masterchat.channelName`
- Renamed `Masterchat.metadata.title` -> `Masterchat.title`
- Removed `Masterchat.isReplay`

### context

- `fetchMetadata()` -> `Masterchat.populateMetadata()`

### chat

- `iterateChat("top" | "all")` -> `iterate({topChat: true|false})`,
- `fetchChat({continuation})` -> `fetch(b64Token)` OR `fetch({topChat})`
- `AddSuperChatItemAction.currency` always contains normalized three-letter currency code

### tools

- Added diagnosis toolkit

### utils

- Renamed `convertRunsToString` -> `runsToString`
