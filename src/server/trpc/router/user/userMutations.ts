import { TRPCError } from "@trpc/server";
import { userProcedure } from "../../utils";
import { z } from "zod";
import {
	personalQuestionsSchema,
	theirQuestionsSchema,
} from "~/types/zodFromTypes";

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

export const editPersonal = userProcedure
	.input(personalQuestionsSchema)
	.mutation(async ({ ctx, input }) => {
		const updated = await ctx.db
			.updateTable("Personal_questions")
			.set({ ...input, updated_at: new Date(), accepted: null })
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
			.set({ ...input.data, updated_at: new Date(), accepted: null })
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
