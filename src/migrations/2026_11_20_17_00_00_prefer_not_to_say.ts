import type { Kysely } from "kysely";
import { sql } from "kysely";

// "Prefer not to say" on sensitive questions (src/data/sensitiveQuestions.ts): those answers
// may now be null, and `declined` lists the questions a person chose not to answer.
const personal = ["cannabis", "suicidal_thoughts", "partner", "friends", "children", "lost_relationships"];
const their = ["cannabis", "suicide_attempts", "lost_relationships"]; // partner/friends/children already allow null

export async function up(db: Kysely<any>): Promise<void> {
	for (const column of personal) {
		await db.schema.alterTable("Personal_questions").alterColumn(column, (c) => c.dropNotNull()).execute();
	}
	// Required an answer about attempts whenever suicidal thoughts were reported; that answer can
	// now be declined. The server checks the rule instead (personalQuestionsSchema).
	await sql`ALTER TABLE "Personal_questions" DROP CONSTRAINT IF EXISTS "Personal_questions_suicide_attempts_check"`.execute(db);
	for (const column of their) {
		await db.schema.alterTable("Their_questions").alterColumn(column, (c) => c.dropNotNull()).execute();
	}
	for (const table of ["Personal_questions", "Their_questions"]) {
		await db.schema
			.alterTable(table)
			.addColumn("declined", sql`text[]`, (c) => c.notNull().defaultTo(sql`'{}'::text[]`))
			.execute();
	}
}

export async function down(db: Kysely<any>): Promise<void> {
	for (const table of ["Personal_questions", "Their_questions"]) {
		await db.schema.alterTable(table).dropColumn("declined").execute();
	}
	// Restoring NOT NULL fails if declined (null) answers exist; delete or fill those first.
	for (const column of personal) {
		await db.schema.alterTable("Personal_questions").alterColumn(column, (c) => c.setNotNull()).execute();
	}
	for (const column of their) {
		await db.schema.alterTable("Their_questions").alterColumn(column, (c) => c.setNotNull()).execute();
	}
}
