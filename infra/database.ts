import { D1Database } from 'alchemy/cloudflare';

export const db = await D1Database('db', {
  migrationsDir: './packages/core/migrations',
  adopt: true,
  readReplication: { mode: 'auto' }
});
