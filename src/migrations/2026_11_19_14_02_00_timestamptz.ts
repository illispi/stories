import type { Kysely } from "kysely";
import { sql } from "kysely";

// created_at/updated_at were `timestamp without time zone`, filled by NOW() on a UTC
// server; node-postgres then parsed them as local time, shifting them by the
// client's UTC offset. Store them as timestamptz instead. Existing values are UTC.
const tables = [
	"Personal_questions",
	"Their_questions",
	"Personal_questions_fake",
	"Their_questions_fake",
	"Articles",
];
const columns = ["created_at", "updated_at"];

export async function up(db: Kysely<any>): Promise<void> {
	for (const table of tables) {
		for (const column of columns) {
			await sql`ALTER TABLE ${sql.table(table)} ALTER COLUMN ${sql.ref(column)} TYPE timestamptz USING ${sql.ref(column)} AT TIME ZONE 'UTC'`.execute(db);
		}
	}
}

export async function down(db: Kysely<any>): Promise<void> {
	for (const table of tables) {
		for (const column of columns) {
			await sql`ALTER TABLE ${sql.table(table)} ALTER COLUMN ${sql.ref(column)} TYPE timestamp USING ${sql.ref(column)} AT TIME ZONE 'UTC'`.execute(db);
		}
	}
}
