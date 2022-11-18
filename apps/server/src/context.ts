import { inferAsyncReturnType } from "@trpc/server";
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export function createContext({ req, res }: CreateFastifyContextOptions) {
  return { req, res, db: req.server.db };
}

export type Context = inferAsyncReturnType<typeof createContext>;

declare module "fastify" {
  interface Session {
    id: string;
  }
}
