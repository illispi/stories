import { z } from "zod";
import { Elysia, t } from "elysia";
import { db } from "../../db";
import { sessionDer } from "../session";
import {
  personalQuestionsSchema,
  theirQuestionsSchema,
} from "~/types/zodFromTypes";

export const basicMutationsRoute = new Elysia({ prefix: "/basic/post" })
  .use(sessionDer)
  .post("/personal", async (context) => {
    personalQuestionsSchema.parse(context.body);

    const existsAlready = await db
      .selectFrom("Personal_questions")
      .innerJoin("auth_user", "Personal_questions.user", "auth_user.id")
      .select(["Personal_questions.id"])
      .where("auth_user.id", "=", context.user?.id)
      .executeTakeFirst();

    if (existsAlready) {
      context.set.status = 500;
      throw new Error("Your personal poll data already exists");
    } else {
      const insertion = await db
        .insertInto("Personal_questions")
        .values({
          ...context.body,
          user: context.user?.id,
          accepted: null,
        })
        .executeTakeFirst();

      if (!insertion) {
        context.set.status = 500;
        throw new Error("Insertion to database failed");
      }
    }

    return "Added succesfully";
  })
  .post("/their", async (context) => {
    theirQuestionsSchema.parse(context.body);

    const insertion = await db
      .insertInto("Their_questions")
      .values({
        ...context.body,
        user: context.user?.id,
        accepted: null,
      })
      .executeTakeFirst();

    if (!insertion) {
      context.set.status = 500;
      throw new Error("Insertion to database failed");
    }
    return "Added succesfully";
  })
  .post("/article", async (context) => {
    z.object({
      link: z
        .string()
        .max(1000, { message: "Must be less than 1000 characters long" })
        .min(5, { message: "Must be more than 5 characters long" })
        .trim(),
      description: z
        .string()
        .max(500, { message: "Must be less than 1000 characters long" })
        .min(5, { message: "Must be more than 5 characters long" })
        .trim(),
    }).parse(context.body);

    const insertion = await db
      .insertInto("Articles")
      .values({
        ...context.body,
        user: context.user?.id,
        accepted: null,
      })
      .executeTakeFirst();

    if (!insertion) {
      context.set.status = 500;
      throw new Error("Insertion to database failed");
    }
    return "Added succesfully";
  })
  .onError(({ error }) => {
    return error.message;
  });
