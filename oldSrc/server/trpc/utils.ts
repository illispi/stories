import { TRPCError, initTRPC } from "@trpc/server";
import type { IContext } from "./context";

export const t = initTRPC.context<IContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const apiProcedure = publicProcedure.use((opts) => {
  if (!opts.ctx.req || !opts.ctx.res) {
    throw new Error("You are missing `req` or `res` in your call.");
  }
  return opts.next({
    ctx: {
      // We overwrite the context with the truthy `req` & `res`, which will also overwrite the types used in your procedure.
      req: opts.ctx.req,
      res: opts.ctx.res,
    },
  });
});
export const userProcedure = apiProcedure.use(async (opts) => {
  if (opts.ctx.session) {
    const user = await opts.ctx.db
      .selectFrom("auth_user")
      .select(["id", "role"])
      .where("id", "=", opts.ctx.session.user?.userId)
      .executeTakeFirstOrThrow();

    if (!user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User was not found",
      });
    }

    return opts.next({
      ctx: {
        user,
      },
    });
  }

  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "You are not authorized",
  });
});
export const adminProcedure = apiProcedure.use(async (opts) => {
  if (opts.ctx.session) {
    const user = await opts.ctx.db
      .selectFrom("auth_user")
      .select(["id", "role"])
      .where("id", "=", opts.ctx.session.user?.userId)
      .executeTakeFirstOrThrow();

    if (!user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User was not found",
      });
    }

    if (user.role === "admin") {
      return opts.next({
        ctx: {
          user,
        },
      });
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not authorized",
    });
  }

  throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "You are not authorized",
  });
});
