# Fines App - Planning Document

## Overview

A web application for tracking player fines on a men's lacrosse team. Fines accumulate throughout the season and fund an end-of-season team trip. Players are expected to pay weekly; unpaid fines can double based on configurable rules.

**Key Decision:** Multi-tenant via Better Auth Organizations - each team is an "organization" so this can scale to multiple teams.

## User Roles

### Admin (Organization Owner/Admin)
- Full CRUD on team members (players)
- Issue fines to any player
- Approve/reject fine suggestions from players
- Mark fines as paid
- Configure fine rules (doubling, presets)
- View all data and reports

### Player (Organization Member)
- View all fines (full transparency)
- View team leaderboard
- Suggest fines for other players (requires admin approval)
- View fine history and audit trail

## Core Features

### MVP (v1)

#### 1. Authentication & Organizations
- Email/password auth via Better Auth
- Organization (team) creation
- Invite players to organization
- Player claims account via invite

#### 2. Player Management
- Add/remove team members
- Player profiles (name, email)
- Active/inactive status
- Running balance (total owed)

#### 3. Fine Management
- Issue fines with:
  - Amount (custom, in dollars)
  - Reason (free text)
  - Date issued
  - Target player
- Fine statuses: `pending` | `paid`
- All fines visible to all players (transparency)
- Audit trail for all changes

#### 4. Fine Presets (per organization)
- Admins can save common fines as presets
- Examples: "Missed practice - $5", "Late - $2"
- Quick-select when issuing fines

#### 5. Payment Tracking (Simple)
- Admin marks fines as paid
- Payment date recorded
- Running balance per player
- Total team fund collected

#### 6. Leaderboard / Dashboard
- Team standings (who owes most)
- Recent fines feed
- Total collected vs outstanding
- Summary stats

#### 7. Audit Trail
- Track all actions (fine created, paid, modified)
- Who did what, when
- Visible to all players

### Backlog (v2+)

- [ ] **Fine Suggestions** - Players suggest fines, admin approves
- [ ] **Voting on Suggestions** - Require X players to "second" a suggestion
- [ ] **Automated Doubling** - Cron job to double unpaid fines weekly
- [ ] **Email Notifications** - Weekly reminders, fine issued alerts
- [ ] **Season Management** - Archive seasons, start fresh
- [ ] **Advanced Payment Tracking** - Partial payments, payment history
- [ ] **Fine Appeals** - Players can contest fines in-app
- [ ] **Export/Reports** - CSV, PDF summaries
- [ ] **React Native App** - Expo mobile version

## Data Model

### Better Auth Tables (managed by Better Auth)
- `user` - Auth users
- `session` - User sessions
- `account` - Auth accounts (credentials)
- `verification` - Email verification tokens
- `organization` - Teams
- `member` - Organization membership (user + org + role)
- `invitation` - Pending invites

### Application Tables

```sql
-- Players in an organization (may or may not have claimed account)
players
- id: text PRIMARY KEY
- organization_id: text NOT NULL (FK organizations)
- user_id: text (nullable - set when user claims account)
- name: text NOT NULL
- email: text
- active: integer NOT NULL DEFAULT 1
- balance: integer NOT NULL DEFAULT 0 (running balance in cents)
- created_at: integer NOT NULL
- updated_at: integer NOT NULL

-- Fine presets per organization
fine_presets
- id: text PRIMARY KEY
- organization_id: text NOT NULL (FK organizations)
- name: text NOT NULL
- amount: integer NOT NULL (in cents)
- description: text
- active: integer NOT NULL DEFAULT 1
- created_at: integer NOT NULL

-- Fines issued to players
fines
- id: text PRIMARY KEY
- organization_id: text NOT NULL (FK organizations)
- player_id: text NOT NULL (FK players)
- amount: integer NOT NULL (in cents)
- reason: text NOT NULL
- status: text NOT NULL DEFAULT 'pending' (pending | paid)
- issued_by_user_id: text NOT NULL (FK users)
- issued_at: integer NOT NULL
- paid_at: integer (nullable)
- created_at: integer NOT NULL
- updated_at: integer NOT NULL

-- Audit log for all actions
audit_logs
- id: text PRIMARY KEY
- organization_id: text NOT NULL (FK organizations)
- entity_type: text NOT NULL (player | fine | preset)
- entity_id: text NOT NULL
- action: text NOT NULL (created | updated | deleted | paid)
- actor_user_id: text NOT NULL (FK users)
- changes: text (JSON string of what changed)
- created_at: integer NOT NULL

-- Fine suggestions (v2)
fine_suggestions
- id: text PRIMARY KEY
- organization_id: text NOT NULL
- target_player_id: text NOT NULL
- suggested_by_player_id: text NOT NULL
- amount: integer NOT NULL
- reason: text NOT NULL
- status: text NOT NULL DEFAULT 'pending' (pending | approved | rejected)
- reviewed_by_user_id: text (nullable)
- reviewed_at: integer (nullable)
- created_at: integer NOT NULL

-- Fine rules configuration (v2)
fine_rules
- id: text PRIMARY KEY
- organization_id: text NOT NULL
- rule_type: text NOT NULL (weekly_double | grace_period | max_cap)
- config: text NOT NULL (JSON)
- active: integer NOT NULL DEFAULT 1
- created_at: integer NOT NULL
```

