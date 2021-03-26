# MasterChat CLI

## Install

```
npm i -g masterchat-cli
```

## Use

```
masterchat inspect <video>
```

## Options

- `--type, -t`: Chat type (`top` or `all`)
- `--mod, -m`: Show moderation events
- `--author, -a`: Show author name
- `--filter, -f`: Filter chat

### Filter Rules

Only show moderators' chat:

```
masterchat inspect <videoId> --filter isModerator
```

Only show chat from verified account or channel owner:

```
masterchat inspect <videoId> --filter 'isVerified or isOwner'
```

Only show super chat:

```
masterchat inspect <videoId> --filter superchat
```

Only show red super chat:

```
masterchat inspect <videoId> --filter 'superchat.color == "red"'
```

Only show membership chat:

```
masterchat inspect <videoId> --filter membership
```

Only show live translations:

```
masterchat inspect <videoId> --filter 'match(message, "^(\\[[a-z]+?\\]|[a-z]+?: )", "i")'
```

Only show chat contains 草:

```
masterchat inspect <videoId> --filter 'message.includes("草")'
```
