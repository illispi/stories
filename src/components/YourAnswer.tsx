import { Show } from "solid-js";
import { questions as personalQuestions } from "~/data/personalQuestionsArr";
import { questions as theirQuestions } from "~/data/theirQuestionsArr";

type Poll = "Personal_questions" | "Their_questions";
type Row = Record<string, unknown>;
type AnyQuestion = {
	questionType: string;
	questionDB: string;
	multiSelect?: [string, string][];
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Charts whose `stat` isn't a question column */
const STAT_TO_QUESTION: Record<string, string> = { ageOfOnsetByGender: "age_of_onset" };

/**
 * The submitted answer to the question a chart shows, as text. null = nothing to show for this
 * chart (e.g. the "Total responses" box).
 */
export const answerText = (poll: Poll, stat: string, row: Row): string | null => {
	const key = STAT_TO_QUESTION[stat] ?? stat;
	const list = (poll === "Personal_questions" ? personalQuestions : theirQuestions) as AnyQuestion[];
	const q = list.find((x) => x.questionDB === key && x.questionType !== "submit");
	if (!q) return null;

	const skipped = "Not asked (skipped by an earlier answer)";

	if (q.questionType === "multiSelect") {
		// A "No" to the yes/no question before it skips this one (e.g. no relatives → which relatives)
		const prev = list[list.indexOf(q) - 1] as (AnyQuestion & { skip?: string }) | undefined;
		const before = prev ? row[prev.questionDB] : undefined;
		if (prev?.skip && ((prev.questionType === "yesOrNo" && before === false) || (prev.questionType === "unknown" && before !== "yes")))
			return skipped;
		const picked = (q.multiSelect ?? []).filter(([column]) => row[column] === true).map(([, label]) => label);
		return picked.length ? picked.join(", ") : "None of these";
	}

	const value = row[key];
	if (value === null || value === undefined || value === "") return skipped;
	switch (q.questionType) {
		case "yesOrNo":
			return value ? "Yes" : "No";
		case "unknown":
			return value === "unknown" ? "Don't know" : capitalize(String(value));
		case "integer":
			return key === "weight_amount" ? `${value} kg` : String(value);
		case "selection":
			return capitalize(String(value));
		default:
			return String(value);
	}
};

/** Shown under a results chart: what the signed-in user (or the person they answered about) said. */
export default function YourAnswer(props: { poll: Poll; stat: string; row: Row | null | undefined }) {
	const text = () => (props.row ? answerText(props.poll, props.stat, props.row) : null);
	return (
		<Show when={text()}>
			<div class="mx-auto mb-6 flex w-11/12 max-w-md flex-col items-center gap-1 rounded-2xl bg-fuchsia-50 px-4 py-3 text-center ring-1 ring-fuchsia-200">
				<span class="font-semibold text-fuchsia-800 text-xs uppercase tracking-wide">
					{props.poll === "Personal_questions" ? "Your answer" : "Your answer about them"}
				</span>
				<p class="whitespace-pre-line break-words">{text()}</p>
			</div>
		</Show>
	);
}
