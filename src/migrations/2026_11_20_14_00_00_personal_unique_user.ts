import type { Kysely } from "kysely";
import { sql } from "kysely";

// One personal poll per account. Before adding the constraint, extra rows from the same
// account are removed, keeping each account's first submission. Only dev "Fake data" bulk
// inserts (or a double-submit race) could have created them.
export async function up(db: Kysely<any>): Promise<void> {
	const removed = await sql`
		DELETE FROM "Personal_questions" p
		USING "Personal_questions" q
		WHERE p."user" = q."user" AND p.id > q.id
	`.execute(db);
	if (removed.numAffectedRows) {
		console.log(`Removed ${removed.numAffectedRows} duplicate personal poll rows`);
	}

	await db.schema
		.alterTable("Personal_questions")
		.addUniqueConstraint("personal_questions_user_unique", ["user"])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable("Personal_questions").dropConstraint("personal_questions_user_unique").execute();
}
