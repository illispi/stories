import { wrap } from "@typeschema/valibot";
import { type ReturnError, apiProcedure } from "../../utils";
import { maxLength, minLength, object, string } from "valibot";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import { db } from "~/server/db";
import { lucia } from "~/lib/auth/lucia";
import { TRPCError } from "@trpc/server";
import {
	appendResponseHeader,
	deleteCookie,
	sendRedirect,
	setCookie,
} from "vinxi/server";

export const authStatus = apiProcedure.query(async ({ ctx }) => {
	//TODO this is bit hacky
	try {
		if (ctx.session) {
			const user = await ctx.db
				.selectFrom("auth_user")
				.select(["id", "role"])
				.where("id", "=", ctx.user?.id)
				.executeTakeFirstOrThrow();

			if (!user) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "User was not found",
				});
			}
			return true;
		}

		return false;
	} catch (error) {
		const wError = error as ReturnError;
		console.error(wError);
		return wError;
	}
});

export const signIn = apiProcedure
	.input(
		wrap(
			object({
				username: string([
					minLength(4, "Your username is too short, min 4 characters"),
					maxLength(30, "Your username is too long, 30 characters max"),
				]),
				password: string([
					minLength(4, "Your password is too short, min 4 characters"),
					maxLength(255, "Your password is too long, 255 characters max"),
				]),
			}),
		),
	)
	.mutation(async ({ ctx, input }) => {
		try {
			//TODO wrap this try catch into function
			//BUG should check for username from context
			const existingUser = await db
				.selectFrom("auth_user")
				.selectAll("auth_user")
				.where("username", "=", ctx.user?.id)
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
				input.password,
			);
			if (!validPassword) {
				return new Response("Incorrect username or password", {
					status: 400,
				});
			}

			const session = await lucia.createSession(existingUser.id, {});
			appendResponseHeader(
				"Set-Cookie",
				lucia.createSessionCookie(session.id).serialize(),
			);
			sendRedirect("/");
			return;
		} catch (error) {
			const wError = error as ReturnError;
			console.error(wError);
			return wError;
		}
	});
export const signUp = apiProcedure
	.input(
		wrap(
			object({
				username: string([
					minLength(4, "Your username is too short, min 4 characters"),
					maxLength(30, "Your username is too long, 30 characters max"),
				]),
				password: string([
					minLength(4, "Your password is too short, min 4 characters"),
					maxLength(255, "Your password is too long, 255 characters max"),
				]),
			}),
		),
	)
	.mutation(async ({ ctx, input }) => {
		try {
			const userId = generateId(15);
			const hashedPassword = await new Argon2id().hash(input.password);

			// TODO: check if username is already used

			await db
				.insertInto("auth_user")
				.values({
					id: userId,
					hashed_password: hashedPassword,
					role: "user",
					username: input.username,
				})
				.executeTakeFirst();

			const session = await lucia.createSession(userId, {});
			appendResponseHeader(
				"Set-Cookie",
				lucia.createSessionCookie(session.id).serialize(),
			);
			sendRedirect("/");
			// const sessionCookie = lucia.createSessionCookie(session.id);
			// ctx.res.cookie[sessionCookie.name].set({
			// 	value: sessionCookie.value,
			// 	...sessionCookie.attributes,
			// });

			// ctx.res.set.redirect = "/";
			return;
		} catch (error) {
			const wError = error as ReturnError;
			console.error(wError);
			return wError;
		}
	});
export const logOut = apiProcedure.mutation(async ({ ctx, input }) => {
	try {
		const sessionCookie = lucia.createBlankSessionCookie();
		// TODO check from lucia docs how to log out
		// context.headers.set("Set-Cookie", sessionCookie.serialize());
		appendResponseHeader("Set-Cookie", sessionCookie.serialize());

		// ctx.res.set.redirect = "/";
		sendRedirect("/");
		return;
	} catch (error) {
		const wError = error as ReturnError;
		console.error(wError);
		return wError;
	}
});
