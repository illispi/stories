import type { inferAsyncReturnType } from "@trpc/server";
import { type Session, verifyRequestOrigin, type User } from "lucia";
import { lucia } from "~/lib/auth/lucia";
import type { createSolidAPIHandlerContext } from "@solid-mediakit/trpc/handler";
import {
	appendResponseHeader,
	getCookie,
	setResponseStatus,
} from "vinxi/server";
import { db } from "../db";

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
	if (import.meta.env.PROD && opts.req.method !== "GET") {
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
			// return new Response(null, {
			// 	status: 403,
			// });
			setResponseStatus(401);
			return;
		}
	}
	const { session, user } = await validateSession();
	console.log(session);

	const contextInner = await createContextInner({ session, user });

	return { ...contextInner, req: opts.req, res: opts.res };
};

export type IContext = inferAsyncReturnType<typeof createContextInner>;

export const validateSession = async () => {
	const sessionId = getCookie(lucia.sessionCookieName);
	if (!sessionId) {
		setResponseStatus(401);
		return { session: null, user: null };
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

	return { session, user };
};
