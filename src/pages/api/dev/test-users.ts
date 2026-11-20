import type { APIRoute } from "astro";
import { BETTER_AUTH_URL } from "astro:env/server";
import { db } from "~/server/db";

/**
 * Development only (404 in production builds): create test accounts and switch between
 * them. Only an admin, or someone already signed in as a test account, may use it.
 *
 * GET  → { current, testUsers }
 * POST { action: "create" }                 → new test account, signed in as it
 * POST { action: "login",  userId }         → sign in as an existing test account
 * POST { action: "delete", userId }         → delete a test account and its data
 */
const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const isTestEmail = (email: string | null | undefined, domain: string) => Boolean(email?.endsWith(domain));

export const ALL: APIRoute = async (ctx) => {
	if (!import.meta.env.DEV) return new Response(null, { status: 404 });

	const { devTestHelpers, TEST_EMAIL_DOMAIN } = await import("~/server/auth/devAuth");
	const user = ctx.locals.user;
	if (!user || (user.role !== "admin" && !isTestEmail(user.email, TEST_EMAIL_DOMAIN))) {
		return json({ error: "Sign in as an admin first" }, 403);
	}

	const testUsers = () =>
		db
			.selectFrom("auth_user")
			.select(["id", "created_at"])
			.where("email", "like", `%${TEST_EMAIL_DOMAIN}`)
			.orderBy("created_at")
			.execute();

	if (ctx.request.method === "GET") {
		return json({ current: { id: user.id, isTest: isTestEmail(user.email, TEST_EMAIL_DOMAIN) }, testUsers: await testUsers() });
	}
	if (ctx.request.method !== "POST") return new Response(null, { status: 405 });
	if (ctx.request.headers.get("Origin") !== new URL(BETTER_AUTH_URL).origin) return json({ error: "Bad origin" }, 403);

	const body = (await ctx.request.json().catch(() => ({}))) as { action?: string; userId?: string };
	const test = await devTestHelpers();

	const signInAs = async (userId: string) => {
		const { cookies } = await test.login({ userId });
		for (const c of cookies) {
			ctx.cookies.set(c.name, c.value, {
				path: c.path,
				httpOnly: c.httpOnly,
				secure: c.secure,
				sameSite: "lax",
				expires: c.expires ? new Date(c.expires * 1000) : undefined,
			});
		}
	};

	const isTestUser = async (id: string | undefined) => {
		if (!id) return false;
		const row = await db.selectFrom("auth_user").select("email").where("id", "=", id).executeTakeFirst();
		return isTestEmail(row?.email, TEST_EMAIL_DOMAIN);
	};

	if (body.action === "create") {
		const created = await test.saveUser(
			test.createUser({
				email: `test_${crypto.randomUUID().slice(0, 8)}${TEST_EMAIL_DOMAIN}`,
				name: "",
				emailVerified: false,
				role: "user",
			}),
		);
		await signInAs(created.id);
		return json({ ok: true, userId: created.id });
	}
	if (body.action === "login") {
		if (!(await isTestUser(body.userId))) return json({ error: "Not a test account" }, 400);
		await signInAs(body.userId as string);
		return json({ ok: true });
	}
	if (body.action === "delete") {
		if (!(await isTestUser(body.userId))) return json({ error: "Not a test account" }, 400);
		// Cascades to sessions, poll answers and articles, like a real account deletion
		await db.deleteFrom("auth_user").where("id", "=", body.userId as string).execute();
		return json({ ok: true });
	}
	return json({ error: "Unknown action" }, 400);
};
