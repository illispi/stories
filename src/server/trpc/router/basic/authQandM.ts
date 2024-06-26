import { TRPCError } from "@trpc/server";
import { wrap } from "@typeschema/valibot";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";
import {
	excludes,
	maxLength,
	minLength,
	object,
	string
} from "valibot";
import {
	appendResponseHeader
} from "vinxi/server";
import { lucia } from "~/lib/auth/lucia";
import { db } from "~/server/db";
import { publicProcedure } from "../../utils";

export const authStatus = publicProcedure.query(async ({ ctx }) => {
	if (ctx.session?.userId) {
		const user = await ctx.db
			.selectFrom("auth_user")
			.select(["id", "role"])
			.where("id", "=", ctx.session.userId)
			.executeTakeFirst();

		if (!user) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "User was not found",
			});
		}
		if (user.role === "admin") {
			return { user: true, admin: true };
		}
		return { user: true, admin: false };
	}

	return { user: false, admin: false };
});

export const signIn = publicProcedure
	.input(
		wrap(
			object({
				username: string([
					excludes(" ", "The username can't contain spaces"),
					minLength(4, "Your username is too short, min 4 characters"),
					maxLength(30, "Your username is too long, 30 characters max"),
				]),
				password: string([
					excludes(" ", "The password can't contain spaces"),
					minLength(4, "Your password is too short, min 4 characters"),
					maxLength(255, "Your password is too long, 255 characters max"),
				]),
			}),
		),
	)
	.mutation(async ({ ctx, input }) => {
		//BUG should check for username from context
		const existingUser = await db
			.selectFrom("auth_user")
			.selectAll("auth_user")
			.where("username", "=", input.username)
			.executeTakeFirst();
		if (!existingUser) {
			// BUG:
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
			return "Incorrect username or password";
		}

		const session = await lucia.createSession(existingUser.id, {});
		appendResponseHeader(
			"Set-Cookie",
			lucia.createSessionCookie(session.id).serialize(),
		);
	});
export const signUp = publicProcedure
	.input(
		wrap(
			object({
				username: string([
					excludes(" ", "The username can't contain spaces"),
					minLength(4, "Your username is too short, min 4 characters"),
					maxLength(30, "Your username is too long, 30 characters max"),
				]),
				password: string([
					excludes(" ", "The password can't contain spaces"),
					minLength(4, "Your password is too short, min 4 characters"),
					maxLength(255, "Your password is too long, 255 characters max"),
				]),
			}),
		),
	)
	.mutation(async ({ ctx, input }) => {
		const usernameDb = await db
			.selectFrom("auth_user")
			.select(["username"])
			.where("id", "=", input.username)
			.executeTakeFirst();

		if (usernameDb?.username === input.username) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: `Username ${input.username} already exits`,
			});
		}
		const userId = generateId(15);
		const hashedPassword = await new Argon2id().hash(input.password);

		await db
			.insertInto("auth_user")
			.values({
				id: userId,
				hashed_password: hashedPassword,
				role: "user",
				username: input.username,
			})
			.executeTakeFirstOrThrow();

		const session = await lucia.createSession(userId, {});
		appendResponseHeader(
			"Set-Cookie",
			lucia.createSessionCookie(session.id).serialize(),
		);
	});
export const logOut = publicProcedure.mutation(async ({ ctx, input }) => {
	const sessionCookie = lucia.createBlankSessionCookie();
	// TODO check from lucia docs how to log out
	appendResponseHeader("Set-Cookie", sessionCookie.serialize());
});
