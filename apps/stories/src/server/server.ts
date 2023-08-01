import { Pool } from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";
import type { DB } from 'kysely-codegen'
import "dotenv/config";

const testPools = () => {
  //NOTE log: ["error", "query"]

  return new Kysely<DB>({
    log: ["error"],
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
};

export const db = testPools();
