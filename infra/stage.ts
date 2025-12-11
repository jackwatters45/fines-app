import { app } from '../alchemy.run';

export const stage = app.stage;

/**
 * Generates a stage-scoped resource name for Cloudflare resources.
 *
 * @param name - The base name of the resource (e.g., "db", "kv", "storage")
 * @returns A unique resource name in the format `{app}-{stage}-{name}`
 *
 * @example
 * resourceName("db")     // "fines-app-prod-db" or "fines-app-pr-7-db"
 * resourceName("kv")     // "fines-app-jw-kv" (local dev)
 */
export const resourceName = (name: string) => `${app.name}-${stage}-${name}`;
