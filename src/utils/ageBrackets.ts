/**
 * Age groups for the "Age of responses" charts, youngest first. Shared by the server
 * (counting) and the chart labels, so both always use the same groups.
 */
export const AGE_BRACKETS = [
	{ label: "under 18", max: 17 },
	{ label: "18-24", max: 24 },
	{ label: "25-34", max: 34 },
	{ label: "35-44", max: 44 },
	{ label: "45-54", max: 54 },
	{ label: "55-64", max: 64 },
	{ label: "65+", max: Number.POSITIVE_INFINITY },
] as const;

/** Count ages per group: `{ "under 18": n, "18-24": n, ... }`, in group order. */
export const countAgeBrackets = (ages: number[]) => {
	const counts: Record<string, number> = Object.fromEntries(AGE_BRACKETS.map((b) => [b.label, 0]));
	for (const age of ages) {
		const bracket = AGE_BRACKETS.find((b) => age <= b.max);
		if (bracket) counts[bracket.label]++;
	}
	return counts;
};
