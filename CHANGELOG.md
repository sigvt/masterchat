# Changelog

## Unreleased

- Masterchat Agent for handling events using EventEmitter
- Masterchat Manager for processing multiple live streams
- required Node.js version is now v16.6.0 or higher
- re-export more yt types

### utils

- Renamed `normalizedVideoId` -> `toVideoId`
  - `toVideoId` will returns `undefined` when the given string doesn't contains any valid id pattern
- fix format issue in default emoji handler of `runsToString`

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
