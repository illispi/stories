/**
 * Questions the explorer can filter by and chart, built from the poll question lists.
 * Shared by the server (counting) and the page (pickers, labels), so both agree on keys,
 * options and how an answer is matched.
 */
import { AGE_BRACKETS } from "~/utils/ageBrackets";
import { questions as personalQuestions } from "./personalQuestionsArr";
import { questions as theirQuestions } from "./theirQuestionsArr";

export type ExplorePoll = "Personal_questions" | "Their_questions";

export type ExploreOption = { value: string; label: string };

export type Dimension = {
	key: string;
	question: string;
	kind: "yesOrNo" | "selection" | "unknown" | "multiSelect" | "age";
	options: ExploreOption[];
	/** DB columns this question reads */
	columns: string[];
};

type AnyQuestion = {
	question: string;
	questionType: string;
	questionDB: string;
	selections?: string[];
	multiSelect?: [string, string][];
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const toDimension = (q: AnyQuestion): Dimension | null => {
	const base = { key: q.questionDB, question: q.question.trim().replace(/\s*\?*$/, "?") };
	switch (q.questionType) {
		case "yesOrNo":
			return {
				...base,
				kind: "yesOrNo",
				options: [
					{ value: "true", label: "Yes" },
					{ value: "false", label: "No" },
				],
				columns: [q.questionDB],
			};
		case "unknown":
			return {
				...base,
				kind: "unknown",
				options: ["yes", "no", "unknown"].map((v) => ({ value: v, label: v === "unknown" ? "Don't know" : capitalize(v) })),
				columns: [q.questionDB],
			};
		case "selection":
			return {
				...base,
				kind: "selection",
				options: (q.selections ?? []).map((v) => ({ value: v, label: capitalize(v) })),
				columns: [q.questionDB],
			};
		case "multiSelect":
			return {
				...base,
				kind: "multiSelect",
				options: (q.multiSelect ?? []).map(([column, label]) => ({ value: column, label })),
				columns: (q.multiSelect ?? []).map(([column]) => column),
			};
		case "integer":
			// Ages are grouped; weight gain isn't comparable enough to be useful here
			return q.questionDB === "current_age" || q.questionDB === "age_of_onset"
				? {
						...base,
						kind: "age",
						options: AGE_BRACKETS.map((b) => ({ value: b.label, label: b.label })),
						columns: [q.questionDB],
					}
				: null;
		default:
			return null;
	}
};

const build = (questions: AnyQuestion[]) =>
	questions.map(toDimension).filter((d): d is Dimension => d !== null);

export const exploreDimensions: Record<ExplorePoll, Dimension[]> = {
	Personal_questions: build(personalQuestions as AnyQuestion[]),
	Their_questions: build(theirQuestions as AnyQuestion[]),
};

export const findDimension = (poll: ExplorePoll, key: string | undefined | null) =>
	exploreDimensions[poll].find((d) => d.key === key);

/** Starting point: does exercise go with life satisfaction (personal) / happiness (relatives)? */
export const defaultExplore: Record<ExplorePoll, { filter: string; answer: string; target: string }> = {
	Personal_questions: { filter: "exercise", answer: "lots of exercise", target: "life_satisfaction" },
	Their_questions: { filter: "exercise", answer: "lots of exercise", target: "happy" },
};

type Row = Record<string, unknown>;

const ageBracket = (age: unknown) =>
	typeof age === "number" ? AGE_BRACKETS.find((b) => age <= b.max)?.label : undefined;

/** Did this row give `value` as its answer? (For multiSelect: was that option ticked?) */
export const rowMatches = (dim: Dimension, row: Row, value: string) => {
	const column = dim.columns[0];
	switch (dim.kind) {
		case "yesOrNo":
			return row[column] === (value === "true");
		case "multiSelect":
			return row[value] === true;
		case "age":
			return ageBracket(row[column]) === value;
		default:
			return row[column] === value;
	}
};

/** Did this row answer the question at all? Skipped follow-up questions are null. */
export const rowAnswered = (dim: Dimension, row: Row) =>
	dim.kind === "multiSelect"
		? dim.columns.some((c) => row[c] === true)
		: dim.kind === "age"
			? typeof row[dim.columns[0]] === "number"
			: row[dim.columns[0]] !== null && row[dim.columns[0]] !== undefined;

/** Real data: a group must have at least this many answers before its numbers are shown. */
export const MIN_GROUP = 5;
