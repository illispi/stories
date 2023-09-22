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

export default function Root() {
  createEffect(() => {
    window.addEventListener("popstate", () => {
      document.body.dataset.nav = "true";
    });
  });
  return (
    <Html lang="en">
      <Head>
        <Title>Schizophrenia poll</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body class="min-h-screen lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
        <QueryProvider>
          <Suspense>
            <ErrorBoundary>
              <NavBar />
              <TransitionSlide>
                <Routes>
                  <FileRoutes />
                </Routes>
              </TransitionSlide>
            </ErrorBoundary>
          </Suspense>
        </QueryProvider>
        <Scripts />
      </Body>
    </Html>
  );
}
