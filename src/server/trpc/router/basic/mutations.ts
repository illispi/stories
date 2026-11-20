import { personalQuestionsSchema, theirQuestionsSchema } from "~/types/zodFromTypes";
import { userProcedure } from "../../utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sql } from "kysely";
import { articleFields } from "~/server/schemas/articleSchema";

export const postPersonalStats = userProcedure
	.input(personalQuestionsSchema)
	.mutation(async ({ ctx, input }) => {
		const { systemMetric, ...rest } = input;
		if (rest.weight_amount && !systemMetric) {
			rest.weight_amount = Math.floor(rest.weight_amount * 0.453);
		}

		// One personal poll per account. The lock (held until the transaction ends) makes two
		// simultaneous submits run one after the other, so the second one sees the first.
		await ctx.db.transaction().execute(async (trx) => {
			await sql`select pg_advisory_xact_lock(hashtext(${`personal_poll:${ctx.user.id}`}))`.execute(trx);

			const existsAlready = await trx
				.selectFrom("Personal_questions")
				.select("id")
				.where("user", "=", ctx.user.id)
				.executeTakeFirst();
			if (existsAlready) {
				throw new TRPCError({ code: "CONFLICT", message: "Personal poll exists already" });
			}

			await trx
				.insertInto("Personal_questions")
				.values({
					...rest,
					user: ctx.user.id,
					accepted: null,
					// Your own submission isn't news; the bell lights up once it's reviewed.
					seen: true,
				})
				.execute();
		});

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
				// Your own submission isn't news; the bell lights up once it's reviewed.
				seen: true,
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
	.input(z.object(articleFields))
	.mutation(async ({ input, ctx }) => {
		const insertion = await ctx.db
			.insertInto("Articles")
			.values({ ...input, user: ctx.user.id, accepted: null, seen: true })
			.executeTakeFirst();
		if (!insertion) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Insertion failed",
			});
		}

		return "Added succesfully";
	});
