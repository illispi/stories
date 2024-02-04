import { Elysia } from "elysia";

export const testRoute = new Elysia({ prefix: "/test" }).get("", async () => {
  return { object: "test" };
});
