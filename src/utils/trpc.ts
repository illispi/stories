// utils/trpc.ts
import { QueryClient } from "@tanstack/solid-query";
import type { IAppRouter } from "~/server/trpc/router/trpcRouters";

import { httpBatchLink } from "@trpc/client";
import { getRequestEvent, isServer } from "solid-js/web";
import { createTRPCSolidStart } from "@solid-mediakit/trpc";

const getBaseUrl = () => {
	// if (typeof window !== "undefined") return "";
	console.log(
		`${
			import.meta.env.PROD ? import.meta.env.VITE_SITE : "http://localhost:3000"
		}`,
	);
	return `${
		import.meta.env.PROD ? import.meta.env.VITE_SITE : "http://localhost:3000"
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
