import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type Dimension, findDimension, MIN_GROUP, rowAnswered, rowMatches } from "~/data/explore";
import { cachedStats } from "~/server/statsCache";
import { publicProcedure } from "../../utils";

type Row = Record<string, unknown>;

const tally = (dim: Dimension, rows: Row[]) => {
	const answered = rows.filter((r) => rowAnswered(dim, r));
	return {
		answered: answered.length,
		counts: Object.fromEntries(
			dim.options.map((o) => [o.value, answered.filter((r) => rowMatches(dim, r, o.value)).length]),
		) as Record<string, number>,
	};
};

/**
 * Cross-filter explorer: how did people who gave one answer (`filter` = `answer`) answer
 * another question (`target`), next to everyone. Real data only counts accepted answers.
 *
 * Privacy (real data): if any answer group of the filter question has 1 to MIN_GROUP-1 people
 * who answered the target, no group is shown for this pair. Hiding only the small group isn't
 * enough: its answers could be worked out as "everyone" minus the other groups.
 */
export const crossFilter = publicProcedure
	.input(
		z.object({
			pOrT: z.enum(["Personal_questions", "Their_questions"]),
			fake: z.enum(["real", "fake"]),
			filter: z.string().max(100),
			answer: z.string().max(100),
			target: z.string().max(100),
		}),
	)
	.query(({ input, ctx }) => {
		const filter = findDimension(input.pOrT, input.filter);
		const target = findDimension(input.pOrT, input.target);
		if (!filter || !target || !filter.options.some((o) => o.value === input.answer)) {
			throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown question or answer" });
		}
		if (filter.key === target.key) {
			throw new TRPCError({ code: "BAD_REQUEST", message: "Pick two different questions" });
		}

		return cachedStats(`cross:${JSON.stringify(input)}`, async () => {
			// Column names come from the question lists above, never from the request
			const columns = [...new Set([...filter.columns, ...target.columns])];
			const { ref } = ctx.db.dynamic;
			const rows = (
				input.fake === "fake"
					? await ctx.db
							.selectFrom(`${input.pOrT}_fake`)
							.select(columns.map((c) => ref(c)))
							.execute()
					: await ctx.db
							.selectFrom(input.pOrT)
							.select(columns.map((c) => ref(c)))
							.where("accepted", "=", true)
							.execute()
			) as Row[];

			const answeredIn = (value: string) =>
				rows.filter((r) => rowMatches(filter, r, value) && rowAnswered(target, r)).length;
			const groupTally = tally(target, rows.filter((r) => rowMatches(filter, r, input.answer)));
			const ownTooSmall = groupTally.answered < MIN_GROUP;
			const otherTooSmall = filter.options.some((o) => {
				if (o.value === input.answer) return false;
				const n = answeredIn(o.value);
				return n > 0 && n < MIN_GROUP;
			});
			const hidden = input.fake === "real" && (ownTooSmall || otherTooSmall);

			return {
				group: hidden ? null : groupTally,
				/** Why `group` is null: this group, or another answer's group, is still too small */
				hiddenReason: !hidden ? null : ownTooSmall ? ("group" as const) : ("other" as const),
				/** Answers in the chosen group so far */
				groupAnswered: groupTally.answered,
				everyone: tally(target, rows),
				minGroup: MIN_GROUP,
			};
		});
	});
