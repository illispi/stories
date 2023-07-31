// @refresh reload
import "./root.css";
import { Suspense } from "solid-js";
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
import GlobalTransition from "./components/GlobalTransition";
import { SessionProvider } from "@solid-auth/base/client";

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>Schizophrenia poll</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <SessionProvider>
          <QueryProvider>
            <Suspense>
              <ErrorBoundary>
                <NavBar />
                <GlobalTransition>
                  <Routes>
                    <FileRoutes />
                  </Routes>
                </GlobalTransition>
              </ErrorBoundary>
            </Suspense>
            <Scripts />
          </QueryProvider>
        </SessionProvider>
      </Body>
    </Html>
  );
}
