# Fines App - Planning Document

## Overview

A web application for tracking player fines on a men's lacrosse team.

**Project Goal:** Experiment with Alchemy + Cloudflare stack. Will eventually merge with existing repo.

## Tech Stack

- **Frontend**: TanStack Start (React 19), Tailwind v4, Effect Atom (state)
- **Backend**: TanStack Start server functions → Effect services
- **Database**: Cloudflare D1 (SQLite) via Drizzle
- **Auth**: Better Auth (organizations schema exists, UI deprioritized)
- **Infrastructure**: Alchemy
- **Hosting**: Cloudflare Workers

> **Note:** Using Effect Atom instead of TanStack Query for frontend state. This diverges from lax-db (which has Atom set up but uses TanStack Query). Goal is to validate Effect Atom in production.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (React)                                       │
│  - Effect Atom for state management                     │
│  - RuntimeAtom.atom() for async data                    │
│  - Minimal UI (functional, not polished)                │
└─────────────────┬───────────────────────────────────────┘
                  │ calls (via atoms)
┌─────────────────▼───────────────────────────────────────┐
│  Server Functions (TanStack Start)                      │
│  - createServerFn() with middleware                     │
│  - RuntimeServer.runPromise() to execute Effect         │
└─────────────────┬───────────────────────────────────────┘
                  │ runs
┌─────────────────▼───────────────────────────────────────┐
│  Effect Services (packages/core)                        │
│  - Service layer: business logic                        │
│  - Repo layer: Drizzle queries                          │
│  - Custom errors: Schema.TaggedError                    │
└─────────────────┬───────────────────────────────────────┘
                  │ queries
┌─────────────────▼───────────────────────────────────────┐
│  Cloudflare D1 (SQLite via Drizzle)                     │
└─────────────────────────────────────────────────────────┘
```

## Effect Patterns (from lax-db)

### Service Structure

```typescript
// player.service.ts
export class PlayerService extends Effect.Service<PlayerService>()(
  'PlayerService',
  {
    effect: Effect.gen(function* () {
      const repo = yield* PlayerRepo;

      return {
        create: (input) => Effect.gen(function* () {
          const validated = yield* Schema.decode(CreatePlayerInput)(input);
          return yield* repo.create(validated);
        }),
      } as const;
    }),
    dependencies: [PlayerRepo.Default],
  }
) {}
```

### Repository Structure

```typescript
// player.repo.ts
export class PlayerRepo extends Effect.Service<PlayerRepo>()(
  'PlayerRepo',
  {
    effect: Effect.gen(function* () {
      const db = yield* DrizzleService;

      return {
        create: (input) => db.insert(players).values(input).returning(),
        list: (orgId) => db.select().from(players).where(eq(players.organizationId, orgId)),
      } as const;
    }),
    dependencies: [DrizzleService.Default],
  }
) {}
```

### Error Structure

```typescript
// player.error.ts
export class PlayerNotFoundError extends Schema.TaggedError<PlayerNotFoundError>(
  'PlayerNotFoundError'
)('PlayerNotFoundError', {
  message: Schema.String,
  playerId: Schema.String,
  code: Schema.optionalWith(Schema.Number, { default: () => 404 }),
}) {}
```

### Server Function Structure

```typescript
// query/players.ts
export const getPlayers = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) =>
    RuntimeServer.runPromise(
      Effect.gen(function* () {
        const playerService = yield* PlayerService;
        return yield* playerService.list(context.orgId);
      })
    )
  );
```

### File Naming Convention

```
packages/core/src/
├── player/
│   ├── player.service.ts    # Business logic
│   ├── player.repo.ts       # Data access
│   ├── player.error.ts      # Custom errors
│   ├── player.schema.ts     # Effect schemas (validation)
│   └── index.ts             # Barrel export
├── fine/
│   ├── fine.service.ts
│   ├── fine.repo.ts
│   ├── fine.error.ts
│   ├── fine.schema.ts
│   └── index.ts
└── runtime.server.ts        # ManagedRuntime with all services

