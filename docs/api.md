# DoseBot API Reference (0.5.1)

## Overview

DoseBot exposes both GraphQL and REST interfaces over the same API server (default: <http://localhost:8911>). Authentication is required for all routes.

- GraphQL: session-based (dbAuth cookie). Default entry at `/graphql`.
- REST: API key-based. Functions live at the root (e.g., `/substances`).
- Responses: REST handlers consistently wrap JSON as `{ success: boolean, data?: T, error?: string }` and may include `errors` for validation or `stack` in development.

### Reverse proxy / path prefix

In deployment, the API is typically routed through Traefik with labels that mount it at `/api`, while internally it still points to the default Cedar functions root. You can keep using Traefik or any reverse proxy of your choice—just ensure requests to your chosen prefix are forwarded to the API server on port 8911.

## Authentication

### Session (GraphQL)

- Uses Cedar dbAuth with email/password.
- Seed creates/updates an Admin user using `ADMIN_EMAIL` (default `admin@dosebot.local`) with a generated password printed during `yarn cedar prisma db seed` or first `yarn cedar prisma migrate`.

### API Keys (REST)

- Provide `Authorization: Bearer <API_KEY>` (or just the key) on every REST request.
- Create and manage keys via GraphQL mutations (`createApiKey`, `updateApiKey`, `deleteApiKey`). `createApiKey` returns the plain key only once; store it safely.
- Keys can be enabled/disabled and optionally time-bound (`validUntil`).

## Base URLs

- Local development (no proxy):
	- API server: `http://localhost:8911`
	- GraphQL endpoint: `http://localhost:8911/graphql`
	- REST endpoints: `http://localhost:8911/<resource>` (see below)

- Deployed with Traefik (path prefix `/api` via labels):
	- API server (through proxy): `https://<your-host>/api`
	- GraphQL endpoint: `https://<your-host>/api/graphql`
	- REST endpoints: `https://<your-host>/api/<resource>` (see below)

If you choose a different reverse proxy or prefix, adjust the URLs accordingly; the internal app continues to serve from the functions root.

## REST Endpoints

All endpoints require a valid API key. Content-Type for writes: `application/json`.

### Substances

- `GET /substances` — List substances. Query: `includeDoses=true` to embed doses.
- `POST /substances` — Create substance. Body: `{ name: string, description?: string, slug?: string }`. Slug auto-generated if omitted; conflicts yield 409.
- `GET /substance/{idOrSlug}` — Fetch single substance (matches ID then slug). Includes ordered doses.
- `PUT /substance/{idOrSlug}` — Update `name`, `description`, or `slug`. Returns substance with doses.
- `DELETE /substance/{idOrSlug}` — Delete substance; cascades doses. Returns 204.

### Doses

- `GET /doses` — List doses. Optional filters: `substanceId`, `slug` (substance slug). Includes related `substance`.
- `POST /doses` — Create dose. Body: `{ amount: number, unit: "MG"|"ML"|"G"|"IU", substanceId: string }`.
- `GET /dose/{id}` — Fetch single dose with `substance`.
- `PUT /dose/{id}` — Update `amount`, `unit`, or `substanceId` (validated). Returns updated dose with `substance`.
- `DELETE /dose/{id}` — Delete dose. Returns 204.

## GraphQL Schema (secured by @requireAuth)

### Types & Enums

- `Substance { id, createdAt, updatedAt, name, description, slug, doses }`
- `Dose { id, createdAt, updatedAt, amount, unit, substanceId, substance }`
- `ApiKey { id, name, createdAt, updatedAt, enabled, validUntil, description }`
- `ApiKeyWithSecret { ...ApiKey, key }` (returned only on create)
- `User { id, email, avatarUrl, role, webAuthnChallenge, createdAt, updatedAt }`
- `UserCredential { id, userId, user, publicKey, transports, counter }`
- `Unit` enum: `MG | ML | G | IU`
- `Role` enum: `Admin | User`

### Queries

- `substances`: `[Substance!]!`
- `substance(id: String!)`: `Substance`
- `substanceBySlug(slug: String!)`: `Substance`
- `doses`: `[Dose!]!`
- `dose(id: String!)`: `Dose`
- `apiKeys`: `[ApiKey!]!`
- `apiKey(id: String!)`: `ApiKey`
- `users`: `[User!]!`
- `user(id: Int!)`: `User`
- `userCredentials`: `[UserCredential!]!`
- `userCredential(id: String!)`: `UserCredential`

### Mutations

- `createSubstance(input: { name!, description })`: `Substance`
- `updateSubstance(id: String!, input: { name, description })`: `Substance`
- `deleteSubstance(id: String!)`: `Substance`
- `createDose(input: { amount!, unit!, substanceId! })`: `Dose`
- `updateDose(id: String!, input: { amount, unit, substanceId })`: `Dose`
- `deleteDose(id: String!)`: `Dose`
- `createApiKey(input: { enabled?, name?, validUntil?, description? })`: `ApiKeyWithSecret`
- `updateApiKey(id: String!, input: { enabled?, name?, validUntil?, description? })`: `ApiKey`
- `deleteApiKey(id: String!)`: `ApiKey`
- `createUser(email!, plainPassword!, role?)`: `User` (admin-only in service logic)
- `resetUserPassword(userId: Int!)`: `String!` (returns new password; admin-only)
- `updateUser(id: Int!, email?, role?)`: `User` (role checks in service)
- `deleteUser(id: Int!)`: `User` (admin-only)
- `createUserCredential(input: { id!, userId!, publicKey!, transports, counter! })`: `UserCredential`
- `updateUserCredential(id: String!, input: { userId?, publicKey?, transports?, counter? })`: `UserCredential`
- `deleteUserCredential(id: String!)`: `UserCredential`

## Error Handling

- REST errors use standard HTTP codes with JSON body `{ success: false, error: string, errors?: object }`.
- 401 returned for missing/invalid API key; 409 for slug conflicts; 404 for missing resources; 405 includes `Allow` header.
- GraphQL errors follow Apollo-style responses with Cedar auth errors for unauthenticated/unauthorized access.

## Versioning

- Current API/package version: **0.5.1**.
