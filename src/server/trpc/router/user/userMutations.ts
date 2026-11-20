import { TRPCError } from "@trpc/server";
import { userProcedure } from "../../utils";

/** `systemMetric` is a form-only field, not a DB column. */
const withoutSystemMetric = <T extends { systemMetric?: boolean }>({ systemMetric: _systemMetric, ...rest }: T) => rest;
import { z } from "zod";
import { personalQuestionsSchema, theirQuestionsSchema } from "~/types/zodFromTypes";

export const removeAccountAndData = userProcedure.mutation(async ({ ctx }) => {
	const deletion = await ctx.db
		.deleteFrom("auth_user")
		.where("id", "=", ctx.user.id)
		.executeTakeFirst();

	if (!deletion) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Deletion failed",
		});
	}

	return "Deleted succesfully";
});

export const removePersonal = userProcedure.mutation(async ({ ctx }) => {
	const deletion = await ctx.db
		.deleteFrom("Personal_questions")
		.where("user", "=", ctx.user.id)
		.executeTakeFirst();

	if (!deletion) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Deletion failed",
		});
	}

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

		if (!deletion) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Deletion failed",
			});
		}

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

		if (!deletion) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Deletion failed",
			});
		}

		return "Deleted succesfully";
	});

/** Same rules as postArticle. An edited article goes back to review. */
export const editArticle = userProcedure
	.input(
		z.object({
			id: z.number(),
			link: z
				.string()
				.max(1000, { message: "Must be 1000 or fewer characters long" })
				.min(5, { message: "Must be 5 or more characters long" })
				.trim(),
			description: z
				.string()
				.max(500, { message: "Must be 500 or fewer characters long" })
				.min(5, { message: "Must be 5 or more characters long" })
				.trim(),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const updated = await ctx.db
			.updateTable("Articles")
			.set({
				link: input.link,
				description: input.description,
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

		if (!updated) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Update failed",
			});
		}

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

		if (!updated) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Update failed",
			});
		}

		return "Updated succesfully";
	});

export const markRead = userProcedure.mutation(async ({ ctx }) => {
	const markReadPersonal = await ctx.db
		.updateTable("Personal_questions")
		.set({
			seen: true,
		})
		.where("user", "=", ctx.user.id)
		.executeTakeFirst();

	const markReadTheir = await ctx.db
		.updateTable("Their_questions")
		.set({
			seen: true,
		})
		.where("user", "=", ctx.user.id)
		.execute();

	const markReadArticles = await ctx.db
		.updateTable("Articles")
		.set({
			seen: true,
		})
		.where("user", "=", ctx.user.id)
		.execute();

	if (markReadPersonal && markReadTheir && markReadArticles) {
		return true;
	}
	throw new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: "Update failed",
	});
});
