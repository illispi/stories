import { type Adapter } from "@auth/core/adapters"
import { type Kysely } from "kysely"
import { type DB } from "./db/dbTypes"

/** @return { import("next-auth/adapters").Adapter } */
export default function KyselyAdapter(kysely: Kysely<DB>): Adapter {
    return {
      async createUser(user) {
        return kysely.insertInto("user").values(user).executeTakeFirst()
      },
      async getUser(id) {
        return kysely.selectFrom("user").where("id", "=", id).executeTakeFirst()
      },
      async getUserByEmail(email) {
        return
      },
      async getUserByAccount({ providerAccountId, provider }) {
        return
      },
      async updateUser(user) {
        return
      },
      async deleteUser(userId) {
        return
      },
      async linkAccount(account) {
        return
      },
      async unlinkAccount({ providerAccountId, provider }) {
        return
      },
      async createSession({ sessionToken, userId, expires }) {
        return
      },
      async getSessionAndUser(sessionToken) {
        return
      },
      async updateSession({ sessionToken }) {
        return
      },
      async deleteSession(sessionToken) {
        return
      },
      async createVerificationToken({ identifier, expires, token }) {
        return
      },
      async useVerificationToken({ identifier, token }) {
        return
      },
    }
  }
