import { getSession } from "@solid-auth/base";
import { mutation$ } from "@prpc/solid";
import { authOpts } from "~/routes/api/auth/[...solidauth]";
import {
  personalQuestionsSchema,
  theirQuestionsSchema,
} from "~/types/zodFromTypes";
import { db } from "./server";
export const postPersonalStats = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    const session = await getSession(request$, authOpts);

    if (!session) {
      return "no session found";
    }

    const user = await db
      .selectFrom("User")
      .select("id")
      .where("id", "=", session.user.id)
      .executeTakeFirstOrThrow();

    if (user?.id) {
      const insertion = await db
        .insertInto("Personal_questions")
        .values({ ...payload, user: user.id })
        .execute();

      if (insertion) {
        return "Added succesfully";
      }
    }
    return "failed to insert";
  },
  key: "postPersonalStats",
  schema: personalQuestionsSchema,
});
export const postTheriStats = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    const session = await getSession(request$, authOpts);

    if (!session) {
      return "no session found";
    }

    const user = await db
      .selectFrom("User")
      .select("id")
      .where("id", "=", session.user.id)
      .executeTakeFirstOrThrow();

    if (user?.id) {
      const insertion = await db
        .insertInto("Their_questions")
        .values({ ...payload, user: user.id }) //NOTE this TS error should disappear once you migrate down and up again
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
