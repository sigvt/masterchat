# Contribution Guide

- Use Masterchat with `DEBUG=masterchat` and [report](https://github.com/holodata/masterchat/issues/new) logs that are prefixed with `[action required]`
- Squash [TODOs](https://github.com/holodata/masterchat/search?l=TypeScript&q=TODO)

[Join our Discord](https://holodata.org/discord) to participate in discussions.

## Build

```bash
git clone https://github.com/holodata/masterchat
cd masterchat
git switch dev
npm install
npm run build
```

## Development Flow

In `masterchat` dir:

```bash
npm run build
npm link # link local masterchat package
npm run dev # watch and transpile files
```

Clone and build [Masterchat CLI](https://github.com/holodata/masterchat-cli):

```bash
git clone https://github.com/holodata/masterchat-cli ../masterchat-cli
cd masterchat-cli
npm install
npm run build
npm link # make local `masterchat` and `mc` command available on the shell
```

In `masterchat-cli` dir, link local `masterchat` module and rebuild the cli:

```bash
npm link masterchat # now `masterchat-cli` uses local `masterchat` module
npm run build
DEBUG=masterchat mc live <videoId>
DEBUG=masterchat mc events
```

## Testing

### Setup

Export necessary env vars:

```bash
export MC_TEST_VIDEO_ID=<video ID of the unlisted live stream from the `MC_TEST_CHANNEL_ID` channel>
export MC_TEST_CHANNEL_ID=<primary test channel id>
export MC_TEST_CHANNEL_ID_2=<secondary test channel id>
export MC_TEST_CREDENTIAL=<base64-encoded credentials of primary test channel id>
export MC_TEST_CREDENTIAL_2=<base64-encoded credentials of secondary test channel id>
```

Use [https://github.com/holodata/masterchat/tree/master/extra/credential-fetcher](credential-fetcher) to obtain base64-encoded credentials.

### Record API response while testing

Test while recording response (run only once):

```bash
NOCK_BACK_MODE=record vitest --run
```

### Run tests using recorded response

```bash
vitest
```

Disable fixtures completely:

```bash
NOCK_BACK_MODE=wild vitest
```

## Release Flow (Maintainers only)

```
np
```
