import * as Sentry from "@sentry/astro";
import { For, Show, createSignal } from "solid-js";
import CustomButton from "~/components/CustomButton";
import { withProviders } from "~/islands/withProviders";
import { trpc } from "~/utils/trpc";

/** A component that throws while rendering, to exercise the island's ErrorBoundary. */
const Thrower = () => {
	throw new Error(`Sentry test: render error caught by ErrorBoundary (${new Date().toISOString()})`);
};

/**
 * Admin page for checking that errors reach Sentry. Only does anything in a production
 * build with PUBLIC_SENTRY_DSN set; then look under Issues in Sentry (it can take a minute).
 */
const Page = () => {
	const [log, setLog] = createSignal<string[]>([]);
	const [renderBoom, setRenderBoom] = createSignal(false);
	const add = (line: string) => setLog((l) => [`${new Date().toLocaleTimeString()} ${line}`, ...l]);

	const client = Sentry.getClient();
	const enabled = Boolean(client?.getOptions().enabled && client.getDsn());

	const serverMut = trpc.sentryTestError.createMutation(() => ({
		onError: (e) => add(`tRPC server error returned (${e.message}). The server reports it.`),
	}));

	const tests = [
		{
			label: "Uncaught browser error",
			run: () => {
				setTimeout(() => {
					throw new Error(`Sentry test: uncaught browser error (${new Date().toISOString()})`);
				});
				add("Threw an uncaught error in the browser.");
			},
		},
		{
			label: "Unhandled promise rejection",
			run: () => {
				Promise.reject(new Error(`Sentry test: unhandled rejection (${new Date().toISOString()})`));
				add("Rejected a promise without handling it.");
			},
		},
		{
			label: "Captured error (with event id)",
			run: () => {
				const id = Sentry.captureException(
					new Error(`Sentry test: captureException (${new Date().toISOString()})`),
				);
				add(`Sent with captureException, event id ${id}.`);
			},
		},
		{
			label: "Render error (error screen)",
			run: () => {
				add("A component throws while rendering; the error screen should appear.");
				setRenderBoom(true);
			},
		},
		{
			label: "Server error (tRPC)",
			run: () => {
				add("Calling a tRPC procedure that throws on the server…");
				serverMut.mutate();
			},
		},
	];

	return (
		<div class="flex min-h-screen w-full flex-col items-center gap-8 bg-slate-100 py-16">
			<div class="flex w-11/12 max-w-2xl flex-col gap-6 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-10 shadow-xl lg:p-12">
				<h1 class="text-center font-bold text-2xl lg:text-3xl">Test Sentry error reporting</h1>
				<p
					class="rounded-2xl p-4"
					classList={{ "bg-green-50 text-green-800": enabled, "bg-amber-50 text-amber-800": !enabled }}
				>
					{enabled
						? `Sentry is on in this browser (${client?.getDsn()?.host}). Each button sends one test error; check Issues in Sentry.`
						: "Sentry is off here: it only runs in a production build with PUBLIC_SENTRY_DSN set. The buttons still throw, but nothing is sent."}
				</p>
				<div class="flex flex-wrap justify-center">
					<For each={tests}>{(t) => <CustomButton onClick={t.run}>{t.label}</CustomButton>}</For>
					<a
						class="m-2 rounded-full bg-blue-500 p-3 font-semibold text-white transition-all duration-200 ease-in hover:scale-110 hover:bg-blue-600"
						href="/admin/sentry/page-error"
						data-astro-reload
					>
						Server error (page render)
					</a>
				</div>
				<p class="text-slate-600 text-sm">
					"Server error (page render)" opens a page that throws while the server renders it, so you'll
					see an error page; come back with the browser's Back button.
				</p>
				<Show when={log().length}>
					<ul class="flex flex-col gap-1 rounded-xl bg-slate-50 p-4 font-mono text-sm">
						<For each={log()}>{(line) => <li>{line}</li>}</For>
					</ul>
				</Show>
			</div>
			<Show when={renderBoom()}>
				<Thrower />
			</Show>
		</div>
	);
};

export default withProviders(Page);
