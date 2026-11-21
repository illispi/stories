import type { Kysely } from "kysely";
import { sql } from "kysely";

// The "Did your life goals change?" / "How did your life goals change?" pair was removed
// from the personal poll. Dropping the columns also drops their check constraint.
const tables = ["Personal_questions", "Personal_questions_fake"];

export async function up(db: Kysely<any>): Promise<void> {
	for (const table of tables) {
		await db.schema.alterTable(table).dropColumn("goals_after").dropColumn("goals_changed").execute();
	}
}

// The answers are gone; down only restores the columns (goals_changed = false).
export async function down(db: Kysely<any>): Promise<void> {
	for (const table of tables) {
		await db.schema
			.alterTable(table)
			.addColumn("goals_changed", "boolean", (col) => col.notNull().defaultTo(false))
			.addColumn("goals_after", "text", (col) => col.check(sql`NOT (goals_changed AND goals_after IS NULL)`))
			.execute();
	}
}
