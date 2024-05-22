import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "kysely-codegen/dist/db";
import pkg from "pg";
import { env } from "~/utils/env";
const { Pool } = pkg;

export const pool = new Pool({
	host: env.PSQL_HOST,
	database: env.PSQL_DATABASE,
	password: env.PSQL_PASSWORD,
	user: env.PSQL_USERNAME,
	port: 5432,
});

const dialect = new PostgresDialect({
	pool,
});

export const db = new Kysely<DB>({
	log: ["error"],
	dialect,
});
