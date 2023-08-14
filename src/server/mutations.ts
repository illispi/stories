import { mutation$ } from "@prpc/solid";
import {
  personalQuestionsSchema,
  theirQuestionsSchema,
} from "~/types/zodFromTypes";

import { auth } from "~/auth/lucia";
import { db } from "./server";
export const postPersonalStats = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();
    if (session) {
      const user = await db
        .selectFrom("User")
        .select("id")
        .where("id", "=", session.user?.id)
        .executeTakeFirstOrThrow();

      if (user?.id) {
        const insertion = await db
          .insertInto("Personal_questions")
          .values({ ...payload, user: user.id, accepted: "pending" })
          .execute();

        if (insertion) {
          return "Added succesfully";
        }
      }
    }
  },
  key: "postPersonalStats",
  schema: personalQuestionsSchema,
});
export const postTheirStats = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();
    if (session) {
      const user = await db
        .selectFrom("User")
        .select("id")
        .where("id", "=", session.user?.id)
        .executeTakeFirstOrThrow();

      if (user?.id) {
        const insertion = await db
          .insertInto("Their_questions")
          .values({ ...payload, user: user.id, accepted: "pending" })
          .execute();

        if (insertion) {
          return "Added succesfully";
        }
      }
    }
  },
  key: "postTheirStats",
  schema: theirQuestionsSchema,
});
