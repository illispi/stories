// @refresh reload
import { QueryProvider } from "@prpc/solid";
import { Suspense, createEffect } from "solid-js";
import {
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
import TransitionSlide from "./components/TransitionSlide";
import { QueryClient } from "@tanstack/solid-query";
import CustomButton from "./components/CustomButton";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
});

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
        <QueryProvider queryClient={queryClient}>
          <ErrorBoundary
            fallback={(e, reset) => {
              return (
                <div>
                  <h2>{e.message}</h2>
                  <CustomButton onClick={reset}>Try again</CustomButton>
                </div>
              );
            }}
          >
            <Suspense>
              <NavBar />
              <TransitionSlide>
                <Routes>
                  <FileRoutes />
                </Routes>
              </TransitionSlide>
            </Suspense>
          </ErrorBoundary>
        </QueryProvider>
        <Scripts />
      </Body>
    </Html>
  );
}
