import { createSolidAPIHandler } from "@solid-mediakit/trpc/handler";
import type { APIEvent } from "@solidjs/start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "~/server/trpc/context";
import { appRouter } from "~/server/trpc/router/trpcRouters";

const handler = createSolidAPIHandler({
	router: appRouter,
	//BUG this complains
	createContext,
});
export const GET = handler;
export const POST = handler;
