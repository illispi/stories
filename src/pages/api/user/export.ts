import type { APIRoute } from "astro";
import { db } from "~/server/db";

/**
 * "Download my data": everything stored about the signed-in account, as a JSON file.
 * Read-only, so a GET with the session cookie is fine (other sites can't read the response).
 */
export const GET: APIRoute = async (ctx) => {
	const user = ctx.locals.user;
	if (!user) return new Response("Sign in first", { status: 401 });

	const [account, personal, their, articles, votes, drafts] = await Promise.all([
		db.selectFrom("auth_user").select(["id", "created_at", "role"]).where("id", "=", user.id).executeTakeFirst(),
		db.selectFrom("Personal_questions").selectAll().where("user", "=", user.id).execute(),
		db.selectFrom("Their_questions").selectAll().where("user", "=", user.id).orderBy("id").execute(),
		db.selectFrom("Articles").selectAll().where("user", "=", user.id).orderBy("id").execute(),
		db.selectFrom("article_votes").select(["article_id", "created_at"]).where("user", "=", user.id).execute(),
		db.selectFrom("poll_drafts").select(["poll", "data", "updated_at"]).where("user", "=", user.id).execute(),
	]);
	// The account ID is listed once at the top instead of on every row
	const withoutUser = <T extends { user?: unknown }>(rows: T[]) => rows.map(({ user: _user, ...rest }) => rest);
	const loginAccounts = await db
		.selectFrom("account")
		.select(["provider_id", "account_id", "created_at"])
		.where("user_id", "=", user.id)
		.execute();

	const body = {
		exportedAt: new Date().toISOString(),
		about:
			"Everything this site stores about your account. Your email, username and avatar are never stored; " +
			"the Discord account ID is only used to sign you in.",
		account: { ...account, signIn: loginAccounts },
		personalPoll: withoutUser(personal)[0] ?? null,
		relativesPolls: withoutUser(their),
		articles: withoutUser(articles),
		helpfulVotes: votes,
		unfinishedPollProgress: drafts,
	};
	const date = new Date().toISOString().slice(0, 10);
	return new Response(JSON.stringify(body, null, 2), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Content-Disposition": `attachment; filename="schizophrenia-poll-my-data-${date}.json"`,
			"Cache-Control": "no-store",
		},
	});
};
