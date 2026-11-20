import { defineMiddleware } from "astro:middleware";
import { BETTER_AUTH_URL } from "astro:env/server";
import { auth } from "~/server/auth/auth";

// The poll pages are public; they ask for login before submitting.
const USER_ONLY = ["/user"];
const ADMIN_ONLY = ["/admin"];
const appOrigin = new URL(BETTER_AUTH_URL).origin;

const matches = (path: string, prefixes: string[]) =>
	prefixes.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * No framing by other sites (clickjacking), no MIME sniffing, no full URLs in Referer.
 * Same-origin framing stays allowed: Astro's ClientRouter (in dev) loads the next page in a
 * hidden same-origin iframe, and 'none' would make every page transition hang.
 */
const withSecurityHeaders = (response: Response) => {
	try {
		response.headers.set("X-Frame-Options", "SAMEORIGIN");
		response.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
		response.headers.set("X-Content-Type-Options", "nosniff");
		response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	} catch {
		// Some responses (e.g. redirects made with Response.redirect) have immutable headers
	}
	return response;
};

export const onRequest = defineMiddleware(async (ctx, next) => {
	const path = ctx.url.pathname;

	// Better Auth handles its own routes (and their CSRF/origin checks)
	if (path.startsWith("/api/auth/")) return withSecurityHeaders(await next());

	// CSRF for our JSON API: Astro's checkOrigin only covers form content types
	if (path.startsWith("/api/trpc") && !["GET", "HEAD", "OPTIONS"].includes(ctx.request.method)) {
		if (ctx.request.headers.get("Origin") !== appOrigin) {
			return new Response("Forbidden", { status: 403 });
		}
	}

	const result = await auth.api.getSession({ headers: ctx.request.headers });
	ctx.locals.user = result?.user ?? null;
	ctx.locals.session = result?.session ?? null;

	if (matches(path, USER_ONLY) && !ctx.locals.user) {
		return ctx.redirect(`/login?redir=${encodeURIComponent(path)}`);
	}
	if (matches(path, ADMIN_ONLY) && ctx.locals.user?.role !== "admin") {
		return ctx.redirect(ctx.locals.user ? "/" : `/login?redir=${encodeURIComponent(path)}`);
	}

	return withSecurityHeaders(await next());
});
