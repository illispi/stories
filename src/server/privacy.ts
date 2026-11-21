/**
 * Small-group protection for real data. Answers are anonymous, but a statistic about one to
 * four people can reveal what those people answered, especially when it can be combined with
 * other statistics. Fake data is never restricted.
 *
 * The rule: a view is shown only if no group it could be combined with has 1 to MIN_GROUP-1
 * people. Hiding just the small group isn't enough, because "everyone" minus the other groups
 * gives it back.
 */
import type { Kysely } from "kysely";
import { MIN_GROUP } from "~/data/explore";
import type { DB } from "~/types/db";

export { MIN_GROUP };

export const tooSmall = (n: number) => n > 0 && n < MIN_GROUP;

export type Cell = { gender: string; diagnosis: string; n: number };

/** Accepted respondents per gender × diagnosis. */
export const respondentCells = async (
	db: Kysely<DB>,
	table: "Personal_questions" | "Their_questions",
): Promise<Cell[]> => {
	const rows = await db
		.selectFrom(table)
		.select((eb) => ["gender", "diagnosis", eb.fn.countAll<number>().as("n")])
		.where("accepted", "=", true)
		.groupBy(["gender", "diagnosis"])
		.execute();
	return rows.map((r) => ({ gender: String(r.gender), diagnosis: String(r.diagnosis), n: Number(r.n) }));
};

const sums = (cells: Cell[], key: "gender" | "diagnosis") => {
	const totals = new Map<string, number>();
	for (const c of cells) totals.set(c[key], (totals.get(c[key]) ?? 0) + c.n);
	return [...totals.values()];
};

/** No non-empty gender × diagnosis cell is too small. */
export const allCellsSafe = (cells: Cell[]) => !cells.some((c) => tooSmall(c.n));

/**
 * May aggregate statistics for this gender and/or diagnosis filter be shown?
 * - no filter: the total must not be too small
 * - diagnosis only: every diagnosis group (else "all" minus the others gives it)
 * - gender only: every gender group
 * - both: every gender × diagnosis cell (else "male" minus "male, schizophrenia" gives
 *   "male, schizoaffective")
 */
export const aggregateViewAllowed = (cells: Cell[], gender: string | null, diagnosis: string | null) => {
	if (gender && diagnosis) return allCellsSafe(cells);
	if (gender) return !sums(cells, "gender").some(tooSmall);
	if (diagnosis) return !sums(cells, "diagnosis").some(tooSmall);
	return !tooSmall(cells.reduce((a, c) => a + c.n, 0));
};

/** Respondents matching the filter (for "x/5" progress messages). */
export const matching = (cells: Cell[], gender: string | null, diagnosis: string | null) =>
	cells
		.filter((c) => (!gender || c.gender === gender) && (!diagnosis || c.diagnosis === diagnosis))
		.reduce((a, c) => a + c.n, 0);
