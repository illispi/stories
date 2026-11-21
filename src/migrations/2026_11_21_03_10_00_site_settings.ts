import type { Kysely } from "kysely";
import { sql } from "kysely";

// Site-wide settings set from the admin panel, e.g. the "backup restored" notice.
export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable("site_settings")
		.addColumn("key", "text", (c) => c.primaryKey())
		.addColumn("value", "jsonb", (c) => c.notNull())
		.addColumn("updated_at", "timestamptz", (c) => c.notNull().defaultTo(sql`now()`))
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable("site_settings").execute();
}
