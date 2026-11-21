import { Show, createSignal, onCleanup, onMount } from "solid-js";
import { A } from "~/utils/router";
import { trpc } from "~/utils/trpc";
import { ModalOptions } from "./ModalOptions";

/**
 * Admin-only bell: how many polls and articles are waiting for review. Separate from the
 * user's own notification bell. Refreshes on every page change and once a minute.
 */
const AdminBell = () => {
	const pending = trpc.pendingCounts.createQuery(undefined, () => ({
		placeholderData: (prev) => prev,
		refetchInterval: 60_000,
	}));
	const [open, setOpen] = createSignal(false);

	onMount(() => {
		const refresh = () => pending.refetch();
		document.addEventListener("astro:after-swap", refresh);
		onCleanup(() => document.removeEventListener("astro:after-swap", refresh));
	});

	const total = () => pending.data?.total ?? 0;

	const Row = (props: { label: string; count: number; href: string }) => (
		<A
			href={props.href}
			class="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:bg-blue-50"
			onClick={() => setOpen(false)}
		>
			<span class="text-lg">{props.label}</span>
			<span
				class="min-w-8 rounded-full px-2 py-0.5 text-center font-semibold"
				classList={{
					"bg-amber-100 text-amber-800": props.count > 0,
					"bg-slate-100 text-slate-500": props.count === 0,
				}}
			>
				{props.count}
			</span>
		</A>
	);

	return (
		<>
			<div class="flex h-12 w-12 items-center justify-center transition-transform duration-200 ease-out active:scale-150 hover:scale-125">
				<button
					type="button"
					class="relative"
					onClick={() => setOpen(!open())}
					aria-label={`Review queue: ${total()} waiting`}
				>
					{/* Clipboard with a check: "things to review", distinct from the user bell */}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
						height="2em"
						width="2em"
					>
						<title>Review queue</title>
						<rect x="5" y="4" width="14" height="17" rx="2" />
						<path d="M9 4.5V3h6v1.5" />
						<path d="m9 13 2 2 4-4" />
					</svg>
					<Show when={total() > 0}>
						<span class="-top-1 -right-2 absolute min-w-5 rounded-full bg-red-600 px-1 text-center font-bold text-white text-xs leading-5">
							{total() > 99 ? "99+" : total()}
						</span>
					</Show>
				</button>
			</div>

			<ModalOptions inline setShow={setOpen} show={open()}>
				<div class="flex w-11/12 max-w-md flex-col gap-4 rounded-3xl border-fuchsia-600 border-t-4 bg-white p-8 shadow-xl">
					<h2 class="mb-2 text-center font-bold text-2xl">Waiting for review</h2>
					<Row label="Personal polls" count={pending.data?.personal ?? 0} href="/admin/adminCrud" />
					<Row label="Other polls" count={pending.data?.their ?? 0} href="/admin/adminCrud?pOrT=Their_questions" />
					<Row label="Articles" count={pending.data?.articles ?? 0} href="/admin/adminCrud?tab=articles" />
					<Show when={pending.isError}>
						<p class="text-center text-red-600">Couldn't load the review queue.</p>
					</Show>
				</div>
			</ModalOptions>
		</>
	);
};

export default AdminBell;
