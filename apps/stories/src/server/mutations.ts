import { getSession } from "@solid-mediakit/auth";
import { mutation$ } from "@prpc/solid";
import {
  personalQuestionsSchema,
  theirQuestionsSchema,
} from "~/types/zodFromTypes";

import { auth } from "./lucia.js";
import { LuciaError } from "lucia";
import { db } from "./server";
export const postPersonalStats = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    try {
      const session = await auth.validateSession(request$);
      if (session.fresh) {
        // expiration extended
        const sessionCookie = auth.createSessionCookie(session);
        setSessionCookie(session);
        const user = await db
          .selectFrom("User")
          .select("id")
          .where("id", "=", session.user?.id)
          .executeTakeFirstOrThrow();

        if (user?.id) {
          const insertion = await db
            .insertInto("Personal_questions")
            .values({ ...payload, user: user.id, accepted: false, fake: false })
            .execute();

          if (insertion) {
            return "Added succesfully";
          }
        }
      }
    } catch (e) {
      if (e instanceof LuciaError && e.message === `AUTH_INVALID_SESSION_ID`) {
        // invalid session
        deleteSessionCookie();
      }
      // unexpected database errors
    }
  },
  key: "postPersonalStats",
  schema: personalQuestionsSchema,
});
export const postTheirStats = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    const session = await getSession(request$, authOpts);

    if (!session) {
      return "no session found";
    }

    const user = await db
      .selectFrom("User")
      .select("id")
      .where("id", "=", session.user?.id)
      .executeTakeFirstOrThrow();

    if (user?.id) {
      const insertion = await db
        .insertInto("Their_questions")
        .values({ ...payload, user: user.id, accepted: false, fake: false }) //NOTE this TS error should disappear once you migrate down and up again
        .execute();

      if (insertion) {
        return "Added succesfully";
      }
    }
    return "failed to insert";
  },
  key: "postTheirStats",
  schema: theirQuestionsSchema,
});
