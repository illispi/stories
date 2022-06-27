import * as trpc from "@trpc/server";
import { Context } from "./context";
// import { z } from "zod";
import { db } from "./index";
// import { createUser } from "zod-types";
// import { sql } from "kysely";

export const appRouter = trpc
  .router<Context>()
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
  })
  .mutation("createCookie", {
    resolve: async ({ ctx }) => {
      if (!ctx.user.id) {
        const { user_id } = await db
          .insertInto("user")
          .returning("user_id")
          .executeTakeFirstOrThrow();

        ctx.req.session.id = user_id;

        return "There should be cookies";
      }
      return "There already should be cookie";
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;

// if (!request.session.myId) {
//   const user = await prisma.user.create({ data: {} });

//   request.session.myId = user.id;

//   reply.send({ status: "profile created!" });
// } else {
//   const user = await prisma.user.findUnique({
//     where: { id: request.session.myId },
//   });
//   if (!user?.userName) {
//     reply.status(200).send({ status: "Not registered" });
//   } else {
//     reply.status(200).send({ status: "Authenticated!" });
//   }
// }
