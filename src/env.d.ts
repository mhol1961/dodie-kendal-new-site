/// <reference path="../.astro/types.d.ts" />

// Worker vars, secrets and bindings (wrangler.toml [vars] + [[d1_databases]],
// dashboard secrets, .dev.vars locally). Callers cast to the shape they read.
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
