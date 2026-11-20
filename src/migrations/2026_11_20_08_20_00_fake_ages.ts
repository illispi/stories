import type { Kysely } from "kysely";
import { sql } from "kysely";

// Fake rows had ages spread evenly over 5-110 (average onset ~58). Re-roll them with the
// same shape the fake generator now uses (src/utils/faker/fakeAge.ts): current age 16-75
// and onset 13-40, both most often mid-range, onset never after current age. Real data is
// not touched.
const tables = ["Personal_questions_fake", "Their_questions_fake"];

export async function up(db: Kysely<any>): Promise<void> {
	for (const table of tables) {
		await sql`UPDATE ${sql.table(table)} SET current_age = round(16 + (random() + random()) / 2 * 59)`.execute(db);
		await sql`UPDATE ${sql.table(table)} SET age_of_onset = least(round(13 + (random() + random()) / 2 * 27), current_age)`.execute(db);
	}
}

export async function down(): Promise<void> {
	// Fake data only; the old random ages aren't worth restoring.
}
