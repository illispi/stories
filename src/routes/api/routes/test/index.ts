import { Elysia } from "elysia";
import { db } from "../../db";

export const testRoute = new Elysia({ prefix: "/test" }).get("", async () => {
  const articles = await db
    .selectFrom("Articles")
    .select(["link", "description"])
    .where("accepted", "=", true)
    .offset(payload.page * 25)
    .limit(25)
    .execute();

  const count = await db
    .selectFrom("Articles")
    .select((eb) => [eb.fn.countAll("Articles").as("count")])
    .where("accepted", "=", true)
    .executeTakeFirst();

  return { articles, count };
});
