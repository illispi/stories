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

type User = {
  id: string;
  name: string;
  bio?: string;
};

const users: Record<string, User> = {};

export const appRouter = trpc
  .router()
  .query("getUserById", {
    input: z.null(),
    async resolve() {
      console.log(db);

      const { first_name } = await db
        .insertInto("person")
        .values({ first_name: "Jennifer", gender: "female" })
        .returning("first_name")
        .executeTakeFirstOrThrow();

      console.log(first_name);

      return first_name;
    },
  })
  .mutation("createUser", {
    // validate input with Zod
    input: z.object({
      name: z.string().min(3),
      bio: z.string().max(142).optional(),
    }),
    async resolve({ input }) {
      const id = Date.now().toString();
      const user: User = { id, ...input };
      users[user.id] = user;
      return user;
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
