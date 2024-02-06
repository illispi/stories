import { Elysia } from "elysia";
import { derive } from "./derive";

export const testRoute = new Elysia({ prefix: "/test" }).get(
  "",
  async () => "text"
).use(derive);