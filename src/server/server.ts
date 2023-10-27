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
  //TODO change these two to .env
  host:
    process.env.NODE_ENV === "production"
      ? process.env.PG_SERVICE
      : "127.0.0.1", 
  database: process.env.NODE_ENV === "production" ? "stories" : "stories_dev",
  password: process.env.PSQL_PASSWORD,
  user: process.env.PSQL_USERNAME,
  port: 5433,
});

console.log("pool", pool);

const dialect = new PostgresDialect({
  pool,
});

interface Combined extends Database, DB {}

export const db = new Kysely<Combined>({
  log: ["error"],
  dialect,
});
