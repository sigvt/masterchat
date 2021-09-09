# Contribution Guide

## Setup

```bash
npm install
npm run build
```

## Development Flow

```bash
npm run dev
```

```bash
DEBUG=masterchat ./lib/cli.js -c -t all <videoId>
```

## Testing

Test while recording response (run only once):

```bash
DEBUG=masterchat NOCK_BACK_MODE=record jest
```

Test using recorded response:

```bash
DEBUG=masterchat jest
```

Disable fixtures completely:

```bash
DEBUG=masterchat NOCK_BACK_MODE=wild jest
```

## Release Flow (Maintainers only)

```
np
```
