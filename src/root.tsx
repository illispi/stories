// @refresh reload
import { Suspense, createEffect, createRenderEffect, onCleanup } from "solid-js";
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
import { QueryClientProvider, isServer } from "@tanstack/solid-query";
import { createScriptLoader } from "@solid-primitives/script-loader";

export default function Root() {
  createEffect(() => {
    history.scrollRestoration = "manual";
  });

  if (typeof window !== "undefined") {
    window.sentryOnLoad = function () {
      Sentry.init({
        dsn: "https://6c35044a4e254aac8526a4ebe0391010@glitchtip.delvis.org/1",
        tracesSampleRate: 1.0,
      });

      console.log(Sentry, "sentry");
    };
  }

  createScriptLoader({
    src: "https://browser.sentry-cdn.com/7.88.0/bundle.min.js",
    crossorigin: "anonymous",
  });

  // createScriptLoader({
  //   src: "https://umami.delvis.org/script.js",
  //   "data-website-id": "ba170e55-8926-4fc2-a36f-a4bbcd2ebd83",
  //   async: true,
  // });

  const script = document.createElement("script");
  if (!isServer) {
    script.src = "https://umami.delvis.org/script.js";
    script.async = true;
    script["data-website-id"] = "ba170e55-8926-4fc2-a36f-a4bbcd2ebd83";
  }

  createRenderEffect(() => {
    document.head.appendChild(script);
  });
  onCleanup(
    () => document.head.contains(script) && document.head.removeChild(script)
  );

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
                <button
                  onClick={() => {
                    throw new Error("Sentry Frontend Error");
                  }}
                >
                  Break the world
                </button>
                ;
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
