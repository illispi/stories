import { query$ } from "@prpc/solid";
import { ServerError } from "solid-start";
import { z } from "zod";
import { auth } from "~/auth/lucia";
import { db } from "../server";

export const listSubmissions = query$({
  queryFn: async ({ payload, request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();

    if (!session) {
      throw new ServerError("Session not found");
    }

    const admin = await db
      .selectFrom("auth_user")
      .select("role")
      .where("id", "=", session.user?.userId)
      .executeTakeFirstOrThrow();

    if (admin.role) {
      //TODO update selects when you update database

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
        payload.pOrT === "Personal_questions" ? personalQuery : theirQuery;

      //TODO Use try and catch here and then return error with serverError

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
    accepted: z.enum(["accepted", "pending", "declined"]),
  }),
});
