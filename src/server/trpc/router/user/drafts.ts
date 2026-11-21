import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { isDraftKey, MAX_DRAFT_SIZE } from "~/data/pollDraft";
import { userProcedure } from "../../utils";

const poll = z.enum(["personalQuestions", "theirQuestions"]);

/** The signed-in user's saved progress for one poll, or null. */
export const getDraft = userProcedure.input(z.object({ poll })).query(async ({ ctx, input }) => {
	const row = await ctx.db
		.selectFrom("poll_drafts")
		.select(["data", "updated_at"])
		.where("user", "=", ctx.user.id)
		.where("poll", "=", input.poll)
		.executeTakeFirst();
	return row ? { data: row.data as Record<string, string>, updatedAt: new Date(row.updated_at).getTime() } : null;
});

/** Save (replace) the progress for one poll: the poll store's entries as strings. */
export const saveDraft = userProcedure
	.input(z.object({ poll, data: z.record(z.string().max(100), z.string().max(MAX_DRAFT_SIZE)) }))
	.mutation(async ({ ctx, input }) => {
		const keys = Object.keys(input.data);
		if (keys.length > 100 || keys.some((k) => !isDraftKey(input.poll, k))) {
			throw new TRPCError({ code: "BAD_REQUEST", message: "Unexpected progress data" });
		}
		if (JSON.stringify(input.data).length > MAX_DRAFT_SIZE) {
			throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Progress is too large to save" });
		}
		const now = new Date();
		await ctx.db
			.insertInto("poll_drafts")
			.values({ user: ctx.user.id, poll: input.poll, data: JSON.stringify(input.data), updated_at: now })
			.onConflict((oc) => oc.columns(["user", "poll"]).doUpdateSet({ data: JSON.stringify(input.data), updated_at: now }))
			.execute();
		return { updatedAt: now.getTime() };
	});

export const deleteDraft = userProcedure.input(z.object({ poll })).mutation(async ({ ctx, input }) => {
	await ctx.db.deleteFrom("poll_drafts").where("user", "=", ctx.user.id).where("poll", "=", input.poll).execute();
	return true;
});

/** Drafts of the signed-in user (Your data). */
export const listDrafts = userProcedure.query(async ({ ctx }) =>
	(
		await ctx.db
			.selectFrom("poll_drafts")
			.select(["poll", "data", "updated_at"])
			.where("user", "=", ctx.user.id)
			.execute()
	).map((r) => {
		const data = r.data as Record<string, string>;
		const page = Number(data[`page_${r.poll}`] ?? 0);
		return { poll: r.poll as "personalQuestions" | "theirQuestions", page: Number.isFinite(page) ? page : 0, updatedAt: new Date(r.updated_at).getTime() };
	}),
);
