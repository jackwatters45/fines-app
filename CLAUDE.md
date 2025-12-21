# Fines App - AI Assistant Context

## Overview

A multi-tenant web application for tracking player fines on sports teams. Each team is an "organization" via Better Auth. Players accumulate fines throughout the season to fund team events.

## Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | TanStack Start (React 19), Tailwind v4  |
| Backend        | Cloudflare Workers (via TanStack Start) |
| Database       | Cloudflare D1 (SQLite) via Drizzle ORM  |
| Auth           | Better Auth (organizations + admin)     |
| Infrastructure | Alchemy (TypeScript IaC)                |
| Patterns       | Effect-TS for error handling            |
| Monorepo       | Bun workspaces + Turborepo              |
| Linting        | oxlint + oxfmt (single quotes)          |
| VCS            | jj (Jujutsu) - NOT git directly         |

## Project Structure

```
├── packages/
│   ├── core/              # Shared logic, schema, auth
│   │   ├── src/
│   │   │   ├── drizzle/   # Schema, DB service
│   │   │   ├── auth.ts    # Better Auth setup
│   │   │   └── error.ts   # Effect error types
│   │   └── migrations/    # Drizzle migrations
│   └── web/               # TanStack Start frontend
│       └── src/
│           ├── routes/    # File-based routing
│           ├── components/
│           ├── lib/       # Auth client, utils
│           └── query/     # TanStack Query hooks
├── alchemy.run.ts         # Infrastructure definition
├── PLANNING.md            # Feature specs & roadmap
└── TODO.md                # Current tasks
```

## Commands

```bash
# Development
bun run dev              # Start dev server (alchemy dev)
bun run check            # Lint (oxlint + oxfmt --check)
bun run fix              # Fix lint issues

# Database
cd packages/core
bun run db:generate      # Generate Drizzle migrations
bun run db:studio        # Open Drizzle Studio

# Deploy
bun run deploy           # Deploy to Cloudflare
bun run destroy          # Tear down infrastructure
```

## Version Control (jj)

This project uses **Jujutsu (jj)** instead of raw git:

```bash
jj status                # Working copy status
jj log                   # View commit history
jj describe -m "msg"     # Set commit message
jj new                   # Create new change
jj bookmark create X     # Create bookmark (like branch)
jj git push -b X         # Push bookmark to remote
```

## Code Conventions

### Formatting

- **Single quotes** everywhere (configured in `.oxfmtrc.json`)
- Run `bun run fix` before committing

### Effect-TS Patterns

- Use `Schema.TaggedError` for typed errors (see `packages/core/src/error.ts`)
- Wrap async operations with `Effect.tryPromise`
- Use `Effect.filterOrFail` for validation

### Auth Patterns

- `createAuth({ db, kv })` returns auth helpers
- `getSession(headers)` - nullable session
- `getSessionOrThrow(headers)` - fails if no session
- Organization helpers for multi-tenant access

### Database

- Drizzle schema in `packages/core/src/drizzle/schema.ts`
- Better Auth tables auto-managed
- Application tables: players, fines, fine_presets, audit_logs

## Environment Variables

```bash
# .env (local dev)
ALCHEMY_PASSWORD=...     # Required for Alchemy state encryption
BETTER_AUTH_SECRET=...   # Auth session signing
```

## Domains

| Stage | Domain                  |
| ----- | ----------------------- |
| prod  | fines.laxdb.io          |
| dev   | dev.fines.laxdb.io      |
| PR    | pr-N.dev.fines.laxdb.io |
