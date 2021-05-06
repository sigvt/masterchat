# Contribution Guide

## Setup

```bash
yarn install
yarn bootstrap
yarn build
```

## Development Flow

```bash
yarn dev
```

```bash
DEBUG=masterchat ./packages/cli/lib/cli.js -c -t all <videoId>
```

## Release Flow (Maintainers only)

```
yarn lerna publish
```

## References

- [LiveChatMessages  |  YouTube Live Streaming API  |  Google Developers](https://developers.google.com/youtube/v3/live/docs/liveChatMessages)
