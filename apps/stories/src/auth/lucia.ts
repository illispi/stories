// src/auth/lucia.ts
import { lucia } from "lucia";
import { web } from "lucia/middleware";
import { pg } from "@lucia-auth/adapter-postgresql";
import { pool } from "~/server/server";

import { github } from "@lucia-auth/oauth/providers";
import { serverEnv } from "~/env/server";

// expect error
export const auth = lucia({
  adapter: pg(pool, {
    user: "auth_user",
    key: "user_key",
    session: "user_session",
  }),
  env: process.env.NODE_ENV === "production" ? "PROD" : "DEV",
  middleware: web(),
  sessionCookie: {
    expires: false,
  },
});

export const githubAuth = github(auth, {
  clientId: serverEnv.GITHUB_CLIENT_ID,
  clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
});

export type Auth = typeof auth;
