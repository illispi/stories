import { type Adapter, type AdapterAccount, type AdapterUser } from "@auth/core/adapters"
import { type Kysely } from "kysely"
import { type DB } from "./db/dbTypes"

/** @return { import("next-auth/adapters").Adapter } */
export default function KyselyAdapter(kysely: Kysely<DB>): Adapter {
    return {
      async createUser(user) {
        return await kysely.insertInto("user").values(user).returningAll().executeTakeFirst()
        
      },
      async getUser(id) {
        return await kysely.selectFrom("user").selectAll().where("id", "=", id).executeTakeFirst() ?? null
      },
      async getUserByEmail(email) {
        return await kysely.selectFrom("user").selectAll().where("email", "=", email).executeTakeFirst() ?? null
      },
      async getUserByAccount({ providerAccountId, provider }) {
        const account = await kysely.selectFrom("account").selectAll().where("providerAccountId", "=", providerAccountId).where("pr", "=", provider).executeTakeFirst()
        const user = await kysely.selectFrom("user").selectAll().where("id", "=", account?.user).executeTakeFirst() ?? null
        return user
      },
      async updateUser(user) {
        return await kysely.updateTable("user").where("id", "=", user.id).executeTakeFirst()
      },
      async deleteUser(userId) {
        return await kysely.deleteFrom("user").where("id", "=", userId).executeTakeFirst()
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



  export function PrismaAdapter(p: PrismaClient): Adapter {
    return {
      createUser: (data) => p.user.create({ data }),
      getUser: (id) => p.user.findUnique({ where: { id } }),
      getUserByEmail: (email) => p.user.findUnique({ where: { email } }),
      async getUserByAccount(provider_providerAccountId) {
        const account = await p.account.findUnique({
          where: { provider_providerAccountId },
          select: { user: true },
        })
        return account?.user ?? null
      },
      updateUser: ({ id, ...data }) => p.user.update({ where: { id }, data }),
      deleteUser: (id) => p.user.delete({ where: { id } }),
      linkAccount: (data) =>
        p.account.create({ data }) as unknown as AdapterAccount,
      unlinkAccount: (provider_providerAccountId) =>
        p.account.delete({
          where: { provider_providerAccountId },
        }) as unknown as AdapterAccount,
      async getSessionAndUser(sessionToken) {
        const userAndSession = await p.session.findUnique({
          where: { sessionToken },
          include: { user: true },
        })
        if (!userAndSession) return null
        const { user, ...session } = userAndSession
        return { user, session }
      },
      createSession: (data) => p.session.create({ data }),
      updateSession: (data) =>
        p.session.update({ where: { sessionToken: data.sessionToken }, data }),
      deleteSession: (sessionToken) =>
        p.session.delete({ where: { sessionToken } }),
      async createVerificationToken(data) {
        const verificationToken = await p.verificationToken.create({ data })
        // @ts-expect-errors // MongoDB needs an ID, but we don't
        if (verificationToken.id) delete verificationToken.id
        return verificationToken
      },
      async useVerificationToken(identifier_token) {
        try {
          const verificationToken = await p.verificationToken.delete({
            where: { identifier_token },
          })
          // @ts-expect-errors // MongoDB needs an ID, but we don't
          if (verificationToken.id) delete verificationToken.id
          return verificationToken
        } catch (error) {
          // If token already used/deleted, just return null
          // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
          if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
            return null
          throw error
        }
      },
    }
  }
