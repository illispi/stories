// Runs outside Astro (via tsx), so it reads .env with dotenv instead of astro:env.
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { FileMigrationProvider, Kysely, Migrator, PostgresDialect } from "kysely";
import pg from "pg";

const migrationFolder = fileURLToPath(new URL("../migrations", import.meta.url));

async function migrate(args: string[]) {
	const db = new Kysely<unknown>({
		log: ["error"],
		dialect: new PostgresDialect({
			pool: new pg.Pool({
				host: process.env.PSQL_HOST,
				database: process.env.PSQL_DATABASE,
				password: process.env.PSQL_PASSWORD,
				user: process.env.PSQL_USERNAME,
				port: Number(process.env.PSQL_PORT ?? 5432),
			}),
		}),
	});

	const migrator = new Migrator({
		db,
		provider: new FileMigrationProvider({ fs, path, migrationFolder }),
	});

	// `down` rolls back one migration per run
	const { error, results } =
		args[0] === "down" ? await migrator.migrateDown() : await migrator.migrateToLatest();

	for (const it of results ?? []) {
		if (it.status === "Success") {
			console.log(`migration "${it.migrationName}" (${it.direction}) executed successfully`);
		} else if (it.status === "Error") {
			console.error(`failed to execute migration "${it.migrationName}"`);
		}
	}

	await db.destroy();

	if (error) {
		console.error("failed to migrate");
		console.error(error);
		process.exit(1);
	}
}

migrate(process.argv.slice(2));
