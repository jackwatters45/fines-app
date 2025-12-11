import { KVNamespace } from 'alchemy/cloudflare';

export const kv = await KVNamespace('kv');
