import { SolidAuth } from "@auth/solid-start";
import type { SolidAuthConfig } from "@auth/solid-start";
import Github from "@auth/core/providers/github";
import { serverEnv } from "~/env/server";

import { Kysely, PostgresDialect, sql } from "kysely";
import { Pool } from "pg";

import type { DB } from "~/types/dbTypes";
import KyselyAdapter from "~/db/kyselyAdapter";
import { db } from "~/server/server";

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
