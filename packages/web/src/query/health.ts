import { createServerFn } from "@tanstack/react-start";

export const ping = createServerFn({ method: "GET" }).handler(async () => ({
  status: "ok" as const,
  timestamp: Date.now(),
}));
