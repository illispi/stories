import type { APIContext } from "astro";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { db } from "../db";

export const createContext = (opts: FetchCreateContextFnOptions, astro: APIContext) => ({
	db,
	req: opts.req,
	resHeaders: opts.resHeaders,
	// Set by src/middleware.ts from the Better Auth session
	user: astro.locals.user,
	session: astro.locals.session,
});

export type Context = Awaited<ReturnType<typeof createContext>>;
