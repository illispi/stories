import type { inferAsyncReturnType } from "@trpc/server";
import { db } from "./server";
import { auth } from "./auth/lucia";

// interface CreateInnerContextOptions
//   extends Partial<createSolidAPIHandlerContext> {
//   session: Session | null;
// }

export const createContextInner = async (opts) => {
  return {
    db,
    session: opts.session,
  };
};

export const createContext = async (opts) => {
  const authRequest = auth.handleRequest(opts.req!);
  const session = await authRequest.validate();

  const contextInner = await createContextInner({ session });
  return { ...contextInner, req: opts.req, res: opts.res };
};

export type IContext = inferAsyncReturnType<typeof createContextInner>;
