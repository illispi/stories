import { inferAsyncReturnType } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const user = { id: req.session.id };

  return { req, res, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;

declare module "fastify" {
  interface Session {
    id: string;
  }
}
