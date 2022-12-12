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
import { AnimatePresence, domAnimation, LazyMotion } from "framer-motion";
import { QueryClient, QueryClientProvider } from "react-query";
import router from "next/router";
import Layout from "../components/Layout";

const queryClientTest = new QueryClient();

const MyApp: AppType = ({ Component, pageProps, router }) => {
  const createCookie = trpc.createCookie.useMutation();
  useEffect(() => {
    // createCookie.mutate(null, { onSuccess: () => utils.invalidateQueries() }); const utils = trpc.useContext();
    //NOTE just a example to invalidate queries if needed
    createCookie.mutate(null);
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClientTest}>
        <NavBar></NavBar>
        <LazyMotion features={domAnimation}>
          <AnimatePresence
            mode="wait"
            key={router.asPath}
            onExitComplete={() => window.scrollTo(0, 0)}
          >
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </AnimatePresence>
        </LazyMotion>
        <ReactQueryDevtools />
      </QueryClientProvider>
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
      queryClient: queryClientTest,
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
