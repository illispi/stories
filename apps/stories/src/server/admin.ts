import { middleware$, query$, reuseable$ } from "@prpc/solid";
import { db } from "./server";
import { z } from "zod";
import { getSession } from "@solid-auth/base";
import { authOpts } from "~/routes/api/auth/[...solidauth]";
import { ServerError } from "solid-start";

// const adminCheck = middleware$(async ({ request$ }) => {
//   const session = await getSession(request$, authOpts);

//   if (!session) {
//     return "no session found";
//   }

//   const admin = await db
//     .selectFrom("User")
//     .select("role")
//     .where("id", "=", session.user?.id)
//     .executeTakeFirstOrThrow();

//   return {
//     admin: Boolean(admin.role),
//   };
// });

// export const adminProcedure = reuseable$(adminCheck);

export const listSubmissions = query$({
  queryFn: async ({ payload, request$ }) => {
    const session = await getSession(request$, authOpts);

    if (!session) {
      throw new ServerError("Session not found");
    }

    const admin = await db
      .selectFrom("User")
      .select("role")
      .where("id", "=", session.user?.id)
      .executeTakeFirstOrThrow();

    if (admin.role) {
      //TODO update selects when you update database

      const personalQuery = db
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
        ]);

      const theirQuery = db
        .selectFrom("Their_questions")
        .select([
          "personality_before",
          "personality_after",
          "what_others_should_know",
        ]);

      const pOrTQuery =
        payload.pOrT === "Personal_questions" ? personalQuery : theirQuery;

      const poll = await pOrTQuery
        .where("accepted", "=", payload.accepted)
        .offset(payload.page * 50)
        .limit(50)
        .execute();

      const { countAll } = db.fn;

      const { count } = (await db
        .selectFrom(payload.pOrT)
        .select(countAll().as("count"))
        .where("accepted", "=", payload.accepted)
        .executeTakeFirst()) ?? { count: 0 };

      const total = Number(count);

      return { poll, total };
    } else {
      throw new ServerError("Access denied");
    }
  },
  key: "listSubmissions",
  schema: z.object({
    page: z.number().int(),
    pOrT: z.enum(["Personal_questions", "Their_questions"]),
    accepted: z.boolean(),
  }),
});
