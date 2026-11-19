import { z } from "zod";
import { adminProcedure } from "../../utils";

export const listSubmissions = adminProcedure
  .input(
    z.object({
      page: z.number().int(),
      pOrT: z.enum(["Personal_questions", "Their_questions"]),
      accepted: z.boolean().nullable(),
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

    //TODO Use try and catch here and then return error with serverError

    // Filter each builder on its own: a union of the two builder types isn't callable.
    const poll =
      input.pOrT === "Personal_questions"
        ? await personalQuery
            .where("accepted", "is", input.accepted)
            .offset(input.page * 25)
            .limit(25)
            .execute()
        : await theirQuery
            .where("accepted", "is", input.accepted)
            .offset(input.page * 25)
            .limit(25)
            .execute();

    //BUG this might return undefined, should be returnin null in that case



    const { count } = (await ctx.db
      .selectFrom(input.pOrT)
      .select(ctx.db.fn.countAll().as("count"))
      .where("accepted", "is", input.accepted)
      .executeTakeFirst()) ?? { count: 0 };

    const total = Number(count);

    return { poll, total };
  });

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
        // total number of matching rows, repeated on every row (window function)
        eb.fn.countAll<number>().over().as("count"),
      ])
      .where("accepted", "is", null)
      .limit(25)
      .offset(input.page * 25)
      .execute();

    return articles;
  });
