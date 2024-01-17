import { DEV, type Component } from "solid-js";
import * as Sentry from "@sentry/browser";
import { queryClient, trpc } from "../pages/trpc/[trpc]";
import { QueryClientProvider } from "@tanstack/solid-query";

const Nav: Component<{}> = (props) => {

    if (!DEV) {
        //NOTE update sentry sourcemaps https://docs.sentry.io/platforms/javascript/guides/solid/
        Sentry.init({
          dsn: "https://09e78b39946f40fca743b5dfee2f9871@glitchtip.delvis.org/1",
          integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
    
          // Set tracesSampleRate to 1.0 to capture 100%
          // of transactions for performance monitoring.
          // We recommend adjusting this value in production
          tracesSampleRate: 0.1,
    
          // // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
          // tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    
          // Capture Replay for 10% of all sessions,
          // plus 100% of sessions with an error
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        });
      }
  
  return (     <QueryClientProvider client={queryClient}>
    <trpc.Provider queryClient={queryClient}>
      <ErrorBoundary
        fallback={(e, reset) => {
          Sentry.captureException(e);
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
          <NavBar />

      </ErrorBoundary>
    </trpc.Provider>
  </QueryClientProvider>);
};

export default Nav;