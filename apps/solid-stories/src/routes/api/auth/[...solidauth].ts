import { SolidAuth, type SolidAuthConfig } from "@auth/solid-start";
import Github from "@auth/core/providers/github";
import { serverEnv } from "~/env/server";

import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";

const db = new Kysely<DB>({
  log: ["error", "query"],
  dialect: new PostgresDialect({
    pool: new Pool({
      host: "127.0.0.1",
      database: "auth_dev",
      password: process.env.PSQL_PASSWORD,
      user: process.env.PSQL_USERNAME,
      port: 5432,
    }),
  }),
});

export const authOpts: SolidAuthConfig = {
  callbacks: {
    session({ session, user }) {
      /*     if (session.user) {

        session.user.name = user.name;
      } */

      console.log(user);

      return session;
    },
  },
  providers: [
    // @ts-expect-error Types Issue
    Github({
      clientId: serverEnv.GITHUB_ID,
      clientSecret: serverEnv.GITHUB_SECRET,
    }),
  ],
  debug: false,
};

export const { GET, POST } = SolidAuth(authOpts);
