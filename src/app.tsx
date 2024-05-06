// @refresh reload
import {
	ErrorBoundary,
	Suspense,
	createEffect,
	createRenderEffect,
	onCleanup,
} from "solid-js";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";

// import NavBar from "./components/Navbar";
import "./app.css";
import CustomButton from "./components/CustomButton";
import TransitionSlideGlobal from "./components/TransitionSlideGlobal";
import { queryClient, trpc } from "./utils/trpc";
import { QueryClientProvider } from "@tanstack/solid-query";
import { createScriptLoader } from "@solid-primitives/script-loader";
import { isServer } from "solid-js/web";
import * as Sentry from "@sentry/browser";
import { DEV } from "solid-js";

export default function App() {
	createEffect(() => {
		history.scrollRestoration = "manual";
	});

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

	if (!isServer) {
		const script = document.createElement("script");
		script.src = "https://umami.delvis.org/script.js";
		script.async = true;
		script.setAttribute(
			"data-website-id",
			"cbdde5c6-7ae6-4d53-9f16-cf558c6110bd",
		);
		createRenderEffect(() => {
			document.head.appendChild(script);
		});
		onCleanup(
			() => document.head.contains(script) && document.head.removeChild(script),
		);
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
									<Suspense>
										{/* <NavBar /> */}
										<TransitionSlideGlobal>
											{props.children}
										</TransitionSlideGlobal>
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
