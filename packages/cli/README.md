# MasterChat CLI

See YouTube Live Chat through flexible filtering engine. For GUI version, see [Komet](https://github.com/holodata/komet).

## Install

```
npm i -g masterchat-cli
```

## Use

```
masterchat <videoUrl or videoId>
```

## Options

- `--type <string>`: Chat type (`top` or `all`)
- `--mod`: Show moderation events
- `--author`: Show author name
- `--filter <string>`: Filter rule

### Useful Filter Rules

Only show moderators' chat:

```bash
--filter isModerator
```

Only show chat from verified account or channel owner:

```bash
--filter 'isVerified || isOwner'
```

Only show super chat:

```bash
--filter superchat
```

Only show red super chat:

```bash
--filter 'superchat && superchat.color == "red"'
```

Only show membership chat:

```bash
--filter membership
```

Only show live translations:

```bash
--filter '/^(\\[[a-z]+?\\]|[a-z]+?: )/i.test(message)'
```

Only show chat contains 草:

```bash
--filter 'message.includes("草")'
```
