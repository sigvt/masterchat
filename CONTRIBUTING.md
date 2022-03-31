# Contribution Guide

## Build

```bash
git clone https://github.com/holodata/masterchat
cd masterchat
git switch dev
yarn install
yarn build
```

## Development Flow

```bash
yarn dev
```

```bash
yarn build
yarn link

cd ..

git clone https://github.com/holodata/masterchat-cli
cd masterchat-cli
yarn install
yarn build
yarn link
yarn link masterchat
DEBUG=masterchat mc live <videoId>
DEBUG=masterchat mc events
```

## Testing

Test while recording response (run only once):

```bash
NOCK_BACK_MODE=record jest
```

Test using recorded response:

```bash
jest
```

Disable fixtures completely:

```bash
NOCK_BACK_MODE=wild jest
```

## Release Flow (Maintainers only)

```
np
```
