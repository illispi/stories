import { withTRPC } from "@trpc/next";
import { AppType } from "next/dist/shared/lib/utils";
import { AppRouter } from "../../../server/src/router";
import { ReactQueryDevtools } from "react-query/devtools";
import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import { getFetch } from "@trpc/client";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
      <ReactQueryDevtools />
    </>
  );
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const urlBase = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/trpc`
      : "http://127.0.0.1:4000/trpc";

    return {
      urlBase,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
      headers: () => {
        if (ctx?.req) {
          // on ssr, forward client's headers to the server
          return {
            ...ctx.req.headers,
            "x-ssr": "1",
          };
        }
        return {};
      },
      fetch: async (url, opts) => {
        const fetch = getFetch();

        return fetch(`${urlBase}/${url}`.replace("undefined/", ""), {
          ...opts,
          credentials: "include",
        });
      },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: true,
})(MyApp);
