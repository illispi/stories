import { createAuthClient } from "better-auth/solid";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "~/server/auth/auth";

export const authClient = createAuthClient({
	plugins: [inferAdditionalFields<typeof auth>()],
});

/** Only allow same-site paths as post-login redirect targets (no open redirects). */
export const safeRedirect = (target: string | null | undefined) => {
	if (!target?.startsWith("/")) return "/";
	// Parse like a browser would: "/\t/evil.com" or "/\\evil.com" become "//evil.com", another site.
	const base = "https://same-site.invalid";
	try {
		const url = new URL(target, base);
		return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : "/";
	} catch {
		return "/";
	}
};
