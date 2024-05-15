// utils/trpc.ts
import { QueryClient } from "@tanstack/solid-query";
import type { IAppRouter } from "~/server/trpc/router/_app";

import { httpBatchLink } from "@trpc/client";
import { getRequestEvent, isServer } from "solid-js/web";
import { createTRPCSolidStart } from "@solid-mediakit/trpc";
import { env } from "./envValidator.js";

const getBaseUrl = () => {
	// if (typeof window !== "undefined") return "";
	return `${
		env.PUBLIC_NODE_ENV === "production"
			? env.PUBLIC_SITE
			: "http://localhost:3000"
	}`;
};

export const trpc = createTRPCSolidStart<IAppRouter>({
	config() {
		// PageEvent of Solid-start
		return {
			links: [
				httpBatchLink({
					url: `${getBaseUrl()}/api/trpc`,
					headers: () => {
						const event = isServer ? getRequestEvent() : null;
						const r = event
							? {
									...Object.fromEntries(event?.request.headers),
								}
							: "";
						return r;
					},
				}),
			],
		};
	},
});

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			suspense: true,
		},
	},
});
