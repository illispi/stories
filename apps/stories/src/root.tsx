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
  useRouteData,
} from "solid-start";
import NavBar from "./components/Navbar";
import CreateUser from "./components/CreateUser";
import { QueryProvider } from "@prpc/solid";
import { QueryClient } from "@tanstack/solid-query";

const queryClient = new QueryClient();

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>Schizophrenia poll</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <QueryProvider queryClient={queryClient}>
          <Suspense>
            <ErrorBoundary>
              <NavBar />
              <CreateUser />
              <Routes>
                <FileRoutes />
              </Routes>
            </ErrorBoundary>
          </Suspense>
          <Scripts />
        </QueryProvider>
      </Body>
    </Html>
  );
}
