// src/middleware.ts
import {  appendHeader, getCookie, getHeader } from "vinxi/http";
import { Session, User, verifyRequestOrigin } from "lucia";
import { createMiddleware } from "@solidjs/start/middleware";
import { lucia } from "~/lib/auth/lucia";
import { getRequestEvent } from "solid-js/web";

export default createMiddleware({
	onRequest: async (event) => {
    
        
		if (event.request.method !== "GET") {
			const originHeader = getHeader(event, "Origin") ?? null;
			const hostHeader = getHeader(event, "Host") ?? null;
			if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
				event.response.writeHead(403).end();
				return;
			}
		}

		const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
		if (!sessionId) {
			event.context.session = null;
			event.context.user = null;
			return;
		}

		const { session, user } = await lucia.validateSession(sessionId);
		if (session && session.fresh) {
			appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
		}
		if (!session) {
			appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
		}
		event.context.session = session;
		event.context.user = user;
	}
});

declare module "vinxi/http" {
	interface H3EventContext {
		user: User | null;
		session: Session | null;
	}
}