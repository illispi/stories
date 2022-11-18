import { initTRPC } from "@trpc/server";
import { Context } from "./context";
// import { z } from "zod";
//TODO is there a way to import not the generated types but the typescript itself in "zod-types"
//TODO look into trpcERROR
import { personalQuestionsSchema, theirQuestionsSchema } from "zod-types";
import { sql } from "kysely";

export const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  addPersonalAnswers: t.procedure
    .input(personalQuestionsSchema)
    .mutation(async ({ input, ctx }) => {
      if (ctx.req.session.id) {
        const insertion = await ctx.db
          .insertInto("personal_questions")
          .values({ ...input, user_id: ctx.req.session.id }) //BUG what if session.if is null or otherwise wrong.
          .execute();

        if (insertion) {
          //BUG what if insertion returns no success
          return "Added, waiting for approval";
        }

        return "failed to add for approval";
      }

      return "No session found";
    }),

  addTheirAnswers: t.procedure
    .input(theirQuestionsSchema)
    .mutation(async ({ input, ctx }) => {
      if (ctx.req.session.id) {
        const insertion = await ctx.db
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
    }),
  createCookie: t.procedure.mutation(async ({ ctx }) => {
    if (!ctx.req.session.id) {
      const { user_id } = await ctx.db
        .insertInto("user")
        .values({ user_id: sql`DEFAULT` })
        .returning("user_id")
        .executeTakeFirstOrThrow();

      ctx.req.session.id = user_id;

      return "Cookies added";
    }
    return "Cookies should exist already";
  }),
  personalStats: t.procedure.query(async ({ ctx }) => {
    const allPersonalStats = await ctx.db
      .selectFrom("personal_questions")
      .selectAll()
      .execute();

    //TODO create partial that removes parts of properties from object inside array

    allPersonalStats.forEach((e: typeof allPersonalStats[0]) => {
      delete e.user_id;
      delete e.created_at;
      delete e.created_at;
      delete e.answer_personal_id;
    });

    return allPersonalStats;
  }),
  ageOfOnsetPsychosisByGender: t.procedure.query(async ({ ctx }) => {
    const maleAge = await ctx.db
      .selectFrom("personal_questions")
      .select(["age_of_onset"])
      .where("gender", "=", "male")
      .execute();

    const femaleAge = await ctx.db
      .selectFrom("personal_questions")
      .select(["age_of_onset"])
      .where("gender", "=", "female")
      .execute();
    const otherAge = await ctx.db
      .selectFrom("personal_questions")
      .select(["age_of_onset"])
      .where("gender", "=", "other")
      .execute();

    const average = (obj: typeof maleAge) => {
      return obj.reduce((a, b) => a + b.age_of_onset, 0) / obj.length;
    };
    const median = (obj: typeof maleAge) => {
      const arr = obj.map((e) => e.age_of_onset);
      const sorted = arr.sort((a, b) => a - b);
      return sorted[Math.floor(arr.length / 2)];
    };

    const result = {
      maleAverage: average(maleAge),
      femaleAverage: average(femaleAge),
      otherAverage: average(otherAge),
      maleMedian: median(maleAge),
      femaleMedian: median(femaleAge),
      otherMedian: median(otherAge),
    };

    return result;
  }),
  psyLengthByGender: t.procedure.query(async ({ ctx }) => {
    const maleSplit = await ctx.db
      .selectFrom("personal_questions")
      .select(["length_of_psychosis"])
      .where("gender", "=", "male")
      .execute();

    const femaleSplit = await ctx.db
      .selectFrom("personal_questions")
      .select(["length_of_psychosis"])
      .where("gender", "=", "female")
      .execute();
    const otherSplit = await ctx.db
      .selectFrom("personal_questions")
      .select(["length_of_psychosis"])
      .where("gender", "=", "other")
      .execute();

    const result = {
      maleSplit,
      femaleSplit,
      otherSplit,
    };

    return result;
  }),
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
