import { Elysia } from "elysia";
import type { App } from "../elysia";
import { Session, User } from "lucia";
import { lucia } from "~/lib/auth/lucia";

export const authRoute = new Elysia({ prefix: "/auth" })
  .get("", async (context) => {
    if (!context.user) {
      return new Response(null, {
        status: 401,
      });
    } else {
      return context.user.id;
    }
  })
  .post(
    "logout",
    async (context) => {
      if (!context.user) {
        return new Response(null, {
          status: 401,
        });
      } else {
        const sessionCookie = lucia.createBlankSessionCookie();

        context.headers.set("Set-Cookie", sessionCookie.serialize());
        context.setCookie(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    }
  );
