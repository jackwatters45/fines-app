import { D1Client } from '@effect/sql-d1';
import * as SqliteDrizzle from '@effect/sql-drizzle/Sqlite';
import { Layer } from 'effect';

const D1Live = (db: D1Database) => D1Client.layer({ db });

const DrizzleLive = SqliteDrizzle.layer;

export const makeDatabaseLayer = (db: D1Database) =>
  Layer.provideMerge(DrizzleLive, D1Live(db));
