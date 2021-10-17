# Contribution Guide

## Setup

```bash
git checkout dev
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

cd tools
yarn install
yarn link masterchat
DEBUG=masterchat ts-node ./inspector.ts <videoId>
DEBUG=masterchat ts-node ./stream-pool.ts
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
