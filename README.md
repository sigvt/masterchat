# Masterchat

[![npm](https://badgen.net/npm/v/masterchat)](https://npmjs.org/package/masterchat)
[![npm: total downloads](https://badgen.net/npm/dt/masterchat)](https://npmjs.org/package/masterchat)
[![npm: publish size](https://badgen.net/packagephobia/publish/masterchat)](https://npmjs.org/package/masterchat)
[![typedoc](https://badgen.net/badge/docs/typedoc/purple)](https://holodata.github.io/masterchat/)

Masterchat is the most powerful library for YouTube Live Chat, supporting parsing 20+ actions, video comments and transcripts, as well as sending messages and moderating chats.

## Install

```
npm install masterchat
```

```js
import { Masterchat, stringify } from "masterchat";

const mc = await Masterchat.init("oyxvhJW1Cf8");

const chats = mc.iter().filter((action) => action.type === "addChatItemAction");

for await (const chat of chats) {
  console.log(`${chat.authorName}: ${stringify(chat.message)}`);
}
```

See [MANUAL](https://github.com/holodata/masterchat/tree/master/MANUAL.md) for further instructions.

## CLI

```bash
npm i -g masterchat-cli
```

```bash
mc watch --org Hololive
```

See [masterchat-cli](https://github.com/holodata/masterchat-cli) for detailed usage.

## Desktop App

See [☄️Komet](https://github.com/holodata/komet) for further information.

## Community

### Contributing

- Use masterchat with `DEBUG=masterchat` and [report](https://github.com/holodata/masterchat/issues/new) logs that are prefixed with `[action required]`
- Squash [TODOs](https://github.com/holodata/masterchat/search?l=TypeScript&q=TODO)

See [Contribution Guide](./CONTRIBUTING.md) for more information.
Ask questions in `#masterchat` channel on [holodata Discord server](https://holodata.org/discord).

### Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/uetchy"><img src="https://avatars.githubusercontent.com/u/431808?v=4?s=50" width="50px;" alt=""/><br /><sub><b>uetchy</b></sub></a><br /><a href="https://github.com/holodata/masterchat/commits?author=uetchy" title="Code">💻</a></td>
    <td align="center"><a href="http://www.plurk.com/stu43005"><img src="https://avatars.githubusercontent.com/u/1288549?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Shiaupiau</b></sub></a><br /><a href="https://github.com/holodata/masterchat/commits?author=stu43005" title="Code">💻</a></td>
    <td align="center"><a href="https://jan-prochazka.eu/"><img src="https://avatars.githubusercontent.com/u/1665677?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Jan Procházka</b></sub></a><br /><a href="https://github.com/holodata/masterchat/commits?author=jprochazk" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/sphinxrave"><img src="https://avatars.githubusercontent.com/u/62570796?v=4?s=50" width="50px;" alt=""/><br /><sub><b>sphinxrave</b></sub></a><br /><a href="https://github.com/holodata/masterchat/issues?q=author%3Asphinxrave" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/RiceCakess"><img src="https://avatars.githubusercontent.com/u/3145205?v=4?s=50" width="50px;" alt=""/><br /><sub><b>David Chen</b></sub></a><br /><a href="https://github.com/holodata/masterchat/issues?q=author%3ARiceCakess" title="Bug reports">🐛</a> <a href="#ideas-RiceCakess" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/MadProbe"><img src="https://avatars.githubusercontent.com/u/49519179?v=4?s=50" width="50px;" alt=""/><br /><sub><b>Evgeniy Istomin</b></sub></a><br /><a href="https://github.com/holodata/masterchat/commits?author=MadProbe" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!

### Projects using Masterchat

- [Holodex](https://holodex.net)
- [Luna's Translation](https://github.com/luna-translations-bot/luna-translations-bot)
- [Honeybee](https://github.com/holodata/honeybee)
- [ShipID](https://github.com/holodata/ShipID)
- [Komet](https://github.com/holodata/Komet)

## Related projects

- [YouTube.js](https://github.com/LuanRT/YouTube.js)
