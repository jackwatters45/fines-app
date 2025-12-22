import { D1Client } from "@effect/sql-d1";
import * as SqliteDrizzle from "@effect/sql-drizzle/Sqlite";
import { Layer } from "effect";

export { SqliteDrizzle };

export const makeD1Layer = (db: D1Database) => D1Client.layer({ db });

export const DrizzleLive = SqliteDrizzle.layer;

export const makeDatabaseLayer = (db: D1Database) =>
  Layer.provideMerge(DrizzleLive, makeD1Layer(db));
