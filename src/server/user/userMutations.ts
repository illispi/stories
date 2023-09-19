import { mutation$ } from "@prpc/solid";
import { ServerError } from "solid-start";
import { auth } from "~/auth/lucia";
import { db } from "../server";

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

    if (user.id && user.role === "user") {
      await db
        .deleteFrom("Personal_questions")
        .where("user", "=", user.id)
        .executeTakeFirst();
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "removePersonal",
});
export const editPersonalDeclined = mutation$({
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
        ])
        .where("user", "=", user.id);
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "removePersonal",
});
