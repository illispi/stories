import { SolidAuth } from "@auth/solid-start";
import type { SolidAuthConfig } from "@auth/solid-start";
import Github from "@auth/core/providers/github";
import { serverEnv } from "~/env/server";

import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";
import KyselyAdapter from "~/server/kysely-adapter";
import type { DB } from "~/server/db/dbTypes";

const db = new Kysely<DB>({
  log: ["error", "query"],
  dialect: new PostgresDialect({
    pool: new Pool({
      host: "127.0.0.1",
      database: "stories_dev",
      password: process.env.PSQL_PASSWORD,
      user: process.env.PSQL_USERNAME,
      port: 5432,
    }),
  }),
});

export const authOpts: SolidAuthConfig = {
  providers: [
    // @ts-expect-error Types Issue
    Github({
      clientId: serverEnv.GITHUB_ID,
      clientSecret: serverEnv.GITHUB_SECRET,
    }),
  ],
  debug: false,
  adapter: KyselyAdapter(db),
};

export const { GET, POST } = SolidAuth(authOpts);
