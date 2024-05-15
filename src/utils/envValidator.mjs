import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    PSQL_PASSWORD: z.string(),
    PSQL_USERNAME: z.string(),
    DATABASE_URL: z.string(),
    SESSSION_SECRET: z.string(),
    AUTH_SECRET: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NODE_ENV: z.enum(["development", "production"]),
    GITHUB_CLIENT_ID: z.string(),
    AUTH_TRUST_HOST: z.boolean(),
    AUTH_URL: z.string().url(),
    DISCORD_CLIENT_ID: z.string(),
    SITE: z.string().url(),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  // runtimeEnv: {
  //   DATABASE_URL: process.env.DATABASE_URL,
  //   OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
  //   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
  //     process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  // },
});
