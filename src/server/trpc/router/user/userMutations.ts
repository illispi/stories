import { TRPCError } from "@trpc/server";
import { userProcedure } from "../../utils";

const notFound = (what: string) => new TRPCError({ code: "NOT_FOUND", message: `${what} not found` });

/** `systemMetric` is a form-only field, not a DB column. */
const withoutSystemMetric = <T extends { systemMetric?: boolean }>({ systemMetric: _systemMetric, ...rest }: T) => rest;
import { z } from "zod";
import { clearStatsCache } from "~/server/statsCache";
import { articleFields } from "~/server/schemas/articleSchema";
import { personalQuestionsSchema, theirQuestionsSchema } from "~/types/zodFromTypes";

export const removeAccountAndData = userProcedure.mutation(async ({ ctx }) => {
	const deletion = await ctx.db
		.deleteFrom("auth_user")
		.where("id", "=", ctx.user.id)
		.executeTakeFirst();

	if (!deletion.numDeletedRows) throw notFound("Account");
	clearStatsCache();

	return "Deleted succesfully";
});

export const removePersonal = userProcedure.mutation(async ({ ctx }) => {
	const deletion = await ctx.db
		.deleteFrom("Personal_questions")
		.where("user", "=", ctx.user.id)
		.executeTakeFirst();

	if (!deletion.numDeletedRows) throw notFound("Personal poll");
	clearStatsCache();

	return "Deleted succesfully";
});

export const removeTheir = userProcedure
	.input(z.object({ id: z.number() }))
	.mutation(async ({ ctx, input }) => {
		const deletion = await ctx.db
			.deleteFrom("Their_questions")
			.where("user", "=", ctx.user.id)
			.where("id", "=", input.id)
			.executeTakeFirst();

		if (!deletion.numDeletedRows) throw notFound("Submission");
		clearStatsCache();

		return "Deleted succesfully";
	});

export const removeArticle = userProcedure
	.input(z.object({ id: z.number() }))
	.mutation(async ({ ctx, input }) => {
		const deletion = await ctx.db
			.deleteFrom("Articles")
			.where("user", "=", ctx.user.id)
			.where("id", "=", input.id)
			.executeTakeFirst();

		if (!deletion.numDeletedRows) throw notFound("Article");
		clearStatsCache();

		return "Deleted succesfully";
	});

/** Same rules as postArticle. An edited article goes back to review. */
export const editArticle = userProcedure
	.input(z.object({ id: z.number(), ...articleFields }))
	.mutation(async ({ ctx, input }) => {
		const updated = await ctx.db
			.updateTable("Articles")
			.set({
				link: input.link,
				description: input.description,
				tags: input.tags,
				updated_at: new Date(),
				accepted: null,
				decline_reason: null,
				seen: true,
			})
			.where("user", "=", ctx.user.id)
			.where("id", "=", input.id)
			.executeTakeFirst();

		if (!updated.numUpdatedRows) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Article not found",
			});
		}

		return "Updated succesfully";
	});

export const editPersonal = userProcedure
	.input(personalQuestionsSchema)
	.mutation(async ({ ctx, input }) => {
		const updated = await ctx.db
			.updateTable("Personal_questions")
			.set({ ...withoutSystemMetric(input), updated_at: new Date(), accepted: null, seen: true })
			.where("user", "=", ctx.user.id)
			.executeTakeFirst();

		if (!updated.numUpdatedRows) throw notFound("Personal poll");
		// An edit sends the entry back to review, so it drops out of the stats
		clearStatsCache();

		return "Updated succesfully";
	});

export const editTheir = userProcedure
	.input(z.object({ data: theirQuestionsSchema, id: z.number() }))
	.mutation(async ({ ctx, input }) => {
		const updated = await ctx.db
			.updateTable("Their_questions")
			.set({ ...input.data, updated_at: new Date(), accepted: null, seen: true })
			.where("user", "=", ctx.user.id)
			.where("id", "=", input.id)
			.executeTakeFirst();

		if (!updated.numUpdatedRows) throw notFound("Submission");
		// An edit sends the entry back to review, so it drops out of the stats
		clearStatsCache();

		return "Updated succesfully";
	});

export const markRead = userProcedure.mutation(async ({ ctx }) => {
	for (const table of ["Personal_questions", "Their_questions", "Articles"] as const) {
		await ctx.db.updateTable(table).set({ seen: true }).where("user", "=", ctx.user.id).execute();
	}
	return true;
});
