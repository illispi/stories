/**
 * Questions people may decline ("Prefer not to say"). A declined answer is stored as null with
 * the question's key in the row's `declined` list, so it's told apart from a question that was
 * skipped by an earlier answer.
 */
export const SENSITIVE = {
	Personal_questions: [
		"cannabis",
		"suicidal_thoughts",
		"suicide_attempts",
		"partner",
		"friends",
		"children",
		"lost_relationships",
	],
	Their_questions: ["cannabis", "suicide_attempts", "partner", "friends", "children", "lost_relationships"],
} as const;

export type SensitivePoll = keyof typeof SENSITIVE;

export const LS_POLL: Record<"personalQuestions" | "theirQuestions", SensitivePoll> = {
	personalQuestions: "Personal_questions",
	theirQuestions: "Their_questions",
};

export const isSensitive = (poll: SensitivePoll, key: string) => (SENSITIVE[poll] as readonly string[]).includes(key);

export const PREFER_NOT_LABEL = "Prefer not to say";

/** Server rule: null ⇔ declined, except where an earlier answer legitimately skips the question. */
export const declinedConsistent = (
	poll: SensitivePoll,
	data: Record<string, unknown> & { declined?: string[] },
	/** Keys that may also be null because an earlier answer skipped them */
	skippable: (key: string) => boolean = () => false,
) => {
	const declined = data.declined ?? [];
	return SENSITIVE[poll].every((key) => {
		const value = data[key];
		if (declined.includes(key)) return value === null || value === undefined;
		return (value !== null && value !== undefined) || skippable(key);
	});
};
