import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from './types';

export type * from './types';
export type Db = Kysely<Database>;

export function createDb(d1: D1Database) {
  return new Kysely<Database>({
    dialect: new D1Dialect({ database: d1 }),
  });
}
