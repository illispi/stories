import type { Kysely } from "kysely";
import { sql } from "kysely";

// Articles have one topic now. Articles tagged with several keep their first one.
export async function up(db: Kysely<any>): Promise<void> {
	await sql`UPDATE "Articles" SET tags = tags[1:1] WHERE cardinality(tags) > 1`.execute(db);
}

export async function down(): Promise<void> {
	// The removed extra topics can't be restored.
}
