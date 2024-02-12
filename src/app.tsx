// @refresh reload
import { MetaProvider, Title } from "@solidjs/meta";
import { Router, useIsRouting } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { edenTreaty } from "@elysiajs/eden";
import { clientEnv } from "~/utils/env/client";
import type { App } from "./routes/api/elysia";
import "./app.css";
import {
  DEV,
  ErrorBoundary,
  Suspense,
  createEffect,
  createRenderEffect,
  onCleanup,
} from "solid-js";
import * as Sentry from "@sentry/browser";
import { isServer } from "solid-js/web";
import CustomButton from "./components/CustomButton";
import NavBar from "./components/Navbar";
import TransitionSlideGlobal from "./components/TransitionSlideGlobal";
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools";
import { Transition } from "solid-transition-group";
import { createScriptLoader } from "@solid-primitives/script-loader";

export const eden = edenTreaty<App>(clientEnv.HOST_URL);

const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
});

export default function App() {
  createEffect(() => {
    history.scrollRestoration = "manual";
  });

  if (import.meta.dev) {
    //TODO update sentry sourcemaps https://docs.sentry.io/platforms/javascript/guides/solid/
    Sentry.init({
      dsn: "https://09e78b39946f40fca743b5dfee2f9871@glitchtip.delvis.org/1",
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

  if (!isServer) {
    createScriptLoader({
      src: "https://umami.delvis.org/script.js",
      "data-website-id": "ba170e55-8926-4fc2-a36f-a4bbcdeffeefedfed2ebd83",
      async: true,
    });
  }

  return (
    <Router
      root={(props) => (
        <QueryClientProvider client={queryClient}>
          <MetaProvider>
            <Title>Schizophrenia poll</Title>
            <ErrorBoundary
              fallback={(e, reset) => {
                if (import.meta.dev) {
                  Sentry.captureException(e);
                }
                console.log(e);
                return (
                  <div class="flex min-h-screen w-full flex-col items-center justify-center gap-4">
                    <div class="flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
                      <h1 class="text-center text-2xl">Error occured!</h1>
                      <h2 class="text-center">{`Message: ${e.message}`}</h2>
                      <CustomButton onClick={reset}>Try again</CustomButton>
                    </div>
                  </div>
                );
              }}>
              <Suspense>
                <NavBar />
                {/* <TransitionSlideGlobal>{props.children}</TransitionSlideGlobal> */}
                {props.children}
              </Suspense>
            </ErrorBoundary>
            <SolidQueryDevtools initialIsOpen={false} />
          </MetaProvider>
        </QueryClientProvider>
      )}>
      <FileRoutes />
    </Router>
  );
}
