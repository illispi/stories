import * as Sentry from "@sentry/browser";
import { QueryClientProvider } from "@tanstack/solid-query";
import { type Component, ErrorBoundary, Suspense } from "solid-js";
import CustomButton from "~/components/CustomButton";
import { ParamsContext } from "~/utils/router";
import { queryClient } from "~/utils/trpc";

type IslandProps = { params?: Record<string, string | undefined> };

/** Wraps a page component for use as an Astro island (client:only="solid-js"). */
export const withProviders =
	<P extends object>(Page: Component<P>) =>
	(props: P & IslandProps) => (
		<QueryClientProvider client={queryClient}>
			<ParamsContext.Provider value={props.params ?? {}}>
				<ErrorBoundary
					fallback={(e, reset) => {
						if (import.meta.env.PROD) Sentry.captureException(e);
						console.error(e);
						return (
							<div class="fixed top-0 left-0 z-40 flex h-screen w-screen items-center justify-center bg-black/30 backdrop-blur-sm transition-all duration-500">
								<div class="flex max-h-96 w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
									<h1 class="text-center text-2xl">Error occured!</h1>
									<h2 class="text-center">{`Message: ${e instanceof Error ? e.message : String(e)}`}</h2>
									<CustomButton onClick={reset}>Try again</CustomButton>
								</div>
							</div>
						);
					}}
				>
					<Suspense>
						<Page {...props} />
					</Suspense>
				</ErrorBoundary>
			</ParamsContext.Provider>
		</QueryClientProvider>
	);