## Pages / Routes

### Public
- `/login` - Sign in
- `/signup` - Create account
- `/invite/:code` - Accept organization invite

### Authenticated (any role)
- `/` - Dashboard (redirect based on context)
- `/org/:orgId` - Organization dashboard / leaderboard
- `/org/:orgId/fines` - All fines list
- `/org/:orgId/players` - Team roster
- `/org/:orgId/players/:playerId` - Player detail + their fines

### Admin Only
- `/org/:orgId/admin` - Admin dashboard
- `/org/:orgId/admin/players/new` - Add player
- `/org/:orgId/admin/fines/new` - Issue fine
- `/org/:orgId/admin/presets` - Manage fine presets
- `/org/:orgId/admin/suggestions` - Review suggestions (v2)
- `/org/:orgId/admin/settings` - Org settings

## Tech Stack

- **Frontend**: TanStack Start (React 19), Tailwind v4
- **Backend**: Cloudflare Workers (via TanStack Start server functions)
- **Database**: Cloudflare D1 (SQLite) via Kysely
- **Auth**: Better Auth with Organizations plugin
- **Infrastructure**: Alchemy
- **Hosting**: Cloudflare

## UI/UX Notes

- **Mobile-first design** - Players will primarily use phones
- **Simple, clean interface** - Not overly designed
- **Leaderboard prominent** - Gamification / shame factor
- **Quick actions** - Easy to issue fines, mark paid
- **Real-time feel** - Fast updates (can add websockets later)

## Development Phases

### Phase 1: Foundation ✅
- [x] Project setup (Alchemy, TanStack Start, Tailwind)
- [x] Database setup (Kysely, D1)
- [ ] Better Auth setup with Organizations
- [ ] Basic layout/navigation

### Phase 2: Core Data
- [ ] Player CRUD
- [ ] Fine CRUD
- [ ] Fine presets CRUD
- [ ] Audit logging

### Phase 3: Views
- [ ] Dashboard / Leaderboard
- [ ] Fines list (filterable)
- [ ] Player detail view
- [ ] Summary stats

### Phase 4: Polish
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states

### Phase 5: v2 Features
- [ ] Fine suggestions
- [ ] Automated doubling
- [ ] Notifications
- [ ] Season management

## Decisions Made

| Topic | Decision | Notes |
|-------|----------|-------|
| Payment method | Admin marks as paid | No payment integration |
| Fine visibility | All players see all fines | Full transparency |
| Fine suggestions | Admin approval only | Voting backlogged |
| Notifications | None for MVP | Backlogged |
| Audit trail | Yes, visible to all | Important for transparency |
| Payment tracking | Simple running balance | Advanced tracking backlogged |
| Seasons | Single running log for MVP | Season mgmt backlogged |
| Fine presets | Per-organization | Admins configure their own |
| Appeals | In-person for now | In-app appeals backlogged |
| Leaderboard | Yes, prominent | Gamification element |
| Export | No, summary page instead | Export backlogged |
| Mobile | Responsive web for MVP | React Native backlogged |
