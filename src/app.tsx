// @refresh reload
import { MetaProvider, Title } from "@solidjs/meta";
import { Router, useNavigate } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, Suspense, createEffect } from "solid-js";

// import NavBar from "./components/Navbar";
import * as Sentry from "@sentry/browser";
import { createScriptLoader } from "@solid-primitives/script-loader";
import { QueryClientProvider } from "@tanstack/solid-query";
import { isServer } from "solid-js/web";
import "./app.css";
import CustomButton from "./components/CustomButton";
import NavBar from "./components/Navbar";
import { queryClient, trpc } from "./utils/trpc";
import TransitionSlideGlobal from "./components/TransitionSlideGlobal";
import Footer from "./components/Footer";
import VtApi from "./components/VtApi";

export default function App() {
	createEffect(() => {
		history.scrollRestoration = "manual";
	});

	if (import.meta.env.PROD) {
		//NOTE update sentry sourcemaps https://docs.sentry.io/platforms/javascript/guides/solid/
		Sentry.init({
			dsn: "https://3a32bedf009e401cbf2249d2b82e97bb@glitchtip.delvis.org/1",
			// integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],

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
	//TODO change these to env files and use fixed script loader, same with dsn:
	if (!isServer && import.meta.env.PROD) {
		createScriptLoader({
			src: "https://umami.delvis.org/script.js",
			"data-website-id": "77657924-9c0f-47e6-9bd1-a282a883c2c9",
			async: true,
		});
	}

	return (
		<Router
			root={(props) => (
				<MetaProvider>
					<Title>Schizophrenia poll</Title>

					<Suspense>
						<QueryClientProvider client={queryClient}>
							<trpc.Provider queryClient={queryClient}>
								<ErrorBoundary
									fallback={(e, reset) => {
										if (import.meta.env.PROD) {
											Sentry.captureException(e);
										}
										console.log(e);
										return (
											<div class="fixed top-0 left-0 z-40 flex h-screen w-screen items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-500">
												<div class="flex max-h-96 w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
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

										{/* <TransitionSlideGlobal> */}
										<VtApi>{props.children}</VtApi>
										{/* </TransitionSlideGlobal> */}
										<Footer></Footer>
									</Suspense>
								</ErrorBoundary>
							</trpc.Provider>
						</QueryClientProvider>
					</Suspense>
				</MetaProvider>
			)}
		>
			<FileRoutes />
		</Router>
	);
}
