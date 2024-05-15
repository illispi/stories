import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "kysely-codegen/dist/db";
import { Pool } from "pg";
import { serverEnv } from "~/utils/env/server";

export const pool = new Pool({
	host: serverEnv.PSQL_HOST,
	database: serverEnv.PSQL_DATABASE,
	password: serverEnv.PSQL_PASSWORD,
	user: serverEnv.PSQL_USERNAME,
	port: 5432,
});

const dialect = new PostgresDialect({
	pool,
});

export const db = new Kysely<DB>({
	log: ["error"],
	dialect,
});
