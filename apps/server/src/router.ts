import * as trpc from "@trpc/server";
import { Context } from "./context";
// import { z } from "zod";
import { db } from "./index";
import { personalQuestions } from "zod-types";
import { sql } from "kysely";

export const appRouter = trpc
  .router<Context>()
  .mutation("addPersonalAnswers", {
    input: personalQuestions,

    resolve: async ({ input }) => {
 
      const { user_id } = await db
        .insertInto("user")
        // .values(sql`values ()`)
        .returning("user_id")
        .executeTakeFirstOrThrow();

      return user_id;
    },
  })
  .query("getAllUsersIds", {
    resolve: async () => {
      const allUsersIds = await db
        .selectFrom("user")
        .select("user_id")
        .execute();

      return allUsersIds;
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
