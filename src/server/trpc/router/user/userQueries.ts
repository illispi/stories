import { TRPCError } from "@trpc/server";
import { userProcedure } from "../../utils";
import { unescape } from "querystring";

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

	let statusPersonal;
	if (personal === undefined) {
		statusPersonal = undefined;
	}

	else{
		statusPersonal = {status: personal.accepted, time: personal.}
	}

	const their = await ctx.db
		.selectFrom("Their_questions")
		.selectAll()
		.where("user", "=", ctx.user.id)
		.execute();

	const statusTheir = their.filter((e) => e.accepted);
});
