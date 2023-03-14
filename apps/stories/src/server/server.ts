import { Pool } from "pg";
import { Kysely, PostgresDialect, sql } from "kysely";
import type { DB } from "../types/dbTypes";
import "dotenv/config";

const testPools = () => {
  console.log("multipleTimes!!!!");

  return new Kysely<DB>({
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
};

export const db = testPools();
