// @refresh reload
import {
  Suspense,
  createEffect,
  createRenderEffect,
  onCleanup,
} from "solid-js";
import {
  A,
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import NavBar from "./components/Navbar";
import "./root.css";
import CustomButton from "./components/CustomButton";
import TransitionSlideGlobal from "./components/TransitionSlideGlobal";
import { queryClient, trpc } from "./utils/trpc";
import { QueryClientProvider } from "@tanstack/solid-query";
import { createScriptLoader } from "@solid-primitives/script-loader";
import { isServer } from "solid-js/web";
import * as Sentry from "@sentry/browser";
import { DEV } from "solid-js";

export default function Root() {
  createEffect(() => {
    history.scrollRestoration = "manual";
  });

  if (!DEV) {
    //NOTE update sentry sourcemaps https://docs.sentry.io/platforms/javascript/guides/solid/
    Sentry.init({
      dsn: "https://6c35044a4e254aac8526a4ebe0391010@glitchtip.delvis.org/1",
      integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 0.1,

      // // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
      // tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],

      // Capture Replay for 10% of all sessions,
      // plus 100% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }

  createScriptLoader({
    src: "https://umami.delvis.org/script.js",
    async: true,
    "data-website-id": "ba170e55-8926-4fc2-a36f-a4bbcd2ebd83",
  });

  return (
    <Html lang="en">
      <Head>
        <Title>Schizophrenia poll</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body class="min-h-screen lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
        <QueryClientProvider client={queryClient}>
          <trpc.Provider queryClient={queryClient}>
            <ErrorBoundary
              fallback={(e, reset) => {
                Sentry.captureException(e);
                return (
                  <div class="flex min-h-screen w-full flex-col items-center justify-center gap-4">
                    <div class="flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
                      <h1 class="text-center text-2xl">Error occured!</h1>
                      <h2 class="text-center">{`Message: ${e.message}`}</h2>
                      <CustomButton onClick={reset}>Try again</CustomButton>
                    </div>
                  </div>
                );
              }}
            >
              <Suspense>
                <NavBar />
                <TransitionSlideGlobal>
                  <Routes>
                    <FileRoutes />
                  </Routes>
                </TransitionSlideGlobal>
              </Suspense>
            </ErrorBoundary>
          </trpc.Provider>
        </QueryClientProvider>
        <Scripts />
      </Body>
    </Html>
  );
}
