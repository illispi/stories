import type { Kysely } from "kysely";
import { sql } from "kysely";

// "Helpful" votes on published articles: one per signed-in user and article.
export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable("article_votes")
		.addColumn("article_id", "integer", (c) => c.notNull().references("Articles.id").onDelete("cascade"))
		.addColumn("user", "text", (c) => c.notNull().references("auth_user.id").onDelete("cascade"))
		.addColumn("created_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
		.addPrimaryKeyConstraint("article_votes_pkey", ["article_id", "user"])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable("article_votes").execute();
}
