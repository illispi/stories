import { Elysia } from "elysia";
import { sessionDer } from "../session";
import { db } from "../../db";

export const userQueriesRoute = new Elysia({ prefix: "/user/data/get" })
  .use(sessionDer)
  .get("/personal", async (context) => {
    const unSafe = await db
      .selectFrom("Personal_questions")
      .selectAll()
      .where("user", "=", context.user?.id)
      .executeTakeFirst();

    if (!unSafe) {
      return null;
    }

    const { user, created_at, id, ...safe } = unSafe;

    return safe;
  })
  .get("/theirs", async (context) => {
    const unSafe = await db
      .selectFrom("Their_questions")
      .selectAll()
      .where("user", "=", context.user?.id)
      .execute();

    if (!unSafe.length) {
      return null;
    }

    const safe = unSafe.map((unSafeEl: (typeof unSafe)[0]) => {
      const { user, id, created_at, ...safeTemp } = unSafeEl;
      return safeTemp;
    });

    return safe;
  })
  .get("/articles", async (context) => {
    const unSafe = await db
      .selectFrom("Articles")
      .selectAll()
      .where("user", "=", context.user?.id)
      .execute();

    if (!unSafe.length) {
      return null;
    }

    const safe = unSafe.map((unSafeEl: (typeof unSafe)[0]) => {
      const { user, created_at, ...safeTemp } = unSafeEl;
      return safeTemp;
    });

    return safe;
  });
