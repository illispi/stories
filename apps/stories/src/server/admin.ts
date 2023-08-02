import { middleware$, query$, reuseable$ } from "@prpc/solid";
import { db } from "./server";
import { z } from "zod";
import { getSession } from "@solid-auth/base";
import { authOpts } from "~/routes/api/auth/[...solidauth]";

const adminCheck = middleware$(async ({ request$ }) => {
  const session = await getSession(request$, authOpts);

  if (!session) {
    return "no session found";
  }

  const admin = await db
    .selectFrom("User")
    .select("role")
    .where("id", "=", session.user?.id)
    .executeTakeFirstOrThrow();

  return {
    admin: Boolean(admin.role),
  };
});

export const adminProcedure = reuseable$(adminCheck);

export const listSubmissions = adminProcedure.query$({
  queryFn: async ({ payload, ctx$ }) => {
    if (ctx$.admin) {
      const personalPoll = await db
        .selectFrom("Personal_questions")
        .select([
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
        ])
        .offset(payload.page * 50)
        .limit(50)
        .execute();

      //TODO update selects when you update database
      const theirPoll = await db
        .selectFrom("Their_questions")
        .select([
          "personality_before",
          "personality_after",
          "what_others_should_know",
        ])
        .offset(payload.page * 50)
        .limit(50)
        .execute();

        return {personal: personalPoll, their: theirPoll};
    } else {
      return "Access denied";
    }
  },
  key: "listSubmissions",
  schema: z.object({
    page: z.number().int().positive(),
  }),
});
