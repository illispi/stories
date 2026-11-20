import { personalQuestionsSchema, theirQuestionsSchema } from "~/types/zodFromTypes";
import { userProcedure } from "../../utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { onsetNotAfterAge, ONSET_AFTER_AGE_MESSAGE } from "~/server/schemas/ageRule";
import { articleFields } from "~/server/schemas/articleSchema";

/** Postgres unique_violation: Personal_questions has one row per user (unique constraint). */
const isUniqueViolation = (error: unknown) =>
	typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";

export const postPersonalStats = userProcedure
	.input(personalQuestionsSchema.refine(onsetNotAfterAge, { message: ONSET_AFTER_AGE_MESSAGE }))
	.mutation(async ({ ctx, input }) => {
		const { systemMetric, ...rest } = input;
		if (rest.weight_amount && !systemMetric) {
			rest.weight_amount = Math.floor(rest.weight_amount * 0.453);
		}

		try {
			await ctx.db
				.insertInto("Personal_questions")
				.values({
					...rest,
					user: ctx.user.id,
					accepted: null,
					// Your own submission isn't news; the bell lights up once it's reviewed.
					seen: true,
				})
				.execute();
		} catch (error) {
			if (isUniqueViolation(error)) {
				throw new TRPCError({ code: "CONFLICT", message: "You have already submitted the personal poll." });
			}
			throw error;
		}

		return "Added succesfully";
	});

export const postTheirStats = userProcedure
	.input(theirQuestionsSchema.refine(onsetNotAfterAge, { message: ONSET_AFTER_AGE_MESSAGE }))
	.mutation(async ({ ctx, input }) => {
		await ctx.db
			.insertInto("Their_questions")
			.values({
				...input,
				user: ctx.user.id,
				accepted: null,
				// Your own submission isn't news; the bell lights up once it's reviewed.
				seen: true,
			})
			.execute();

		return "Added succesfully";
	});

export const postArticle = userProcedure
	.input(z.object(articleFields))
	.mutation(async ({ input, ctx }) => {
		await ctx.db
			.insertInto("Articles")
			.values({ ...input, user: ctx.user.id, accepted: null, seen: true })
			.execute();

		return "Added succesfully";
	});
