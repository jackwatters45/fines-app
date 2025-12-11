import { Context, Data, Effect, Layer } from 'effect';

export class KVError extends Data.TaggedError('KVError')<{
  cause: unknown;
  message: string;
}> {}

const make = (kv: KVNamespace) => ({
  get: Effect.fn('KV.get')(function* (key: string) {
    return yield* Effect.tryPromise(() => kv.get(key)).pipe(
      Effect.tapError(Effect.logError),
      Effect.mapError(
        (cause) => new KVError({ message: `Failed to get key: ${key}`, cause })
      )
    );
  }),

  set: Effect.fn('KV.set')(function* (
    key: string,
    value: string,
    options?: KVNamespacePutOptions
  ) {
    return yield* Effect.tryPromise(() => kv.put(key, value, options)).pipe(
      Effect.mapError(
        (cause) => new KVError({ message: `Failed to set key: ${key}`, cause })
      ),
      Effect.asVoid
    );
  }),

  delete: Effect.fn('KV.delete')(function* (key: string) {
    return yield* Effect.tryPromise(() => kv.delete(key)).pipe(
      Effect.mapError(
        (cause) =>
          new KVError({
            message: `Failed to delete key: ${key}`,
            cause,
          })
      ),
      Effect.asVoid
    );
  }),

  list: Effect.fn('KV.list')(function* (options?: KVNamespaceListOptions) {
    return yield* Effect.tryPromise(() => kv.list(options)).pipe(
      Effect.mapError(
        (cause) => new KVError({ message: 'Failed to list keys', cause })
      )
    );
  }),
});

export class KV extends Context.Tag('@fines-app/KV')<
  KV,
  ReturnType<typeof make>
>() {
  /** Create a KV layer from a Cloudflare KVNamespace binding */
  static layer = (kv: KVNamespace) => Layer.succeed(KV, make(kv));
}