packages/web/src/
├── lib/
│   └── runtime.atom.ts      # RuntimeAtom setup
├── atoms/
│   ├── player.atom.ts       # Player state atoms
│   ├── fine.atom.ts         # Fine state atoms
│   └── leaderboard.atom.ts  # Leaderboard atoms
└── ...
```

## Effect Atom Patterns

### RuntimeAtom Setup

```typescript
// lib/runtime.atom.ts
import { Atom } from '@effect-atom/atom-react';

// Layer for client-side services (if any)
const ClientLayer = Layer.empty;

export const RuntimeAtom = Atom.runtime(ClientLayer);
```

### Data Fetching Atom

```typescript
// atoms/player.atom.ts
import { RuntimeAtom } from '../lib/runtime.atom';
import { getPlayers } from '../query/players';

// Atom that fetches players via server function
export const playersAtom = RuntimeAtom.atom(
  Effect.tryPromise(() => getPlayers())
);

// Usage in component
function PlayerList() {
  const players = useAtomValue(playersAtom);
  // players is Result<Player[], Error>
}
```

### Derived Atoms

```typescript
// atoms/leaderboard.atom.ts
export const leaderboardAtom = atom((get) => {
  const players = get(playersAtom);
  const fines = get(finesAtom);

  // Derive leaderboard from players + fines
  return players.map(p => ({
    ...p,
    totalOwed: fines.filter(f => f.playerId === p.id).reduce(...)
  })).sort((a, b) => b.totalOwed - a.totalOwed);
});
```

## Scope

### In Scope (Experiment MVP)

| Feature         | Description                                   |
| --------------- | --------------------------------------------- |
| **Auth**        | Login/register working E2E                    |
| **Players**     | CRUD (create, list, update, deactivate)       |
| **Fines**       | Issue fine, list fines, mark as paid          |
| **Leaderboard** | Who owes most, total collected vs outstanding |

### Out of Scope (Deprioritized)

- Organizations UI (schema exists, ignore for now)
- Fine presets
- Audit logging
- Layout/navigation polish
- Mobile responsiveness
- Loading/error/empty states polish

## Data Model

Schema already exists in `packages/core/src/drizzle/schema.ts`.

**Using for MVP:**

- `user`, `session`, `account` (Better Auth)
- `players` (team members)
- `fines` (issued fines)

**Exists but deprioritized:**

- `organization`, `member`, `invitation` (orgs)
- `finePresets`, `auditLogs`

## Development Phases

### Phase 1: Foundation ✅

- [x] Project setup (Alchemy, TanStack Start, Tailwind)
- [x] Database setup (Drizzle, D1)
- [x] Better Auth setup
- [x] Schema (players, fines, etc.)

### Phase 2: Effect Infrastructure

- [ ] DrizzleService (D1 integration with Effect)
- [ ] RuntimeServer (ManagedRuntime with layers)
- [ ] RuntimeAtom (Effect Atom for frontend state)
- [ ] Auth middleware for server functions

### Phase 3: Player Domain

- [ ] PlayerRepo (Drizzle queries)
- [ ] PlayerService (business logic)
- [ ] Player errors + schemas
- [ ] Server functions (list, create, update)
- [ ] Simple UI (list + form)

### Phase 4: Fine Domain

- [ ] FineRepo (Drizzle queries)
- [ ] FineService (issue, mark paid, update balance)
- [ ] Fine errors + schemas
- [ ] Server functions
- [ ] Simple UI (list + issue form)

### Phase 5: Leaderboard

- [ ] LeaderboardService (aggregations: totals, rankings)
- [ ] Server function
- [ ] Leaderboard UI (home page)

## Routes (Simplified)

| Route          | Purpose            |
| -------------- | ------------------ |
| `/login`       | Sign in            |
| `/register`    | Create account     |
| `/`            | Leaderboard (home) |
| `/players`     | Player list        |
| `/players/new` | Add player         |
| `/fines`       | Fine list          |
| `/fines/new`   | Issue fine         |

## Success Criteria

1. Can deploy to Cloudflare via Alchemy
2. D1 database operations work (read/write)
3. Effect services run in Workers environment
4. Server functions call Effect services correctly
5. Basic CRUD flows work E2E
