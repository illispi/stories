import { middleware$, mutation$, query$, reuseable$ } from "@prpc/solid";
import { db } from "./server";
import { z } from "zod";
import { getSession } from "@solid-mediakit/auth";
import { authOpts } from "~/routes/api/auth/[...solidauth]";
import { ServerError } from "solid-start";
import { createFakeDataPersonal } from "~/utils/faker/personalQuestionsFaker";
import {
  personalQuestionsSchema,
  theirQuestionsSchema,
} from "~/types/zodFromTypes";
import { createFakeDataTheir } from "~/utils/faker/theirQuestionsFaker";

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
    accepted: z.boolean(),
  }),
});

export const acceptSubmission = mutation$({
  mutationFn: async ({ payload, request$ }) => {
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
      await db
        .updateTable(payload.pOrT)
        .set({
          accepted: true,
        })
        .where("id", "=", payload.id)
        .executeTakeFirst();
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "acceptSubmission",
  schema: z.object({
    id: z.number(),
    pOrT: z.enum(["Personal_questions", "Their_questions"]),
  }),
});

export const removeSubmission = mutation$({
  mutationFn: async ({ payload, request$ }) => {
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
      await db
        .deleteFrom(payload.pOrT)
        .where("id", "=", payload.id)
        .executeTakeFirst();
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "removeSubmission",
  schema: z.object({
    id: z.number(),
    pOrT: z.enum(["Personal_questions", "Their_questions"]),
  }),
});

export const fake = mutation$({
  mutationFn: async ({ payload, request$ }) => {
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
      const user = await db
        .selectFrom("User")
        .select("id")
        .where("id", "=", session.user?.id)
        .executeTakeFirstOrThrow();

      if (payload.pOrT === "Personal_questions") {
        const fakeData = createFakeDataPersonal();
        try {
          personalQuestionsSchema.parse(fakeData);
          await db
            .insertInto(payload.pOrT)
            .values({
              ...fakeData,
              user: user.id,
              accepted: false,
              fake: true,
            })
            .execute();
        } catch (error) {
          throw new ServerError(error);
        }
      } else if (payload.pOrT === "Their_questions") {
        const fakeData = createFakeDataTheir();
        try {
          theirQuestionsSchema.parse(fakeData);
          await db
            .insertInto(payload.pOrT)
            .values({
              ...fakeData,
              user: user.id,
              accepted: false,
              fake: true,
            })
            .execute();
        } catch (error) {
          throw new ServerError(error);
        }
      }
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "accept",
  schema: z.object({
    pOrT: z.enum(["Personal_questions", "Their_questions"]),
  }),
});
