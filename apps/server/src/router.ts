import * as trpc from "@trpc/server";
import { Context } from "./context";
// import { z } from "zod";
import { db } from "./index";
//TODO is there a way to import not the generated types but the typescript itself in "zod-types"
import { personalQuestionsSchema, theirQuestionsSchema } from "zod-types";
import { sql } from "kysely";

export const appRouter = trpc
  .router<Context>()
  .mutation("addPersonalAnswers", {
    input: personalQuestionsSchema,

    resolve: async ({ input, ctx }) => {

      if (ctx.req.session.id) {
        const insertion = await db
          .insertInto("personal_questions")
          .values({ ...input, user_id: ctx.req.session.id }) //BUG what if session.if is null or otherwise wrong.
          .execute();

        if (insertion) {
          //BUG what insertion returns no success
          return "Added, waiting for approval";
        }

        return "failed to add for approval";
      }

      return "No session found";
    },
  })
  .mutation("addTheirAnswers", {
    input: theirQuestionsSchema,
    resolve: async ({ input, ctx }) => {
      if (ctx.req.session.id) {
        const insertion = await db
          .insertInto("their_questions")
          .values({ ...input, user_id: ctx.req.session.id }) //BUG what if session.if is null or otherwise wrong.
          .execute();

        if (insertion) {
          //BUG what insertion returns if no success
          return "Added, waiting for approval";
        }

        return "failed to add for approval";
      }

      return "No session found";
    },
  })
  .mutation("createCookie", {
    resolve: async ({ ctx }) => {
      if (!ctx.req.session.id) {
        const { user_id } = await db
          .insertInto("user")
          .values({ user_id: sql`DEFAULT` })
          .returning("user_id")
          .executeTakeFirstOrThrow();

        ctx.req.session.id = user_id;

        return "Cookies added";
      }
      return "Cookies should exist already";
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;

//NOTE old example how to select all

// .query("getAllUsersIds", {
//   resolve: async () => {
//     const allUsersIds = await db
//       .selectFrom("user")
//       .select("user_id")
//       .execute();

//     return allUsersIds;
//   },
// })
