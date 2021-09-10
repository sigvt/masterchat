# Changelog

## Unreleased

### chat

- `fetch` will attempt to switch an API endpoint to the replay chat if failed to fetch chats from the live chat API. Pass `{fallbackToReplayChat: false}` to `iterate` or `fetch` to disable this behavior.
- Supporeted `fetch` overloading
  - `fetch(options?: FetchChatOptions)`
  - `fetch(token: string, options?: FetchChatOptions)`
- Renamed `SucceededChatResponse` -> `ChatResponse`

## v0.9.0

- Full protobuf support
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
