import { Elysia } from "elysia";
import { derive } from "./derive";
import { db } from "../db";

export const userRoute = new Elysia({ prefix: "/user" })
  .use(derive)
  .get("", async (context) => {
    if (context.session?.userId) {
      const unSafe = await db
        .selectFrom("Personal_questions")
        .selectAll()
        .where("user", "=", context.session?.userId)
        .executeTakeFirst();

      if (!unSafe) {
        return { logStatus: true, personalData: false };
      }
      return { logStatus: true, personalData: true };
    } else {
      return { logStatus: false, personalData: false };
    }
  });
