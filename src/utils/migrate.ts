// Runs outside Astro (Node's built-in TypeScript support), so it reads .env with dotenv
// instead of astro:env. Used by `pnpm migrate:latest` / `migrate:down` and by start.mjs.
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import "dotenv/config";
import { Kysely, type Migration, type MigrationProvider, Migrator, PostgresDialect } from "kysely";
import pg from "pg";

const migrationFolder = fileURLToPath(new URL("../migrations", import.meta.url));

// Kysely's FileMigrationProvider imports plain paths, which Node's ESM loader rejects on
// Windows ("Received protocol 'c:'"). Import via file:// URLs instead.
const fileUrlMigrationProvider: MigrationProvider = {
	async getMigrations() {
		const migrations: Record<string, Migration> = {};
		for (const file of (await fs.readdir(migrationFolder)).sort()) {
			if (!/\.(ts|js|mjs)$/.test(file) || file.endsWith(".d.ts")) continue;
			const mod = await import(pathToFileURL(path.join(migrationFolder, file)).href);
			migrations[file.replace(/\.(ts|js|mjs)$/, "")] = mod;
		}
		return migrations;
	},
};

/** Apply all pending migrations (or roll back one with "down"). Throws if one fails. */
export async function migrate(args: string[] = []) {
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
		provider: fileUrlMigrationProvider,
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
		throw error;
	}
}

// Run directly (node ./src/utils/migrate.ts [down]); start.mjs imports migrate() instead
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
	migrate(process.argv.slice(2)).catch((error) => {
		console.error(error);
		process.exit(1);
	});
}
