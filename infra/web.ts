import { TanStackStart } from 'alchemy/cloudflare';
import { db } from './database';
import { domain } from './dns';
import { kv } from './kv';
import { storage } from './storage';

export const web = await TanStackStart('web', {
  bindings: {
    DB: db,
    KV: kv,
    STORAGE: storage,
  },
  adopt: true,
  cwd: './packages/web',
  domains: [domain],
});
