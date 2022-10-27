import { withTRPC } from "@trpc/next";
import { AppType } from "next/dist/shared/lib/utils";
import { AppRouter } from "../../../server/src/router";
import { ReactQueryDevtools } from "react-query/devtools";
import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import { getFetch } from "@trpc/client";
import NavBar from "../components/NavBar";
import { trpc } from "../utils/trpc";
import { useEffect } from "react";
import { domAnimation, LazyMotion } from "framer-motion";

const MyApp: AppType = ({ Component, pageProps }) => {
  const createCookie = trpc.createCookie.useMutation();
  useEffect(() => {
    // createCookie.mutate(null, { onSuccess: () => utils.invalidateQueries() }); const utils = trpc.useContext();
    //NOTE just a example to invalidate queries if needed
    createCookie.mutate(null);
  }, []);

  return (
    <>
      <NavBar></NavBar>
      <Component {...pageProps} />
      {/* <ReactQueryDevtools /> */}
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
      : `http://${process.env.IP_DEV}:4000/trpc`;

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
