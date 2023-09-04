import { mutation$ } from "@prpc/solid";
import {
  personalQuestionsSchema,
  theirQuestionsSchema,
} from "~/types/zodFromTypes";

import { auth } from "~/auth/lucia";
import { db } from "../server";
import { z } from "zod";
export const postPersonalStats = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();
    if (session) {
      const user = await db
        .selectFrom("auth_user")
        .select("id")
        .where("id", "=", session.user?.userId)
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
        .selectFrom("auth_user")
        .select("id")
        .where("id", "=", session.user?.userId)
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
export const postArticle = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();
    if (session) {
      const user = await db
        .selectFrom("auth_user")
        .select("id")
        .where("id", "=", session.user?.userId)
        .executeTakeFirstOrThrow();

      if (user?.id) {
        const insertion = await db
          .insertInto("Articles")
          .values({ ...payload, user: user.id, accepted: "pending" })
          .execute();

        if (insertion) {
          return "Added succesfully";
        }
      }
    }
  },
  key: "postArticle",
  schema: z.object({
    link: z
      .string()
      .max(1000, { message: "Must be 1000 or fewer characters long" })
      .min(5, { message: "Must be 5 or more characters long" })
      .trim(),
    description: z
      .string()
      .max(500, { message: "Must be 500 or fewer characters long" })
      .min(5, { message: "Must be 5 or more characters long" })
      .trim(),
  }),
});
