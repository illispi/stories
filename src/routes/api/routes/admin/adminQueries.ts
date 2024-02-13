import { z } from "zod";
import { sessionDer } from "../session";
import { Elysia, TSchema, t } from "elysia";
import { db } from "../../db";

enum selection {
  "Personal_questions",
  "Their_questions",
}
const Nullable = <T extends TSchema>(schema: T) => t.Union([schema, t.Null()]);

export const adminQueriesRoute = new Elysia({ prefix: "/admin/data/" })
  .use(sessionDer)
  .get(
    "/personal",
    async (context) => {
      const personalQuery = db
        .selectFrom("Personal_questions")
        .select([
          "id",
          "describe_hospital",
          "what_kind_of_care_after",
          "personality_before",
          "personality_after",
          "other_help",
          "goals_after",
          "responded_to_telling",
          "life_satisfaction_description",
          "what_others_should_know",
          "not_have_schizophrenia_description",
        ]);

      const theirQuery = db
        .selectFrom("Their_questions")
        .select([
          "id",
          "personality_before",
          "personality_after",
          "what_others_should_know",
        ]);

      const pOrTQuery =
        context.body.pOrT === "Personal_questions" ? personalQuery : theirQuery;

      //TODO Use try and catch here and then return error with serverError

      const poll = await pOrTQuery
        .where("accepted", "is", context.body.accepted)
        .offset(context.body.page * 25)
        .limit(25)
        .execute();

      //BUG this might return undefined, should be returnin null in that case

      const { countAll } = db.fn;

      const { count } = (await db
        .selectFrom(context.body.pOrT)
        .select(countAll().as("count"))
        .where("accepted", "is", context.body.accepted)
        .executeTakeFirst()) ?? { count: 0 };

      const total = Number(count);

      return { poll, total };
    },
    {
      body: t.Object({
        page: t.Number(),
        pOrT: t.Enum(selection),
        accepted: Nullable(t.Boolean({})),
      }),
    }
  );

export const listArticles = adminProcedure
  .input(
    z.object({
      page: z.number().int(),
      accepted: z.boolean().nullable(),
    })
  )
  .query(async ({ ctx, input }) => {
    const articles = await ctx.db
      .selectFrom("Articles")
      .select((eb) => [
        "link",
        "description",
        "id",
        eb.fn.count<number>("Articles.id").as("count"),
      ])
      .groupBy("Articles.id") //BUG this needs group by but shows count of 1
      .where("accepted", "is", null)
      .limit(25)
      .offset(input.page * 25)
      .execute();

    return articles;
  });
