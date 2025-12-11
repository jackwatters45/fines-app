import { TanStackStart } from 'alchemy/cloudflare';
import { db } from './database';
import { kv } from './kv';
import { storage } from './storage';


export const web = await TanStackStart('web', {
  bindings: {
    DB: db,
    KV: kv,
    STORAGE: storage,
  },
  cwd: './packages/web',
});
