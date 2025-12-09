import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// =============================================================================
// Application Tables
// =============================================================================
// Better Auth manages: user, session, account, verification, organization, member, invitation
// We reference their tables via text foreign keys (Better Auth uses text IDs)

/**
 * Players in an organization (team members)
 * A player may or may not have a linked user account
 */
export const players = sqliteTable(
  'players',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull(),
    userId: text('user_id'), // nullable - set when user claims their player profile
    name: text('name').notNull(),
    email: text('email'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    balance: integer('balance').notNull().default(0), // running balance in cents
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    index('players_org_idx').on(table.organizationId),
    index('players_user_idx').on(table.userId),
  ]
);

/**
 * Fine presets - saved templates for common fines
 */
export const finePresets = sqliteTable(
  'fine_presets',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull(),
    name: text('name').notNull(),
    amount: integer('amount').notNull(), // in cents
    description: text('description'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [index('fine_presets_org_idx').on(table.organizationId)]
);

/**
 * Fines issued to players
 */
export const fines = sqliteTable(
  'fines',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull(),
    playerId: text('player_id')
      .notNull()
      .references(() => players.id),
    amount: integer('amount').notNull(), // in cents
    reason: text('reason').notNull(),
    status: text('status', { enum: ['pending', 'paid'] })
      .notNull()
      .default('pending'),
    issuedByUserId: text('issued_by_user_id').notNull(),
    issuedAt: integer('issued_at', { mode: 'timestamp' }).notNull(),
    paidAt: integer('paid_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    index('fines_org_idx').on(table.organizationId),
    index('fines_player_idx').on(table.playerId),
    index('fines_status_idx').on(table.status),
  ]
);

/**
 * Audit log for tracking all changes
 */
export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull(),
    entityType: text('entity_type', {
      enum: ['player', 'fine', 'preset'],
    }).notNull(),
    entityId: text('entity_id').notNull(),
    action: text('action', {
      enum: ['created', 'updated', 'deleted', 'paid'],
    }).notNull(),
    actorUserId: text('actor_user_id').notNull(),
    changes: text('changes'), // JSON string of what changed
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    index('audit_logs_org_idx').on(table.organizationId),
    index('audit_logs_entity_idx').on(table.entityType, table.entityId),
  ]
);

// =============================================================================
// Types
// =============================================================================

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

export type FinePreset = typeof finePresets.$inferSelect;
export type NewFinePreset = typeof finePresets.$inferInsert;

export type Fine = typeof fines.$inferSelect;
export type NewFine = typeof fines.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
