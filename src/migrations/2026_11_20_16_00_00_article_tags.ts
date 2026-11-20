import type { Kysely } from "kysely";
import { sql } from "kysely";

// Topics for articles (keys from src/data/articleTags.ts). Existing articles start untagged.
export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable("Articles")
		.addColumn("tags", sql`text[]`, (col) => col.notNull().defaultTo(sql`'{}'::text[]`))
		.execute();
	// Filtering by topic uses "tags @> ARRAY[...]"
	await sql`CREATE INDEX articles_tags_idx ON "Articles" USING gin (tags)`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	await sql`DROP INDEX IF EXISTS articles_tags_idx`.execute(db);
	await db.schema.alterTable("Articles").dropColumn("tags").execute();
}
