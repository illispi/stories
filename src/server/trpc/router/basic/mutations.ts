import {
	personalQuestionsSchema,
	theirQuestionsSchema,
} from "~/types/zodFromTypes";
import { userProcedure } from "../../utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const postPersonalStats = userProcedure
	.input(personalQuestionsSchema)
	.mutation(async ({ ctx, input }) => {
		const existsAlready = await ctx.db
			.selectFrom("Personal_questions")
			.selectAll()
			.where("user", "=", ctx.user.id)
			.executeTakeFirst();

		if (existsAlready) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Personal poll exists already",
			});
		}

		if (input.weight_amount) {
			input.weight_amount = input.systemMetric
				? input.weight_amount
				: Math.floor(input.weight_amount * 0.453);
		}

		const { systemMetric, ...rest } = input;
		const insertion = await ctx.db
			.insertInto("Personal_questions")
			.values({
				...rest,

				user: ctx.user.id,
				accepted: null,
			})
			.executeTakeFirst();

		if (!insertion) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Insertion failed",
			});
		}

		return "Added succesfully";
	});

export const postTheirStats = userProcedure
	.input(theirQuestionsSchema)
	.mutation(async ({ ctx, input }) => {
		const insertion = await ctx.db
			.insertInto("Their_questions")
			.values({
				...input,
				user: ctx.user.id,
				accepted: null,
			})
			.executeTakeFirst();

		if (!insertion) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Insertion failed",
			});
		}

		return "Added succesfully";
	});

export const postArticle = userProcedure
	.input(
		z.object({
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
	.mutation(async ({ input, ctx }) => {
		const insertion = await ctx.db
			.insertInto("Articles")
			.values({ ...input, user: ctx.user.id, accepted: null })
			.executeTakeFirst();
		if (!insertion) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Insertion failed",
			});
		}

		return "Added succesfully";
	});
