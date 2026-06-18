export const ENV = {
  appId: process.env.VITE_APP_ID ?? "rebon-standalone",
  cookieSecret: process.env.JWT_SECRET ?? "fallback-secret-for-dev", 
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT ?? "",
  isProduction: process.env.NODE_ENV === "production",
};

