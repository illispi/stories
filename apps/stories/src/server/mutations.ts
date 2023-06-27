import { mutation$, response$ } from "@prpc/solid";
import { z } from "zod";
import { isServer } from "solid-js/web";
import { personalQuestionsSchema } from "~/types/zodFromTypes";
import { SolidAuth, getSession } from "@auth/solid-start";
import { authOpts } from "~/routes/api/auth/[...solidauth]";
import { db } from "./server";
export const postPersonalStats = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    const session = await getSession(request$, authOpts);
    console.log(session, "session");

    if (!session) {
      return "no session found";
    }

    const user = await db
      .selectFrom("User")
      .select("id")
      .where("id", "=", session.user.id)
      .executeTakeFirstOrThrow();

      console.log(user, "user")

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
  key: "postPersonalStats", // this will be used the mutation key
  schema: personalQuestionsSchema,
}); // this will be used as the input type and input validation
