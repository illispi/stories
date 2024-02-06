import { Elysia, t } from "elysia";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { lucia } from "~/lib/auth/lucia";
import { db } from "../db";
import { derive } from "./derive";

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(derive)
  .get("/status", async (context) => {
    if (!context.user) {
      return null;
    } else {
      return context.user.username;
    }
  })
  .post("/logout", async (context) => {
    if (!context.user) {
      return null;
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
      body: t.Object({
        password: t.String(),
        username: t.String(),
      }),
    }
  )
  .post(
    "/signin",
    async (context) => {
      if (context.user) {
        context.set.redirect = "/";
      } else {
        const existingUser = await db
          .selectFrom("auth_user")
          .selectAll("auth_user")
          .executeTakeFirst();
        if (!existingUser) {
          // NOTE:
          // Returning immediately allows malicious actors to figure out valid usernames from response times,
          // allowing them to only focus on guessing passwords in brute-force attacks.
          // As a preventive measure, you may want to hash passwords even for invalid usernames.
          // However, valid usernames can be already be revealed with the signup page among other methods.
          // It will also be much more resource intensive.
          // Since protecting against this is none-trivial,
          // it is crucial your implementation is protected against brute-force attacks with login throttling etc.
          // If usernames are public, you may outright tell the user that the username is invalid.
          return "No account yet";
        }

        const validPassword = await new Argon2id().verify(
          existingUser.hashed_password,
          context.query.password
        );
        if (!validPassword) {
          return new Response("Incorrect username or password", {
            status: 400,
          });
        }

        const session = await lucia.createSession(existingUser.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        context.cookies.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
        //BUG does this hang since nothing is returned?
        context.set.redirect = "/";
      }
    },
    {
      body: t.Object({
        password: t.String(),
        username: t.String(),
      }),
    }
  );
