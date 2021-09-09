# Changelog

## Unreleased

- `new Masterchat(videoId, channelId)` won't load watch page whereas `Masterchat.init(videoId)` will do in order to obtain channelId
- Renamed `masterchat/types/...` -> `masterchat/yt/...`

### tools

- New: diagnosis toolkit

### chat

- `iterateChat("top" | "all")` -> `iterateChat({topChat: true|false})`,
- `iterateChat` generates pb token itself
- `fetchChat({continuation})` -> `fetchChat(b64Token)` OR `fetchChat({videoId, channelId, topChat})`
- `AddSuperChatItemAction.currency` always contains normalized three-letter currency code

### utils

- Renamed `convertRunsToString` -> `runsToString`
