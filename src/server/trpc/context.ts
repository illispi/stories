import type { inferAsyncReturnType } from "@trpc/server";
import type { createSolidAPIHandlerContext } from "solid-start-trpc";
import { db } from "../server";
import { Session } from "lucia";
import { auth } from "~/auth/lucia";

interface CreateInnerContextOptions
  extends Partial<createSolidAPIHandlerContext> {
  session: Session | null;
}

export const createContextInner = async (opts: CreateInnerContextOptions) => {
  return {
    db,
    session: opts.session,
  };
};

export const createContext = async (opts: CreateInnerContextOptions) => {
  const authRequest = auth.handleRequest(opts.req!);
  const session = await authRequest.validate();

  const contextInner = await createContextInner({ session });
  return { ...contextInner, req: opts.req, res: opts.res };
};

export type IContext = inferAsyncReturnType<typeof createContextInner>;
