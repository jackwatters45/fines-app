import { TanStackStart } from 'alchemy/cloudflare';
import { database } from './database';

export const web = await TanStackStart('web', {
  bindings: {
    DB: database,
  },
  cwd: './packages/web',
});
