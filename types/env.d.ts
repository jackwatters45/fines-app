// This file infers types for the cloudflare:workers environment from your Alchemy resources.
// @see https://alchemy.run/concepts/bindings/#type-safe-bindings

import type { web } from '../alchemy.run';

export type CloudflareEnv = typeof web.Env;

declare global {
  type Env = CloudflareEnv;
}

declare module 'cloudflare:workers' {
  namespace Cloudflare {
    export interface Env extends CloudflareEnv {}
  }
  export const env: Env;
}
