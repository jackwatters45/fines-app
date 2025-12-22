import { Rpc, RpcGroup } from "@effect/rpc";
import { Effect, Schema } from "effect";

const HealthResponse = Schema.Struct({
  status: Schema.Literal("ok"),
  timestamp: Schema.Number,
});

export const HealthContract = {
  ping: {
    success: HealthResponse,
  },
} as const;

export class HealthRpcs extends RpcGroup.make(
  Rpc.make("Ping", {
    success: HealthContract.ping.success,
  }),
) {}

export const HealthHandlers = HealthRpcs.toLayer(
  Effect.gen(function* () {
    return {
      Ping: () =>
        Effect.succeed({
          status: "ok" as const,
          timestamp: Date.now(),
        }),
    };
  }),
);
