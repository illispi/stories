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

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>Schizophrenia poll</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <QueryProvider>
          <Suspense>
            <ErrorBoundary>
              <NavBar />
              <Transition
                onBeforeEnter={() => {
                  window.scrollTo(0, 0);
                }}
                onEnter={(el, done) => {
                  const a = el.animate(
                    [
                      {
                        opacity: 0,
                        transform: "translate(100px)",
                        easing: "ease-out",
                      },
                      { opacity: 1, transform: "translate(0)" },
                    ],
                    {
                      duration: 300,
                    }
                  );
                  a.finished.then(done);
                }}
                onExit={(el, done) => {
                  const a = el.animate(
                    [
                      {
                        opacity: 1,
                        transform: "translate(0)",
                        easing: "ease-in",
                      },
                      { opacity: 0, transform: "translate(-100px)" },
                    ],
                    {
                      duration: 300,
                    }
                  );
                  a.finished.then(done);
                }}
                mode="outin"
              >
                <Routes>
                  <FileRoutes />
                </Routes>
              </Transition>
              <Footer />
            </ErrorBoundary>
          </Suspense>
          <Scripts />
        </QueryProvider>
      </Body>
    </Html>
  );
}
