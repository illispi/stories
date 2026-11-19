import type { APIRoute } from "astro";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "~/server/trpc/context";
import { appRouter } from "~/server/trpc/router/trpcRouters";

export const ALL: APIRoute = (ctx) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req: ctx.request,
		router: appRouter,
		createContext: (opts) => createContext(opts, ctx),
		maxBatchSize: 10,
		onError: import.meta.env.DEV ? ({ path, error }) => console.error(`tRPC ${path}:`, error) : undefined,
	});
