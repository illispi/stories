import * as trpc from "@trpc/server";
import { z } from "zod";
import { db } from "./index";
import { createUser } from "zod-types";

export const appRouter = trpc
  .router()
  .query("getUserById", {
    input: z.number(),
    resolve: async ({ input }) => {
      const { first_name } = await db
        .selectFrom("person")
        .select("first_name")
        .where("id", "=", input)
        .executeTakeFirstOrThrow();

      return first_name;
    },
  })
  .query("getAllUsers", {
    resolve: async () => {
      const allUsers = await db
        .selectFrom("person")
        .select("first_name")
        .execute();

      return allUsers;
    },
  })
  .mutation("createUser", {
    input: createUser,
    resolve: async ({ input }) => {
      const { first_name } = await db
        .insertInto("person")
        .values({ first_name: input.firstName, gender: input.gender })
        .returning("first_name")
        .executeTakeFirstOrThrow();

      return first_name;
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
