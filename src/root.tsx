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
      <Body>
        <QueryProvider>
          <Suspense>
            <ErrorBoundary>
              <NavBar />
              <Transition
                onBeforeExit={() => {
                  document.body.dataset.scrollY = String(window.scrollY);
                }}
                onEnter={(el, done) => {
                  if (document.body.dataset.nav === "true") {
                    document.body.dataset.nav = "false";
                    console.log(
                      "scrollingTo",
                      document.body.dataset.scrollYPrev
                    );
                    window.scrollTo(
                      0,
                      Number(document.body.dataset.scrollYPrev)
                    );
                  } else {
                    console.log("scrollingTo", "0");
                    document.body.dataset.scrollYPrev =
                      document.body.dataset.scrollY;
                    window.scrollTo(0, 0);
                  }

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
