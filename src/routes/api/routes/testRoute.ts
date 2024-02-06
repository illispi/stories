import { Elysia } from "elysia";

export const testRoute = new Elysia({ prefix: "/test" }).get(
  "",
  async () => "text"
);