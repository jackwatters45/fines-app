import { betterAuth } from 'better-auth';
import type { Db } from './kysely';

export function createAuth(db: Db) {
  return betterAuth({
    // Better Auth uses Kysely internally; pass the Kysely instance directly
    database: db,
    emailAndPassword: {
      enabled: true,
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
