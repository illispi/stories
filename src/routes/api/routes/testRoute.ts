import { Elysia } from "elysia";
import { sessionDer } from "./session";

export const testRoute = new Elysia({ prefix: "/test" })
  .get("", async () => "text")
  .use(sessionDer);
