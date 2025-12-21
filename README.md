# 💊 DoseBot

Version: 1.0.0

DoseBot is a simple, open-source application for recording, managing, and serving dosage data for substances via a GraphQL API and a simple web UI. It includes scaffolding to manage API keys, track substances, and record doses, making it easy to integrate with external services or bots.

Full API reference: see [docs/api.md](docs/api.md).

**Deployment routing note:** The API can be served behind a reverse proxy (e.g., Traefik) that mounts the API at `/api` via labels while still pointing to the internal Cedar functions root. If you self-host, you can keep the default root (`/`) or choose your own prefix; adjust the proxy rule accordingly.

The project uses Prisma with SQLite by default, optional Memcached for caching, Tailwind CSS with daisyUI for UI components, and Vite for the web dev server.

## 🌱 Motivation behind this project

We believe that having simple, locally deployable and accessible web-based apps is a good way of keeping your data to yourself, and through this experiment, we are hoping to further this endeavour.

## 🌍 Where can I run this

Anywhere - you can deploy this through a third-party platfom like Coolify or Vercel, or you can run this locally on your machine and hook it up to something like Apple Shortcuts to log your data (this is how we use it).

## ✨ Features

- GraphQL API for `Dose`, `Substance`, and `ApiKey` entities ⚙️
- Web UI scaffold to create, edit, and list API keys 🗝️
- Prisma ORM with SQLite (simple local development) 🗄️
- Optional Memcached-backed cache (via `memjs`) 🚀
- Modern UI using Tailwind CSS and daisyUI 🎨

## 🧰 Stack

- CedarJS (API, Web, Router, Forms)
- Prisma (SQLite by default)
- React 18 + Vite
- Tailwind CSS 3 + daisyUI 4
- Memcached (optional cache)

## 🛠️ Prerequisites

- Node.js 24.x
- Yarn 4.x (Corepack recommended)

## ⚡ Quick Start

1. Install dependencies:

```bash
yarn install
```

1. Set up the database (SQLite) and generate Prisma client (runs seeds and prints admin credentials):

```bash
yarn cedar prisma migrate dev
# Alternatively, for quick prototyping:
yarn cedar prisma db push
```

1. Start the development servers (API + Web):

```bash
yarn cedar dev
```

Open the app at <http://localhost:8910>. The GraphQL server runs on <http://localhost:8911>.

## 🔑 Environment Variables

Create a `.env` file at the project root (or use your preferred env management). Common variables:

- `DATABASE_URL`: Prisma connection string. Default for SQLite: `file:./api/db/dev.db`
- `CACHE_HOST`: Optional Memcached host, e.g. `localhost:11211` (or `memcached:11211` when using Docker Compose)
- `NODE_ENV`: `development`, `test`, or `production`
- `DEMO_MODE`: Set to `1` to enable demo mode on the API (seeds a demo user) and nightly-reset messaging. Default: unset/`0`.
- `REDWOOD_ENV_DEMO_MODE`: Set to `1` to surface demo mode in the web UI (floating banner). Default: unset/`0`.
- `COPY_SCRIPTS`: Optional; when `1`, copies scripts into the image for `cedar exec`. Independently, if `DEMO_MODE=1`, `seed.ts` is copied to the image to ensure demo seeding is available at runtime.
- `DEMO_MODE`:

## 🛡️ Authentication & Access

- GraphQL uses Cedar dbAuth with session cookies. All operations are protected by `@requireAuth`; user/admin role checks happen in service logic.
- Database seeds create/update an Admin user using `ADMIN_EMAIL` (default `admin@dosebot.local`) and a generated password printed during seeding.
- REST endpoints require API keys via `Authorization: Bearer <API_KEY>`. Manage keys through GraphQL (`createApiKey` returns the plain key once). See [docs/api.md](docs/api.md) for endpoints.

## 🗃️ Database

This project ships with SQLite for simplicity. The Prisma schema lives at `api/db/schema.prisma`.

- Run migrations: `yarn cedar prisma migrate dev`
- Push changes (no migration): `yarn cedar prisma db push`

## 🚀 Optional Caching

If `CACHE_HOST` is set, the API will attempt to connect to Memcached using `memjs`. In local development you can omit this and caching will fall back to in-memory.

## 🐳 Docker Compose

For local development, you can spin up Memcached and optionally run the app inside a container. A `docker-compose.yml` is included.

### ♻️ Start Memcached only

```bash
docker compose up -d memcached

# Then run the app locally with CACHE_HOST pointing at Memcached
export CACHE_HOST=localhost:11211
yarn cedar dev
```

### ▶️ Run the app in Docker (dev mode)

```bash
docker compose up
```

This starts:

- `memcached` on port 11211
- `app` using Node 24, running `yarn cedar dev`, exposing ports 8910 (web) and 8911 (api)

Note: The app service mounts the workspace directory, so changes on your host are reflected in the container. Prisma uses the SQLite file in the repo.

### 🏗️ Build Docker image

Include helper scripts for `cedar exec` during the image build by toggling `COPY_SCRIPTS` (default `0`) and optionally adjusting `SCRIPT_EXCLUDES` (default `buildImage.ts`). Example:

```bash
docker build \
  --build-arg COPY_SCRIPTS=1 \
  --build-arg SCRIPT_EXCLUDES="buildImage.ts" \
  -t dosebot .
```

## 🏷️ Versioning

- Current release: 1.0.0
- Tag releases with `git tag v1.0.0 && git push origin v1.0.0` to align git tags with package versions.

## ✅ Testing

Jest configs exist for both `api` and `web`. You can run tests with:

```bash
yarn cedar test
```

## 📄 License

DoseBot is open-source software licensed under the MIT License. See `LICENSE` for details.
