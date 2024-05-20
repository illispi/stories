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

export const createContext = async (opts: createSolidAPIHandlerContext) => {
	const { session, user } = await validateSession(opts);

	return { db, session, user, req: opts.req, res: opts.res };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

export const validateSession = async (opts: createSolidAPIHandlerContext) => {
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
			return { session: null, user: null };
		}
	}
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
