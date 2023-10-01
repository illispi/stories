// @refresh reload
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
import CustomButton from "./components/CustomButton";
import TransitionSlideGlobal from "./components/TransitionSlideGlobal";
import { queryClient, trpc } from "./utils/trpc";



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
        <trpc.Provider queryClient={queryClient}>
          <ErrorBoundary
            fallback={(e, reset) => {
              return (
                <div class="flex min-h-screen w-full flex-col items-center justify-center">
                  <h2>{e.message}</h2>
                  <CustomButton onClick={reset}>Try again</CustomButton>
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
        <Scripts />
      </Body>
    </Html>
  );
}
