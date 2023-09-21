import { mutation$ } from "@prpc/solid";
import { ServerError } from "solid-start";
import { auth } from "~/auth/lucia";
import { db } from "../server";
import { z } from "zod";

export const removeAccountAndData = mutation$({
  mutationFn: async ({ request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();

    if (!session) {
      throw new ServerError("Session not found");
    }

    const user = await db
      .selectFrom("auth_user")
      .select(["id", "role"])
      .where("id", "=", session.user?.userId)
      .executeTakeFirstOrThrow();

    if (user.id && user.role === "user") {
      //NOTE this is just user role, dont want to delete admin
      await db
        .deleteFrom("auth_user")
        .where("id", "=", user.id)
        .executeTakeFirst();
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "removeAccountAndData",
});

export const removePersonal = mutation$({
  mutationFn: async ({ request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();

    if (!session) {
      throw new ServerError("Session not found");
    }

    const user = await db
      .selectFrom("auth_user")
      .select(["id", "role"])
      .where("id", "=", session.user?.userId)
      .executeTakeFirstOrThrow();

    if (user.id && user.role) {
      await db
        .deleteFrom("Personal_questions")
        .where("user", "=", user.id)
        .executeTakeFirst();

      return "Deleted personal data";
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "removePersonal",
});
export const removeTheir = mutation$({
  mutationFn: async ({ payload, request$ }) => {
    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();

    if (!session) {
      throw new ServerError("Session not found");
    }

    const user = await db
      .selectFrom("auth_user")
      .select(["id", "role"])
      .where("id", "=", session.user?.userId)
      .executeTakeFirstOrThrow();

    if (user.id) {
      await db
        .deleteFrom("Their_questions")
        .where("user", "=", user.id)
        .where("id", "=", payload.id)
        .executeTakeFirst();

      return "Deleted personal data";
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "removeTheir",
  schema: z.object({ id: z.number() }),
});
