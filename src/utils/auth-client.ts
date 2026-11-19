import { createAuthClient } from "better-auth/solid";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "~/server/auth/auth";

export const authClient = createAuthClient({
	plugins: [inferAdditionalFields<typeof auth>()],
});

/** Only allow same-site paths as post-login redirect targets (no open redirects). */
export const safeRedirect = (target: string | null | undefined) =>
	target?.startsWith("/") && !target.startsWith("//") && !target.startsWith("/\\")
		? target
		: "/";
