import type { inferAsyncReturnType } from "@trpc/server";
import { db } from "../server";
import { type Session, verifyRequestOrigin, type User } from "lucia";
import { lucia } from "~/lib/auth/lucia";
import type { createSolidAPIHandlerContext } from "@solid-mediakit/trpc/handler";
import { appendResponseHeader, getCookie } from "vinxi/server";

interface CreateInnerContextOptions
	extends Partial<createSolidAPIHandlerContext> {
	session: Session | null;
	user: User | null;
}

export const createContextInner = async (opts: CreateInnerContextOptions) => {
	return {
		db,
		session: opts.session,
		user: opts.user,
	};
};

export const createContext = async (opts: createSolidAPIHandlerContext) => {
	if (import.meta.env.PROD) {
		// Only required in non-GET requests (POST, PUT, DELETE, PATCH, etc)
		const originHeader = opts.req.headers.get("Origin");
		// NOTE: You may need to use `X-Forwarded-Host` instead
		const hostHeader = opts.req.headers.get("Host");
		if (
			!originHeader ||
			!hostHeader ||
			!verifyRequestOrigin(originHeader, [hostHeader])
		) {
			//BUG see if you can even return this response in the first place
			return new Response(null, {
				status: 403,
			});
		}
	}

	const sessionId = getCookie(lucia.sessionCookieName);
	if (!sessionId) {
		return new Response(null, {
			status: 401,
		});
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		appendResponseHeader("Set-Cookie", sessionCookie.serialize());
	}

	if (session?.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		appendResponseHeader("Set-Cookie", sessionCookie.serialize());
	}
	const contextInner = await createContextInner({ session, user });
	return { ...contextInner, req: opts.req, res: opts.res };
};

export type IContext = inferAsyncReturnType<typeof createContextInner>;
