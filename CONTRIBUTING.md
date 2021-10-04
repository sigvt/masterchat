# Contribution Guide

## Setup

```bash
git checkout dev
npm install
yarn build
```

## Development Flow

```bash
yarn dev
```

```bash
yarn build
yarn link

cd tools/
yarn install
yarn link masterchat
DEBUG=masterchat ts-node ./inspector.ts <videoId>
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
