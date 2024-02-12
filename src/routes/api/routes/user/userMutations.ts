import { z } from "zod";
import {
  personalQuestionsSchema,
  theirQuestionsSchema,
} from "~/types/zodFromTypes";
import { sessionDer } from "../session";
import { Elysia, t } from "elysia";
import { db } from "../../db";

export const userMutationsRoute = new Elysia({ prefix: "/user/data/post" })
  .use(sessionDer)
  .post("/removeAccountAndData", async (context) => {
    const deletion = await db
      .deleteFrom("auth_user")
      .where("id", "=", context.user?.id)
      .executeTakeFirst();

    if (!deletion) {
      throw new Error("Deletion failed");
    }

    return "Deleted succesfully";
  })
  .post("/removePersonal", async (context) => {
    const deletion = await db
      .deleteFrom("Personal_questions")
      .where("user", "=", context.user?.id)
      .executeTakeFirst();

    if (!deletion) {
      throw new Error("Deletion failed");
    }

    return "Deleted succesfully";
  })
  .post(
    "/removeTheir",
    async (context) => {
      const deletion = await db
        .deleteFrom("Their_questions")
        .where("user", "=", context.user?.id)
        .where("id", "=", context.body.id)
        .executeTakeFirst();

      if (!deletion) {
        throw new Error("Deletion failed");
      }

      return "Deleted succesfully";
    },
    { body: t.Object({ id: t.Number() }) }
  )
  .post(
    "/removeArticle",
    async (context) => {
      const deletion = await db
        .deleteFrom("Articles")
        .where("user", "=", context.user?.id)
        .where("id", "=", context.body.id)
        .executeTakeFirst();

      if (!deletion) {
        throw new Error("Deletion failed");
      }

      return "Deleted succesfully";
    },
    { body: t.Object({ id: t.Number() }) }
  )
  .post("/editPersonal", async (context) => {
    personalQuestionsSchema.parse(context.body);
    //BUG test that this parse thows error
    const updated = await db
      .updateTable("Personal_questions")
      .set({ ...context.body, accepted: null })
      .where("user", "=", context.user?.id)
      .executeTakeFirst();

    if (!updated) {
      throw new Error("Update failed");
    }

    return "Updated succesfully";
  })
  .post(
    "/editTheir",
    async (context) => {
      theirQuestionsSchema.parse(context.body.data);
      const updated = await db
        .updateTable("Their_questions")
        .set({ ...context.body.data, accepted: null })
        .where("user", "=", context.user?.id)
        .executeTakeFirst();

      if (!updated) {
        throw new Error("Update failed");
      }

      return "Updated succesfully";
    },
    { body: t.Object({ data: t.Object(), id: t.Number() }) }
  )
  .onError(({ error }) => {
    return error.message;
  });
