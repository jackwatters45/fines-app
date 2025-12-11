import { app } from '../alchemy.run';

export const stage = app.stage;

export const prodStage = 'prod';
export const devStage = 'dev';

export const isPermanentStage = [prodStage, devStage].includes(stage);

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
export const resourceName = (name: string) =>
  `${app.name}-${stage}-${name}` as const;
