import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Schema used by Drizzle Kit for migration generation
// Runtime queries use Kysely with types in ../kysely/types.ts

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const fines = sqliteTable('fines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  paid: integer('paid', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
});
