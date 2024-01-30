import { Elysia, t } from "elysia";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { lucia } from "~/lib/auth/lucia";
import { db } from "../db";

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
  .post("/logout", async (context) => {
    if (!context.user) {
      return new Response(null, {
        status: 401,
      });
    } else {
      const sessionCookie = lucia.createBlankSessionCookie();

      context.headers.set("Set-Cookie", sessionCookie.serialize());
      context.cookie.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );

      context.set.redirect = "/";
    }
  })
  .post(
    "/signup",
    async (context) => {
      if (context.user) {
        context.set.redirect = "/";
      } else {
        const userId = generateId(15);
        const hashedPassword = await new Argon2id().hash(
          context.query.password
        );

        // TODO: check if username is already used

        await db
          .insertInto("auth_user")
          .values({
            id: userId,
            hashed_password: hashedPassword,
            role: "user",
            username: context.query.username,
          })
          .executeTakeFirst();

        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        context.cookie.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );

        context.set.redirect = "/";
      }
    },
    {
      query: t.Object({
        password: t.String(),
        username: t.String(),
      }),
    }
  );
