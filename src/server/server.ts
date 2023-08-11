import "dotenv/config";
import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "kysely-codegen";
import { Pool } from "pg";

type Database = {
  user: UserTable;
  key: KeyTable;
  session: SessionTable;
};

type UserTable = {
  id: string;
};

type KeyTable = {
  id: string;
  user_id: string;
  hashed_password: string | null;
};

type SessionTable = {
  id: string;
  user_id: string;
  active_expires: bigint;
  idle_expires: bigint;
};

export const pool = new Pool({
  host: "127.0.0.1",
  database: "stories_dev",
  password: process.env.PSQL_PASSWORD,
  user: process.env.PSQL_USERNAME,
  port: 5432,
});

const dialect = new PostgresDialect({
  pool,
});

export const db = new Kysely<Database & DB>({
  log: ["error"],
  dialect,
});
