import { mutation$ } from "@prpc/solid";
import { z } from "zod";
import { isServer } from "solid-js/web";
import { personalQuestionsSchema } from "~/types/zodFromTypes";
import { getSession } from "@auth/solid-start";
import { authOpts } from "~/routes/api/auth/[...solidauth]";
import { db } from "./server";

export const postPersonalStats = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    const session = await getSession(request$, authOpts);

    if (!session) {
      return "no session found";
    }

    const user = await db
      .selectFrom("user")
      .select("id")
      .where("name", "=", session.user?.name)
      .executeTakeFirstOrThrow();

    if (user?.id) {
      const insertion = await db
        .insertInto("personal_questions")
        .values({ ...payload, user: user.id })
        .execute();

      if (insertion) {
        return "Added succesfully";
      }
    }
    return "failed to insert";
  },
  key: "postPersonalStats", // this will be used the mutation key
  schema: personalQuestionsSchema,
}); // this will be used as the input type and input validation

//BUG what if github and discord username is the same
