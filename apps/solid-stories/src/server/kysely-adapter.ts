import type { Adapter } from "@auth/core/adapters";
import type { Kysely } from "kysely";
import type { DB } from "./db/dbTypes";

/** @return { import("next-auth/adapters").Adapter } */
export default function KyselyAdapter(kysely: Kysely<DB>): Adapter {
  return {
    async createUser(user) {
      return await kysely
        .insertInto("user")
        .values(user)
        .returningAll()
        .executeTakeFirst();
    },
    async getUser(id) {
      return (
        (await kysely
          .selectFrom("user")
          .selectAll()
          .where("id", "=", id)
          .executeTakeFirst()) ?? null
      );
    },
    async getUserByEmail(email) {
      return (
        (await kysely
          .selectFrom("user")
          .selectAll()
          .where("email", "=", email)
          .executeTakeFirst()) ?? null
      );
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await kysely
        .selectFrom("account")
        .selectAll()
        .where("providerAccountId", "=", providerAccountId)
        .where("provider", "=", provider)
        .executeTakeFirst();
      const user =
        (await kysely
          .selectFrom("user")
          .selectAll()
          .where("id", "=", account?.user)
          .executeTakeFirst()) ?? null;
      return user;
    },
    async updateUser(user) {
      return await kysely
        .updateTable("user")
        .where("id", "=", user.id)
        .executeTakeFirst();
    },
    async deleteUser(userId) {
      return await kysely
        .deleteFrom("user")
        .where("id", "=", userId)
        .executeTakeFirst();
    },
    async linkAccount(account) {
      return await kysely
        .insertInto("account")
        .values({ ...account })
        .returningAll()
        .executeTakeFirst();
    },
    async unlinkAccount({ providerAccountId, provider }) {
      return await kysely
        .deleteFrom("account")
        .where("providerAccountId", "=", providerAccountId)
        .where("provider", "=", provider)
        .executeTakeFirst();
    },
    async createSession({ sessionToken, userId, expires }) {
      return await kysely
        .insertInto("session")
        .values({ userId, sessionToken, expires })
        .returningAll()
        .executeTakeFirst();
    },
    async getSessionAndUser(sessionToken) {
      const session = await kysely
        .selectFrom("session")
        .selectAll("session")
        .where("sessionToken", "=", sessionToken)
        .executeTakeFirst();
      const user = await kysely
        .selectFrom("user")
        .selectAll("user")
        .where("id", "=", session?.userId)
        .executeTakeFirst();
      return { session, user };
    },
    async updateSession({ sessionToken }) {
      return await kysely
        .updateTable("session")
        .where("sessionToken", "=", sessionToken)
        .executeTakeFirst();
    },
    async deleteSession(sessionToken) {
      return await kysely
        .deleteFrom("session")
        .where("sessionToken", "=", sessionToken)
        .executeTakeFirst();
    },
    async createVerificationToken({ identifier, expires, token }) {
      return await kysely
        .insertInto("VerificationToken")
        .values({ expires, identifier, token })
        .returningAll()
        .executeTakeFirst();
    },
    async useVerificationToken({ identifier, token }) {
      const VerificationToken = await kysely
        .selectFrom("VerificationToken")
        .selectAll()
        .where("identifier", "=", identifier)
        .where("token", "=", token)
        .executeTakeFirst();
    },

    //BUG these last two delete something as well
    //BUG I think userID on account and session should be related to user
  };
}
