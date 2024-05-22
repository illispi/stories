import { User, verifyRequestOrigin } from "lucia";
import { getRequestEvent } from "solid-js/web";
import {
	appendResponseHeader,
	getCookie,
	setResponseStatus,
} from "vinxi/server";
import { lucia } from "~/lib/auth/lucia";

export const userLoader = async () => {
	"use server";
	const evt = getRequestEvent();

	if (import.meta.env.PROD && evt?.request.method !== "GET") {
		// Only required in non-GET requests (POST, PUT, DELETE, PATCH, etc)
		const originHeader = evt?.request.headers.get("Origin");
		// NOTE: You may need to use `X-Forwarded-Host` instead
		const hostHeader = evt?.request.headers.get("Host");
		if (
			!originHeader ||
			!hostHeader ||
			!verifyRequestOrigin(originHeader, [hostHeader])
		) {
			return null;
		}
	}
	const sessionId = getCookie(lucia.sessionCookieName);
	if (!sessionId) {
		return null;
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
	if (user) {
		return user;
	}
	return null;
};
