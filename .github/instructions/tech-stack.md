---
description: Tech stack and development guidelines for DoseBot
alwaysApply: true
applyTo: "**"
version: 1.0.0
---

# DoseBot Tech Stack & Development Guidelines

## Core Framework & Language

- **Cedar.js v2.1.0**: Full-stack React/Node.js framework with built-in GraphQL, routing, and scaffolding
- **Node.js**: v24.x (see package.json engines)
- **Yarn**: v4.12.0 (workspace monorepo structure)
- **TypeScript**: Type-safe code across API and web

## Backend Stack

- **GraphQL/Apollo**: API query language and execution
- **Prisma ORM v6.19.1**: Database ORM with migrations and schema management
- **SQLite**: Development database (located at `.redwood/test.db`)
- **Express**: Web server (via Cedar)

## Frontend Stack

- **React 18+**: UI library with hooks
- **TypeScript**: Type definitions for components and data
- **Vite**: Build tool and dev server (port 18911)
- **TailwindCSS 3**: Utility-first CSS framework
- **DaisyUI 4.12.24**: Component library on top of Tailwind (see [daisyui.instructions.md](./daisyui.instructions.md))

## Testing & Quality

- **Jest**: Unit and component testing framework
- **@cedarjs/testing**: Cedar-specific test utilities and custom render
- **Prettier**: Code formatting with Prisma and Tailwind plugins
- **ESLint**: Linting (config: eslint.config.mjs)

## Project Structure

```
DoseBot/
├── api/                    # Backend (Node.js + GraphQL)
│   ├── db/
│   │   ├── schema.prisma  # Prisma data model
│   │   └── migrations/    # Database migrations
│   ├── src/
│   │   ├── graphql/       # GraphQL SDL definitions
│   │   ├── services/      # Business logic & resolvers
│   │   ├── functions/     # Lambda/handler functions
│   │   ├── lib/           # Utility functions (slug.ts, auth.ts, etc.)
│   │   └── directives/    # GraphQL directives (@requireAuth, @skipAuth)
│   └── prisma.config.cjs
├── web/                    # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── pages/         # Route pages (auto-imported)
│   │   ├── components/    # React components
│   │   ├── layouts/       # Layout wrappers (MainLayout, ItemViewLayout)
│   │   ├── contexts/      # React contexts (ItemViewContext)
│   │   ├── lib/           # Utilities (formatters, hooks)
│   │   ├── App.tsx        # Root component
│   │   ├── Routes.tsx     # Route definitions
│   │   └── index.css      # Global styles with @import "tailwindcss"
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── jest.config.js
├── package.json           # Root workspace config
├── redwood.toml           # Cedar configuration
└── .github/instructions/  # Development guidelines
```

## Key Development Commands

```bash
# Start dev server (watches API & web, runs on localhost:18911)
yarn cedar dev

# Generate types from GraphQL schema
yarn cedar g types

# Generate scaffold components for CRUD
yarn cedar g scaffold <Resource>

# Generate individual components/pages/services
yarn cedar g component <Name>
yarn cedar g page <Name>
yarn cedar g service <Name>

# Run tests
yarn cedar test --passWithNoTests

# Format code
yarn prettier --write .

# Lint
yarn eslint .
```

## Important Patterns & Conventions

### GraphQL & Prisma

- Schema changes in `api/db/schema.prisma` require migrations: `yarn prisma migrate dev`
- SDL files in `api/src/graphql/*.sdl.ts` define types and queries/mutations
- Services in `api/src/services/` contain business logic and resolver implementations
- Use `@requireAuth` directive on protected queries/mutations
- Use `@skipAuth` for public endpoints

### React Components & Type Safety

- Always type component props: `interface ComponentProps { ... }`
- Use `NonNullable<>` for GraphQL types that are guaranteed to exist
- Cells (data-fetching wrappers) export QUERY, Loading, Empty, Failure, Success
- Use `useItemView()` hook to access substance/dose from ItemViewContext (available in ItemViewLayout routes)

