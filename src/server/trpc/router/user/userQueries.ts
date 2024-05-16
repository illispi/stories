import { TRPCError } from "@trpc/server";
import { userProcedure } from "../../utils";

export const getPersonal = userProcedure.query(async ({ ctx }) => {
	const unSafe = await ctx.db
		.selectFrom("Personal_questions")
		.selectAll()
		.where("user", "=", ctx.user.id)
		.executeTakeFirst();

	if (!unSafe) {
		return null;
	}

	const { user, created_at, id, ...safe } = unSafe;

	return safe;
});

export const getTheirs = userProcedure.query(async ({ ctx }) => {
	const unSafe = await ctx.db
		.selectFrom("Their_questions")
		.selectAll()
		.where("user", "=", ctx.user.id)
		.execute();

	if (!unSafe.length) {
		return null;
	}

	const safe = unSafe.map((unSafeEl: (typeof unSafe)[0]) => {
		const { user, created_at, ...safeTemp } = unSafeEl;
		return safeTemp;
	});

	return safe;
});

export const getArticles = userProcedure.query(async ({ ctx }) => {
	const unSafe = await ctx.db
		.selectFrom("Articles")
		.selectAll()
		.where("user", "=", ctx.user.id)
		.execute();

	if (!unSafe.length) {
		return null;
	}

	const safe = unSafe.map((unSafeEl: (typeof unSafe)[0]) => {
		const { user, created_at, ...safeTemp } = unSafeEl;
		return safeTemp;
	});

	return safe;
});

export const getNotifications = userProcedure.query(async ({ ctx }) => {
	const personal = await ctx.db
		.selectFrom("Personal_questions")
		.selectAll()
		.where("user", "=", ctx.user.id)
		.executeTakeFirst();

	const statusPersonal =
		personal !== undefined
			? { status: personal.accepted, time: personal.updated_at }
			: undefined;

	const their = await ctx.db
		.selectFrom("Their_questions")
		.selectAll()
		.where("user", "=", ctx.user.id)
		.execute();

	const statusTheir = !their.length
		? their.map((e) => ({
				status: e.accepted,
				time: e.updated_at,
			}))
		: undefined;

	const articles = await ctx.db
		.selectFrom("Articles")
		.selectAll()
		.where("user", "=", ctx.user.id)
		.execute();

	const statusArticles = !articles.length
		? articles.map((e) => ({
				status: e.accepted,
				time: e.updated_at,
			}))
		: undefined;

	return {
		articles: statusArticles,
		personal: statusPersonal,
		their: statusTheir,
	};
});
