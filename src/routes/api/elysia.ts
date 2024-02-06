import { Elysia } from "elysia";
import { verifyRequestOrigin } from "lucia";

import type { User, Session } from "lucia";
import { lucia } from "~/lib/auth/lucia";
import { authRoute } from "./routes/auth";
import { testRoute } from "./routes/testRoute";
import { derive } from "./routes/derive";

export const app = new Elysia({ prefix: "/api" })
  .use(derive)
  .use(authRoute)
  .use(testRoute)
  .compile();

export type App = typeof app;
