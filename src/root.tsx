// @refresh reload
import { Suspense, createEffect } from "solid-js";
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
// import GlobalTransition from "./components/GlobalTransition";
import CustomButton from "./components/CustomButton";
import TransitionSlideGlobal from "./components/TransitionSlideGlobal";
import { queryClient, trpc } from "./utils/trpc";
import { QueryClientProvider } from "@tanstack/solid-query";

export default function Root() {
  createEffect(() => {
    history.scrollRestoration = "manual";
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
