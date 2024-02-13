import { Elysia } from "elysia";
import { Session, User, verifyRequestOrigin } from "lucia";
import { lucia } from "~/lib/auth/lucia";

export const sessionDer = new Elysia().derive(
  async (
    context
  ): Promise<{
    user: User;
    session: Session;
  } | null> => {
    // CSRF check
    if (process.env.NODE_ENV === "production")
      if (context.request.method) {
        const originHeader = context.request.headers.get("Origin");
        // NOTE: You may need to use `X-Forwarded-Host` instead
        const hostHeader = context.request.headers.get("Host");
        if (
          !originHeader ||
          !hostHeader ||
          !verifyRequestOrigin(originHeader, [hostHeader])
        ) {
          return null;
        }
      }

    // use headers instead of Cookie API to prevent type coercion
    const cookieHeader = context.request.headers.get("Cookie") ?? "";
    const sessionId = lucia.readSessionCookie(cookieHeader);
    if (!sessionId) {
      return null;
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      context.cookie[sessionCookie.name].set({
        value: sessionCookie.value,
        ...sessionCookie.attributes,
      });
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      context.cookie[sessionCookie.name].set({
        value: sessionCookie.value,
        ...sessionCookie.attributes,
      });
    }
    return {
      user,
      session,
      role: user?.role
    };
  }
);
