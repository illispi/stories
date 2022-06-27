import * as trpc from "@trpc/server";
// import { z } from "zod";
import { db } from "./index";
// import { createUser } from "zod-types";
// import { sql } from "kysely";

export const appRouter = trpc
  .router()
  .mutation("createUser", {
    resolve: async () => {
      const { user_id } = await db
        .insertInto("user")
        // .values(sql`values ()`)
        .returning("user_id")
        .executeTakeFirstOrThrow();

      return user_id;
    },
  })
  .query("getAllUsersIds", {
    resolve: async () => {
      const allUsersIds = await db
        .selectFrom("user")
        .select("user_id")
        .execute();

      return allUsersIds;
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
