import { z } from "zod";
import { adminProcedure } from "../../utils";

export const listSubmissions = adminProcedure
  .input(
    z.object({
      page: z.number().int(),
      pOrT: z.enum(["Personal_questions", "Their_questions"]),
      accepted: z.enum(["accepted", "pending"]),
    })
  )
  .query(async ({ ctx, input }) => {
    //TODO update selects when you update database

    const personalQuery = ctx.db
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

    const theirQuery = ctx.db
      .selectFrom("Their_questions")
      .select([
        "id",
        "personality_before",
        "personality_after",
        "what_others_should_know",
      ]);

    const pOrTQuery =
      input.pOrT === "Personal_questions" ? personalQuery : theirQuery;

    //TODO Use try and catch here and then return error with serverError

    const poll = await pOrTQuery
      .where("accepted", "=", input.accepted)
      .offset(input.page * 25)
      .limit(25)
      .execute();

    //BUG this might return undefined, should be returnin null in that case

    const { countAll } = ctx.db.fn;

    const { count } = (await ctx.db
      .selectFrom(input.pOrT)
      .select(countAll().as("count"))
      .where("accepted", "=", input.accepted)
      .executeTakeFirst()) ?? { count: 0 };

    const total = Number(count);

    return { poll, total };
  });

export const listArticles = adminProcedure
  .input(
    z.object({
      page: z.number().int(),
      accepted: z.enum(["accepted", "pending"]),
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
      .where("accepted", "=", "pending")
      .limit(25)
      .offset(input.page * 25)
      .execute();

    return articles;
  });
