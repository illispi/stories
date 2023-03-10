import { runBasicTests } from "@next-auth/adapter-test";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import KyselyAdapter from "../src/server/kysely-adapter";
import type { DB } from "../src/server/db/dbTypes";
import { dbHelper } from "./dbTestOptions";

const dbKysely = new Kysely<DB>({
  log: ["error", "query"],
  dialect: new PostgresDialect({
    pool: new Pool({
      host: "127.0.0.1",
      database: "nextauth",
      user: "nextauth",
      port: 5432,
    }),
  }),
});

runBasicTests({
  adapter: KyselyAdapter(dbKysely),
  db: dbHelper(dbKysely),
});
