import type { Kysely } from "kysely";
import { sql } from "kysely";

// "Why or why not are you satisfied with life?" is answered by everyone now, whatever the
// yes/no answer. Real submissions keep what they have (people can add it in Your data);
// fake rows that answered "no" get a sample text so the fake results look like real ones.
const samples = [
	"Some days are good, some are hard. Treatment and routines help.",
	"Not really yet. I'm still working on finding things I enjoy again.",
	"Mostly yes. Having people around me who understand makes the difference.",
	"I'm less satisfied than before the illness, but it's slowly getting better.",
];

export async function up(db: Kysely<any>): Promise<void> {
	const pick = sql.raw(`(ARRAY[${samples.map((t) => `'${t.replaceAll("'", "''")}'`).join(", ")}])[floor(random() * ${samples.length})::int + 1]`);
	await sql`UPDATE "Personal_questions_fake" SET life_satisfaction_description = ${pick} WHERE life_satisfaction_description IS NULL`.execute(db);
}

export async function down(): Promise<void> {
	// Nothing to undo: the old rule only required the text when the answer was "yes".
}
