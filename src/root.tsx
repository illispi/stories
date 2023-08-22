// @refresh reload
import "./root.css";
import { Suspense, createEffect, createSignal, onMount } from "solid-js";
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
import { QueryProvider } from "@prpc/solid";
// import GlobalTransition from "./components/GlobalTransition";
import Footer from "./components/Footer";
import { Transition } from "solid-transition-group";
import TransitionSlide from "./components/TransitionSlide";
import TransitionFade from "./components/TransitionFade";

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
              <div class="flex min-h-screen flex-col">
                <TransitionSlide>
                  <Routes>
                    <FileRoutes />
                  </Routes>
                </TransitionSlide>
              </div>
              <Footer />
            </ErrorBoundary>
          </Suspense>
          <Scripts />
        </QueryProvider>
      </Body>
    </Html>
  );
}
