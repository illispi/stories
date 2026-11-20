import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type Dimension, findDimension, MIN_GROUP, rowAnswered, rowMatches } from "~/data/explore";
import { tooSmall } from "~/server/privacy";
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
 * Privacy (real data, see src/server/privacy.ts): among people who answered the target, these
 * groups must each have 0 or at least MIN_GROUP people, or nothing is shown for this pair:
 * - each answer's group ("Yes"), and everyone else ("not Yes": covers multi-choice filters,
 *   where the groups overlap)
 * - people who weren't asked the filter question (skipped), who are in "everyone" but in no
 *   answer group
 * Otherwise a small group's answers could be worked out as "everyone" minus the other groups.
 * A hidden result gives no counts, since even "2 people answered" can reveal something.
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

			const groupTally = tally(target, rows.filter((r) => rowMatches(filter, r, input.answer)));

			if (input.fake === "real") {
				const answeredTarget = rows.filter((r) => rowAnswered(target, r));
				const size = (pred: (r: Row) => boolean) => answeredTarget.filter(pred).length;
				const ownTooSmall = tooSmall(groupTally.answered) || groupTally.answered === 0;
				const otherTooSmall =
					tooSmall(size((r) => !rowAnswered(filter, r))) ||
					filter.options.some(
						(o) => tooSmall(size((r) => rowMatches(filter, r, o.value))) || tooSmall(size((r) => !rowMatches(filter, r, o.value))),
					);
				if (ownTooSmall || otherTooSmall) {
					return {
						group: null,
						hiddenReason: ownTooSmall ? ("group" as const) : ("other" as const),
						everyone: tally(target, rows),
						minGroup: MIN_GROUP,
					};
				}
			}

			return { group: groupTally, hiddenReason: null, everyone: tally(target, rows), minGroup: MIN_GROUP };
		});
	});
