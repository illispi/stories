import type { TestOptions } from "@next-auth/adapter-test";
import type { Kysely } from "kysely";
import type { DB } from "~/server/db/dbTypes";

export function dbHelper(db: Kysely<DB>): TestOptions["db"] {
  return {
    async user(id) {
      const user = await db
        .selectFrom("user")
        .selectAll("user")
        .where("user.id", "=", id);
      return user ?? null;
    },
    async account({ providerAccountId, provider }) {
      const account = await db
        .selectFrom("account")
        .selectAll()
        .where("providerAccountId", "=", providerAccountId)
        .where("provider", "=", provider)
        .executeTakeFirst();
      return account ?? null;
    },
    async session(sessionToken) {
      const session = await db
        .selectFrom("session")
        .selectAll("session")
        .where("sessionToken", "=", sessionToken)
        .executeTakeFirst();
      return session ?? null;
    },
    async verificationToken({ token, identifier }) {
      const verificationToken = await db
        .selectFrom("VerificationToken")
        .selectAll()
        .where("identifier", "=", identifier)
        .where("token", "=", token)
        .executeTakeFirst();
      if (!verificationToken) return null;
      //NOTE see what the below old code does?
      //const { id: _, ...rest } = verificationToken;
      return verificationToken;
    },
  };
}
