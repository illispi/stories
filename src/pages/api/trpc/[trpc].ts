import type { APIRoute } from "astro";
import * as Sentry from "@sentry/astro";
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
		// tRPC turns thrown errors into JSON responses, so Sentry's request middleware never sees
		// them. Report the unexpected ones (not auth/validation/not-found errors users cause).
		onError: ({ path, error }) => {
			if (import.meta.env.DEV) console.error(`tRPC ${path}:`, error);
			if (error.code === "INTERNAL_SERVER_ERROR") {
				Sentry.captureException(error.cause ?? error, { tags: { trpcPath: path ?? "unknown" } });
			}
		},
	});