### Routing & Navigation

- Routes use slug-based hierarchy: `/substances/{slug}` and `/substances/{slug}/doses/{id}`
- Pages auto-import from `src/pages/` following structure naming convention
- Use Cedar's `routes.<name>({params})` for type-safe navigation
- ItemViewLayout provides breadcrumb context for detail views

### Styling

- Use **only** DaisyUI class names or Tailwind CSS utility classes
- Do NOT use rw-* Redwood classes (these are deprecated in favor of DaisyUI)
- DaisyUI components: btn, card, table, alert, badge, form-control, etc.
- See [daisyui.instructions.md](./daisyui.instructions.md) for full guidelines

### Context & State Management

- ItemViewProvider (in ItemViewLayout) exposes:
  - `substance`: Current substance being viewed
  - `dose`: Current dose being viewed
  - `currentPageTitle`: Page suffix for breadcrumbs ("Edit", "New Dose", etc.)
  - Setters: `setSubstance()`, `setDose()`, `setCurrentPageTitle()`
- Use `useItemView()` hook in any component under ItemViewLayout

### Utility Functions

- **formatters.ts**: `timeTag()`, `truncate()`, `formatDoseDate()`, `formatEnum()`
- **slug.ts**: `slugify()` - converts strings to URL-friendly format
- **auth.ts**: Authentication utilities
- **cache.ts**: Caching helpers

## Commit Message Guidelines

### Format with Emoji & Type Tags

Commit messages should use descriptive emoji to indicate the type of work. When a commit contains **multiple different types** (feat, chore, bugfix, hotfix, etc.), **split them into separate lines with one line between** with their respective descriptions.

### Emoji Reference

- 🎨 `style` - Code formatting, styling changes
- ✨ `feat` - New feature or functionality
- 🐛 `fix` - Bug fix
- 🚨 `hotfix` - Critical production fix
- ♻️ `refactor` - Code refactoring without behavior change
- 🧹 `chore` - Maintenance, dependencies, build config
- 📚 `docs` - Documentation updates
- ✅ `test` - Test additions or fixes
- 🚀 `perf` - Performance improvements
- 🔒 `security` - Security fixes

### Single Type Commit

```
✨ feat: Add slug field to Substance model for hierarchical routing

- Create migration to add unique slug field
- Update Substance service to auto-generate slugs
- Add slugify utility function
```

### Multiple Type Commit (Split by Type)

```
✨ feat: Add currentPageTitle support to breadcrumbs
♻️ refactor: Extract ItemViewContext from ItemViewLayout
✅ test: Update Breadcrumbs component test to use provider
```

### Best Practices

- Keep individual descriptions short but informative (1 line each)
- Use imperative mood: "add", "fix", "refactor", not "added", "fixed", "refactored"
- Reference related issues when applicable
- For multi-line commits, keep the main message under 50 characters, details under 72
- Use appropriate semantic HTML tags throughout the codebase, avoid using div for everything

## Testing Strategy

- Unit tests for utilities and services
- Component tests for React components (test rendering and user interactions)
- Cell tests for data-fetching components
- Use Cedar's custom render for components that need router/GraphQL context
- Run `yarn cedar test --passWithNoTests` to execute test suite

## Error Handling

- Use DaisyUI alert components for error display: `<div className="alert alert-error">`
- GraphQL errors surface in `Failure` cell state
- Type errors from context hooks (useItemView) should be caught or wrapped in try-catch for optional usage

## Performance Considerations

- Use memoization for expensive computations
- Leverage Prisma's relation loading to avoid N+1 queries
- Use GraphQL query fragments for reusable field selections
- Cache formatter results when appropriate

## Security

- Always use `@requireAuth` directive on protected mutations/queries
- Validate and sanitize user input in services
- Hash sensitive data (API keys use `hash.ts` utility)
- Never expose database IDs directly; use slugs or opaque identifiers when possible
