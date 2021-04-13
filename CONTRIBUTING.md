# Contribution Guide

## Setup

```bash
yarn install
yarn lerna boostrap
```

## Development Flow

```bash
yarn lerna run dev --parallel
```

```bash
DEBUG=masterchat masterchat -c <videoId>
```

## Release Flow (Maintainers only)

```
yarn lerna publish
```
