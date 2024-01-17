// utils/trpc.ts
import { QueryClient } from "@tanstack/solid-query";
import type { IAppRouter } from "~/server/trpc/router/_app";

import { httpBatchLink } from "@trpc/client";
import { isServer } from "solid-js/web";
import { createTRPCSolidStart } from "@solid-mediakit/trpc";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  return `${
    process.env.NODE_ENV === "production"
      ? process.env.SITE
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
          //   headers: () => {
          //     if (isServer && event?.request) {
          //       // do something
          //     }
          //     return {};
          //   },
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
