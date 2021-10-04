# Contribution Guide

## Setup

```bash
git checkout dev
npm install
npm run build
```

## Development Flow

```bash
npm run dev
```

```bash
npm run build
yarn link

cd tools/
yarn install
yarn link masterchat
DEBUG=masterchat node -r ts-node/register ./livechat-inspector.ts <videoId>
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
