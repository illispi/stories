import { query$ } from "@prpc/solid";
import { ServerError } from "solid-start";
import { auth } from "~/auth/lucia";
import { db } from "../server";

export const getPersonal = query$({
  queryFn: async ({ request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();

    if (!session) {
      throw new ServerError("Session not found");
    }

    const userDb = await db
      .selectFrom("auth_user")
      .select(["id", "role"])
      .where("id", "=", session.user?.userId)
      .executeTakeFirstOrThrow();

    if (userDb.id && userDb.role) {
      const unSafe = await db
        .selectFrom("Personal_questions")
        .selectAll()
        .where("user", "=", userDb.id)
        .executeTakeFirst();

      if (!unSafe) {
        return "No personal poll data found";
      }

      const { user, created_at, id, ...safe } = unSafe;

      return safe;
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "getPersonal",
});
export const getTheirs = query$({
  queryFn: async ({ request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();

    if (!session) {
      throw new ServerError("Session not found");
    }

    const userDb = await db
      .selectFrom("auth_user")
      .select(["id", "role"])
      .where("id", "=", session.user?.userId)
      .executeTakeFirstOrThrow();

    if (userDb.id && userDb.role) {
      const unSafe = await db
        .selectFrom("Their_questions")
        .selectAll()
        .where("user", "=", userDb.id)
        .execute();

      const safe = unSafe.map((unSafeEl: (typeof unSafe)[0]) => {
        const { user, created_at, ...safeTemp } = unSafeEl;
        return safeTemp;
      });

      return safe;
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "getTheirs",
});
