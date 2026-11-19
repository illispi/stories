import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const userProcedure = publicProcedure.use(({ ctx, next }) => {
	if (!ctx.user || !ctx.session) {
		throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not authorized" });
	}
	return next({ ctx: { user: ctx.user, session: ctx.session } });
});

export const adminProcedure = userProcedure.use(({ ctx, next }) => {
	if (ctx.user.role !== "admin") {
		throw new TRPCError({ code: "FORBIDDEN", message: "You are not authorized" });
	}
	return next();
});

/** Admin-only and refused in production: for procedures that write fake data into real tables. */
export const devAdminProcedure = adminProcedure.use(({ next }) => {
	if (import.meta.env.PROD) {
		throw new TRPCError({ code: "FORBIDDEN", message: "Not available in production" });
	}
	return next();
});
