import { mutation$, query$ } from "@prpc/solid";
import { ServerError } from "solid-start";
import { z } from "zod";
import { auth } from "~/auth/lucia";
import {
  personalQuestionsSchema,
  theirQuestionsSchema,
} from "~/types/zodFromTypes";
import { createFakeDataPersonal } from "~/utils/faker/personalQuestionsFaker";
import { createFakeDataTheir } from "~/utils/faker/theirQuestionsFaker";
import { db } from "../server";
import { Faker, faker } from "@faker-js/faker";

// const adminCheck = middleware$(async ({ request$ }) => {
//   const authRequest = auth.handleRequest(request$);
//const session = await authRequest.validate();

//   if (!session) {
//     return "no session found";
//   }

//   const admin = await db
//     .selectFrom("auth_user")
//     .select("role")
//     .where("id", "=", session.user?.userId)
//     .executeTakeFirstOrThrow();

//   return {
//     admin: Boolean(admin.role === "admin"),
//   };
// });

// export const adminProcedure = reuseable$(adminCheck);

export const acceptSubmission = mutation$({
  mutationFn: async ({ payload, request$ }) => {
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

    if (admin.role === "admin") {
      await db
        .updateTable(payload.pOrT)
        .set({
          accepted: "accepted",
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

export const declineSubmission = mutation$({
  mutationFn: async ({ payload, request$ }) => {
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

    if (admin.role === "admin") {
      await db
        .updateTable(payload.pOrT)
        .set({
          accepted: "declined",
        })
        .where("id", "=", payload.id)
        .executeTakeFirst();
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "declineSubmission",
  schema: z.object({
    id: z.number(),
    pOrT: z.enum(["Personal_questions", "Their_questions"]),
  }),
});

export const fakeForFake = mutation$({
  mutationFn: async ({ payload, request$ }) => {
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

    if (admin.role === "admin") {
      if (payload.pOrT === "Personal_questions_fake") {
        const fakeData = createFakeDataPersonal();
        try {
          personalQuestionsSchema.parse(fakeData);
          await db
            .insertInto(payload.pOrT)
            .values({
              ...fakeData,
            })
            .execute();
        } catch (error) {
          throw new ServerError(error);
        }
      } else if (payload.pOrT === "Their_questions_fake") {
        const fakeData = createFakeDataTheir();
        try {
          theirQuestionsSchema.parse(fakeData);
          await db
            .insertInto(payload.pOrT)
            .values({
              ...fakeData,
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
  key: "fakeForFake",
  schema: z.object({
    pOrT: z.enum(["Personal_questions_fake", "Their_questions_fake"]),
  }),
});
export const fakeForDev = mutation$({
  mutationFn: async ({ payload, request$ }) => {
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

    if (admin.role === "admin") {
      const user = await db
        .selectFrom("auth_user")
        .select("id")
        .where("id", "=", session.user?.userId)
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
              accepted: "pending",
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
              accepted: "pending",
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
  key: "fakeForDev",
  schema: z.object({
    pOrT: z.enum(["Personal_questions", "Their_questions"]),
  }),
});
export const fakeArticlesForDev = mutation$({
  mutationFn: async ({ request$ }) => {
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

    if (admin.role === "admin") {
      const add = await db
        .insertInto("Articles")
        .values({
          description: faker.lorem
            .paragraphs(10)
            .substring(0, Math.floor(Math.random() * 400) + 4),
          link: faker.internet.url(),
          user: session.user.userId,
        })
        .executeTakeFirst();

      if (add) {
        return "success";
      } else {
        throw new ServerError("Failed to add");
      }
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "fakeArticlesForDev",
});
