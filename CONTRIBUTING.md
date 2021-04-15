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
DEBUG=masterchat ./packages/cli/lib/masterchat -c <videoId>
```

## Release Flow (Maintainers only)

```
yarn lerna publish
```
