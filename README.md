# Fines App

A full-stack application built with TanStack Start, Cloudflare D1, Drizzle ORM, and Better Auth.

## Tech Stack

- **Frontend**: TanStack Start (React 19, Vite)
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle
- **Auth**: Better Auth
- **Infrastructure**: Alchemy (TypeScript IaC for Cloudflare)
- **Styling**: Tailwind CSS v4

## Project Structure

```
├── packages/
│   ├── core/              # Shared logic, Drizzle schema, auth
│   │   ├── src/drizzle/   # Schema and DB helpers
│   │   ├── migrations/    # SQL migrations (auto-generated)
│   │   └── drizzle.config.ts
│   └── web/               # TanStack Start frontend
│       └── src/
│           ├── routes/    # File-based routing
│           └── components/
├── infra/                 # Alchemy infrastructure
│   ├── database.ts        # D1 database
│   └── web.ts             # TanStack Start deployment
└── alchemy.run.ts         # Main infrastructure entrypoint
```

## Getting Started

```bash
# Install dependencies
bun install

# Login to Cloudflare
bun alchemy login

# Generate migrations (after schema changes)
cd packages/core && bun run db:generate

# Development
bun run dev

# Deploy
bun run deploy
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run deploy` | Deploy to Cloudflare |
| `bun run destroy` | Tear down infrastructure |
| `bun run check` | Run linting |
| `bun run fix` | Fix linting issues |

### Core Package

| Command | Description |
|---------|-------------|
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:studio` | Open Drizzle Studio |
