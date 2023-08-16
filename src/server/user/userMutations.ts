import { mutation$ } from "@prpc/solid";
import { getSession } from "@solid-mediakit/auth";
import { ServerError } from "solid-start";
import { authOpts } from "~/routes/api/auth/[...solidauth]";
import { db } from "../server";
import { z } from "zod";
import { auth } from "~/auth/lucia";

export const removeAccountAndData = mutation$({
  mutationFn: async ({ request$ }) => {
    

    const authRequest = auth.handleRequest(request$);
    const session = await authRequest.validate();

    if (!session) {
      throw new ServerError("Session not found");
    }

    const user = await db
      .selectFrom("User")
      .select(["id", "role"])
      .where("id", "=", session.user?.id)
      .executeTakeFirstOrThrow();

    if (user.id && user.role === "user") {
      await db.deleteFrom("User").where("id", "=", user.id).executeTakeFirst();
    } else {
      //TODO add status codes also
      throw new ServerError("Access denied");
    }
  },
  key: "removeAccountAndData",
});
