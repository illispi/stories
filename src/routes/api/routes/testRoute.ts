import { Elysia } from "elysia";
import { db } from "../db";

export const testRoute = new Elysia({ prefix: "/test" }).get("", async () => {
  return "work";
});
