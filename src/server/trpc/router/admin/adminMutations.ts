import { z } from "zod";
import { adminProcedure, devAdminProcedure } from "../../utils";
import { TRPCError } from "@trpc/server";
import { personalQuestionsSchema, theirQuestionsSchema } from "~/types/zodFromTypes";
import { createFakeDataPersonal } from "~/utils/faker/personalQuestionsFaker";
import { createFakeDataTheir } from "~/utils/faker/theirQuestionsFaker";
import { faker } from "@faker-js/faker";
import type { PersonalQuestions } from "~/types/zodFromTypes";

/** `systemMetric` is a form-only field, not a DB column. */
const withoutSystemMetric = <T extends object>(data: T) => {
	if (!("systemMetric" in data)) return data;
	const { systemMetric: _systemMetric, ...rest } = data as T & Pick<PersonalQuestions, "systemMetric">;
	return rest as unknown as T;
};

export const acceptArticle = adminProcedure
	.input(
		z.object({
			id: z.number(),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const insertion = await ctx.db
			.updateTable("Articles")
			.set({
				accepted: true,
				// A review result is news for the author: show it on their bell.
				seen: false,
				updated_at: new Date(),
			})
			.where("id", "=", input.id)
			.executeTakeFirst();

		if (!insertion) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Insertion failed",
			});
		}

		return "Added succesfully";
	});

/**
 * Deletes an account and everything it submitted (poll answers, articles, sessions): the
 * tables reference auth_user with ON DELETE CASCADE. For people who can't sign in any more
 * and ask for removal. Admin accounts (including your own) can't be deleted here.
 */
export const deleteUserAdmin = adminProcedure
	.input(z.object({ userId: z.string().min(1) }))
	.mutation(async ({ ctx, input }) => {
		const target = await ctx.db
			.selectFrom("auth_user")
			.select(["id", "role"])
			.where("id", "=", input.userId)
			.executeTakeFirst();

		if (!target) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });
		}
		if (target.role === "admin" || target.id === ctx.user.id) {
			throw new TRPCError({ code: "FORBIDDEN", message: "Admin accounts can't be deleted here" });
		}

		await ctx.db.deleteFrom("auth_user").where("id", "=", input.userId).execute();

		return "Deleted succesfully";
	});

/** Removes any article, including accepted ones already shown on the Articles page. */
export const deleteArticleAdmin = adminProcedure
	.input(z.object({ id: z.number() }))
	.mutation(async ({ ctx, input }) => {
		const deleted = await ctx.db.deleteFrom("Articles").where("id", "=", input.id).executeTakeFirst();

		if (!deleted.numDeletedRows) {
			throw new TRPCError({ code: "NOT_FOUND", message: "Article not found" });
		}

		return "Deleted succesfully";
	});

export const declineArticle = adminProcedure
	.input(
		z.object({
			id: z.number(),
			decline_reason: z.string().min(10).max(600),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const insertion = await ctx.db
			.updateTable("Articles")
			.set({
				accepted: false,
				decline_reason: input.decline_reason,
				seen: false,
				updated_at: new Date(),
			})
			.where("id", "=", input.id)
			.executeTakeFirst();

		if (!insertion) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Insertion failed",
			});
		}

		return "Added succesfully";
	});

export const acceptSubmission = adminProcedure
	.input(
		z.object({
			id: z.number(),
			pOrT: z.enum(["Personal_questions", "Their_questions"]),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const updated = await ctx.db
			.updateTable(input.pOrT)
			.set({
				accepted: true,
				decline_reason: null,
				seen: false,
				updated_at: new Date(),
			})
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

export const declineSubmission = adminProcedure
	.input(
		z.object({
			id: z.number(),
			pOrT: z.enum(["Personal_questions", "Their_questions"]),
			decline_reason: z.string().min(10).max(600),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const updated = await ctx.db
			.updateTable(input.pOrT)
			.set({
				accepted: false,
				decline_reason: input.decline_reason,
				seen: false,
				updated_at: new Date(),
			})
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

export const fakeForFake = adminProcedure
	.input(
		z.object({
			pOrT: z.enum(["Personal_questions_fake", "Their_questions_fake"]),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		try {
			for (let index = 0; index < 100; index++) {
				const fakeData =
					input.pOrT === "Personal_questions_fake"
						? createFakeDataPersonal()
						: createFakeDataTheir();

				input.pOrT === "Personal_questions_fake"
					? personalQuestionsSchema.parse(fakeData)
					: theirQuestionsSchema.parse(fakeData);

				const fakeDataPruned = withoutSystemMetric(fakeData);

				const fakeInsert = await ctx.db
					.insertInto(input.pOrT)
					.values({
						...fakeDataPruned,
					})
					.executeTakeFirst();

				if (!fakeInsert) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Insertion failed",
					});
				}
			}
			return "Insertion success";
		} catch (error) {
			console.error(error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: error instanceof Error ? error.message : "Insertion failed",
			});
		}
	});

export const fakeForDev = devAdminProcedure
	.input(
		z.object({
			pOrT: z.enum(["Personal_questions", "Their_questions"]),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const fakeData =
			input.pOrT === "Personal_questions"
				? createFakeDataPersonal()
				: createFakeDataTheir();

		try {
			input.pOrT === "Personal_questions"
				? personalQuestionsSchema.parse(fakeData)
				: theirQuestionsSchema.parse(fakeData);

			const fakeDataPruned = withoutSystemMetric(fakeData);

			const fakeInsert = await ctx.db
				.insertInto(input.pOrT)
				.values({
					...fakeDataPruned,
					user: ctx.user.id,
					accepted: null,
				})
				.executeTakeFirst();

			if (!fakeInsert) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Insertion failed",
				});
			}

			return "Insertion success";
		} catch (error) {
			console.error(error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: error instanceof Error ? error.message : "Insertion failed",
			});
		}
	});

export const fakeForDevBulk = devAdminProcedure
	.input(
		z.object({
			pOrT: z.enum(["Personal_questions", "Their_questions"]),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		try {
			for (let index = 0; index < 20; index++) {
				const fakeData =
					input.pOrT === "Personal_questions"
						? createFakeDataPersonal()
						: createFakeDataTheir();

				input.pOrT === "Personal_questions"
					? personalQuestionsSchema.parse(fakeData)
					: theirQuestionsSchema.parse(fakeData);

				const fakeInsert = await ctx.db
					.insertInto(input.pOrT)
					.values({
						...withoutSystemMetric(fakeData),
						user: ctx.user.id,
						accepted: true,
					})
					.executeTakeFirst();

				if (!fakeInsert) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Insertion failed",
					});
				}
			}
			return "Insertion success";
		} catch (error) {
			console.error(error);
			throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
		}
	});

export const fakeArticlesForDev = devAdminProcedure.mutation(async ({ ctx }) => {
	const add = await ctx.db
		.insertInto("Articles")
		.values({
			description: faker.lorem
				.paragraphs(10)
				.substring(0, Math.floor(Math.random() * 400) + 4),
			link: faker.internet.url(),
			user: ctx.user.id,
		})
		.executeTakeFirst();

	if (add) {
		return "success";
	} else {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to fake article",
		});
	}
});
