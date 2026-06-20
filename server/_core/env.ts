/**
 * @fileoverview Centralised environment configuration for the ReBon server.
 *
 * All environment variables are read here once. Required variables in
 * production are validated on first import so a misconfiguration fails fast
 * at startup rather than producing cryptic runtime errors later.
 *
 * Usage:
 *   import { ENV } from '../_core/env';
 *   const url = ENV.databaseUrl;
 */

/** Typed environment configuration object. */
export const ENV = {
  /** Application identifier; scoped to JWT tokens. */
  appId: process.env.VITE_APP_ID ?? "rebon-standalone",
  /** Secret used to sign session JWTs. Must be at least 32 chars in production. */
  cookieSecret: process.env.JWT_SECRET ?? "fallback-secret-for-dev",
  /** PostgreSQL connection string (Neon / any postgres-compatible). */
  databaseUrl: process.env.DATABASE_URL ?? "",
  /** Optional OAuth server URL for federated login flows. */
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  /** OpenID of the app owner (admin account). */
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  /** Internal Forge API base URL for LLM proxy calls. */
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  /** Internal Forge API key. */
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  /** Firebase service account JSON string (base64-encoded or raw JSON). */
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT ?? "",
  /** True when running in a production Node.js environment. */
  isProduction: process.env.NODE_ENV === "production",
} as const;

/**
 * Validates that all required production environment variables are present.
 * Throws a descriptive error listing every missing variable so operators
 * can fix the configuration in one go.
 *
 * Called automatically on module load in production.
 */
function validateProductionEnv(): void {
  if (!ENV.isProduction) return;

  const required: Array<{ key: keyof typeof ENV; envVar: string }> = [
    { key: "cookieSecret", envVar: "JWT_SECRET" },
  ];

  const missing = required.filter(({ key }) => !ENV[key]);
  if (missing.length > 0) {
    const vars = missing.map(({ envVar }) => `  • ${envVar}`).join("\n");
    throw new Error(
      `[ReBon] Missing required environment variables:\n${vars}\nSet them before starting the server.`
    );
  }

  if (ENV.cookieSecret === "fallback-secret-for-dev") {
    throw new Error(
      "[ReBon] JWT_SECRET must not use the development fallback in production. Set a secure random secret (≥32 chars)."
    );
  }
}

validateProductionEnv();
