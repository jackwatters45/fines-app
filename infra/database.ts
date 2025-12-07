import { D1Database } from 'alchemy/cloudflare';

export const database = await D1Database('database', {
  name: 'fines-app-db',
  migrationsDir: './packages/core/migrations',
});
