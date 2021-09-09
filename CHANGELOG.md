# Changelog

## Unreleased

- `new Masterchat(videoId, channelId, {isReplay})` won't load watch page whereas `Masterchat.init(videoId)` will do in order to obtain channelId and livechat mode
- Renamed `masterchat/types/...` -> `masterchat/yt/...`
- Renamed `Masterchat.metadata.isLive` -> `Masterchat.isLive`
- Renamed `Masterchat.metadata.channelId` -> `Masterchat.channelId`
- Renamed `Masterchat.metadata.channelName` -> `Masterchat.channelName`
- Renamed `Masterchat.metadata.title` -> `Masterchat.title`
- Deprecated `Masterchat.isReplay`

### tools

- New: diagnosis toolkit

### chat

- `iterateChat("top" | "all")` -> `iterate({topChat: true|false})`,
- `iterate` generates pb token itself
- `fetchChat({continuation})` -> `fetch(b64Token)` OR `fetch({topChat})`
- `AddSuperChatItemAction.currency` always contains normalized three-letter currency code

### utils

- Renamed `convertRunsToString` -> `runsToString`
