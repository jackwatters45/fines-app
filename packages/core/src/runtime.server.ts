import { Effect, Layer } from "effect";
import { makeDatabaseLayer } from "./drizzle/service";

export type CloudflareBindings = {
  DB: D1Database;
  KV: KVNamespace;
};

export const makeServerLayers = (bindings: CloudflareBindings) => {
  const DatabaseLayer = makeDatabaseLayer(bindings.DB);

  return Layer.mergeAll(DatabaseLayer);
};

export const runWithBindings = <A, E>(
  bindings: CloudflareBindings,
  effect: Effect.Effect<A, E, Layer.Layer.Success<ReturnType<typeof makeServerLayers>>>
) => {
  const layers = makeServerLayers(bindings);
  return Effect.runPromise(Effect.provide(effect, layers));
};
