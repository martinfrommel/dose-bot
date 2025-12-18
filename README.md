# DoseBot

DoseBot is a simple, open-source application for recording, managing, and serving dosage data for substances via a GraphQL API and a simple web UI. It includes scaffolding to manage API keys, track substances, and record doses, making it easy to integrate with external services or bots.

The project uses Prisma with SQLite by default, optional Memcached for caching, Tailwind CSS with daisyUI for UI components, and Vite for the web dev server.

## Features

- GraphQL API for `Dose`, `Substance`, and `ApiKey` entities
- Web UI scaffold to create, edit, and list API keys
- Prisma ORM with SQLite (simple local development)
- Optional Memcached-backed cache (via `memjs`)
- Modern UI using Tailwind CSS and daisyUI

## Stack

- CedarJS (API, Web, Router, Forms)
- Prisma (SQLite by default)
- React 18 + Vite
- Tailwind CSS 3 + daisyUI 4
- Memcached (optional cache)

## Prerequisites

- Node.js 24.x
- Yarn 4.x (Corepack recommended)

## Quick Start

1. Install dependencies:

```bash
yarn install
```

2. Set up the database (SQLite) and generate Prisma client:

```bash
yarn cedar prisma migrate dev
# Alternatively, for quick prototyping:
yarn cedar prisma db push
```

3. Start the development servers (API + Web):

```bash
yarn cedar dev
```

Open the app at <http://localhost:8910>. The GraphQL server runs on <http://localhost:8911>.

## Environment Variables

Create a `.env` file at the project root (or use your preferred env management). Common variables:

- `DATABASE_URL`: Prisma connection string. Default for SQLite: `file:./api/db/dev.db`
- `CACHE_HOST`: Optional Memcached host, e.g. `localhost:11211` (or `memcached:11211` when using Docker Compose)
- `NODE_ENV`: `development`, `test`, or `production`

Auth is not set up by default; see CedarJS docs if you plan to add it.

## Database

This project ships with SQLite for simplicity. The Prisma schema lives at `api/db/schema.prisma`.

- Run migrations: `yarn cedar prisma migrate dev`
- Push changes (no migration): `yarn cedar prisma db push`

## Optional Caching

If `CACHE_HOST` is set, the API will attempt to connect to Memcached using `memjs`. In local development you can omit this and caching will fall back to in-memory.

## Docker Compose

For local development, you can spin up Memcached and optionally run the app inside a container. A `docker-compose.yml` is included.

### Start Memcached only

```bash
docker compose up -d memcached

# Then run the app locally with CACHE_HOST pointing at Memcached
export CACHE_HOST=localhost:11211
yarn cedar dev
```

### Run the app in Docker (dev mode)

```bash
docker compose up
```

This starts:

- `memcached` on port 11211
- `app` using Node 24, running `yarn cedar dev`, exposing ports 8910 (web) and 8911 (api)

Note: The app service mounts the workspace directory, so changes on your host are reflected in the container. Prisma uses the SQLite file in the repo.

## Testing

Jest configs exist for both `api` and `web`. You can run tests with:

```bash
yarn cedar test
```

## License

DoseBot is open-source software licensed under the MIT License. See `LICENSE` for details.
