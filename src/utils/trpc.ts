// utils/trpc.ts
import { QueryClient } from "@tanstack/solid-query";
import type { IAppRouter } from "~/server/trpc/router/_app";
import { createTRPCSolidStart } from "solid-trpc";
import { httpBatchLink } from "@trpc/client";
import { isServer } from "solid-js/web";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  return `http://localhost:${process.env.PORT ?? 5173}`;
};

export const trpc = createTRPCSolidStart<IAppRouter>({
  config(event) {
    // PageEvent of Solid-start
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers: () => {
            if (isServer && event?.request) {
              // do something
            }
            return {};
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
