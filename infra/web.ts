import { TanStackStart } from 'alchemy/cloudflare';
import { database } from './database';
import { kv } from './kv';
import { storage } from './storage';

export const web = await TanStackStart('web', {
  bindings: {
    DB: database,
    KV: kv,
    STORAGE: storage,
  },
  cwd: './packages/web',
});
