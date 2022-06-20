import * as trpc from "@trpc/server";
import { z } from "zod";
import { db } from "./index";

// async function demo() {
//   const { id } = await db
//     .insertInto("person")
//     .values({ first_name: "Jennifer", gender: "female" })
//     .returning("id")
//     .executeTakeFirstOrThrow();

//   await db
//     .insertInto("pet")
//     .values({ name: "Catto", species: "cat", owner_id: id })
//     .execute();

//   const person = await db
//     .selectFrom("person")
//     .innerJoin("pet", "pet.owner_id", "person.id")
//     .select(["first_name", "pet.name as pet_name"])
//     .where("person.id", "=", id)
//     .executeTakeFirst();

//   if (person) {
//     person.pet_name;
//   }
// }
// You can extract the select, insert and update interfaces like this
// if you want (you don't need to):
// type Person = Selectable<PersonTable>;
// type InsertablePerson = Insertable<PersonTable>;
// type UpdateablePerson = Updateable<PersonTable>;

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
  .mutation("createUser", {
    // validate input with Zod
    input: z.object({
      firstName: z.string().min(3),
      gender: z.enum(["female", "male", "other"]),
    }),
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
