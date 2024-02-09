import { Elysia } from "elysia";
import { verifyRequestOrigin } from "lucia";

import type { User, Session } from "lucia";
import { lucia } from "~/lib/auth/lucia";
import { authRoute } from "./routes/auth";
import { testRoute } from "./routes/testRoute";
import { derive } from "./routes/derive";
import { ConfigEnv } from "vinxi/dist/types/lib/vite-dev";

interface ContextUser {
  user: User | null;
  session: Session | null;
}

export const app = new Elysia({ prefix: "/api" })
  .use(authRoute)
  .use(testRoute)
  .compile();

export type App = typeof app;

// declare module "elysia" {
//   interface Context {
//     user: User | null;
//     session: Session | null;
//   }
// }
