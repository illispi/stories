import type { Kysely } from "kysely";
import { sql } from "kysely";

// Four questions added to both polls. Nullable: rows submitted before this migration
// don't have answers. New submissions always answer them (every respondent sees them).
const tables = ["Personal_questions", "Their_questions", "Personal_questions_fake", "Their_questions_fake"];

const SCHOOL = ["really poorly", "bad", "average", "good", "great"];
const EXERCISE = ["no exercise", "little", "moderately", "lots of exercise"];

const inList = (column: string, values: string[]) =>
	sql`${sql.ref(column)} in (${sql.join(values.map((v) => sql.lit(v)))})`;

export async function up(db: Kysely<any>): Promise<void> {
	for (const table of tables) {
		await db.schema
			.alterTable(table)
			.addColumn("symptom_free_on_meds", "boolean")
			.addColumn("how_it_altered_life", "text")
			.addColumn("school_performance", "text", (col) => col.check(inList("school_performance", SCHOOL)))
			.addColumn("exercise", "text", (col) => col.check(inList("exercise", EXERCISE)))
			.execute();
	}

	// Give the existing fake rows answers too, so the fake results show the new charts.
	const pick = (values: string[]) =>
		sql`(${sql.raw(`ARRAY[${values.map((v) => `'${v}'`).join(", ")}]`)})[floor(random() * ${values.length})::int + 1]`;
	const sampleTexts = [
		"I had to change my plans for studies and work, but I found new things to care about.",
		"Relationships got harder for a while. Things are more stable now with treatment.",
		"It slowed everything down. Small daily routines helped the most.",
		"Lost some friends, gained a better understanding of myself and what I need.",
	];
	for (const table of ["Personal_questions_fake", "Their_questions_fake"]) {
		await sql`UPDATE ${sql.table(table)} SET
			symptom_free_on_meds = random() < 0.5,
			how_it_altered_life = ${pick(sampleTexts)},
			school_performance = ${pick(SCHOOL)},
			exercise = ${pick(EXERCISE)}`.execute(db);
	}
}

export async function down(db: Kysely<any>): Promise<void> {
	for (const table of tables) {
		await db.schema
			.alterTable(table)
			.dropColumn("symptom_free_on_meds")
			.dropColumn("how_it_altered_life")
			.dropColumn("school_performance")
			.dropColumn("exercise")
			.execute();
	}
}
