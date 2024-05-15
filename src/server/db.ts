import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "kysely-codegen/dist/db";
import { Pool } from "pg";

export const pool = new Pool({
	host: process.env.PSQL_HOST,
	database: process.env.PSQL_DATABASE,
	password: process.env.PSQL_PASSWORD,
	user: process.env.PSQL_USERNAME,
	port: 5432,
});

const dialect = new PostgresDialect({
	pool,
});

export const db = new Kysely<DB>({
	log: ["error"],
	dialect,
});
