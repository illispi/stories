import type { Kysely } from "kysely";
import { sql } from "kysely";

// Unfinished poll progress of signed-in users, so they can continue on another device.
// One draft per user and poll; deleted on submit, on "Clear answers" and with the account.
export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable("poll_drafts")
		.addColumn("user", "text", (c) => c.notNull().references("auth_user.id").onDelete("cascade"))
		.addColumn("poll", "text", (c) => c.notNull().check(sql`poll in ('personalQuestions', 'theirQuestions')`))
		.addColumn("data", "jsonb", (c) => c.notNull())
		.addColumn("updated_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
		.addPrimaryKeyConstraint("poll_drafts_pkey", ["user", "poll"])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable("poll_drafts").execute();
}
