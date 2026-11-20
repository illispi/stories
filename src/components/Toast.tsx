import { For, createSignal, onMount } from "solid-js";

type Toast = { id: number; message: string; tone: "success" | "error" };

const [toasts, setToasts] = createSignal<Toast[]>([]);
let nextId = 1;

const dismiss = (id: number) => setToasts((all) => all.filter((t) => t.id !== id));

/** Show a short message at the top of the screen, under the navbar; it disappears after a few seconds. */
export const showToast = (message: string, tone: Toast["tone"] = "success") => {
	const id = nextId++;
	setToasts((all) => [...all, { id, message, tone }]);
	setTimeout(() => dismiss(id), 6000);
};

/**
 * Renders the toasts. Put one in each page island that calls showToast, outside any
 * <Suspense> (a refetch can briefly unmount what's inside one). Rendered in place
 * (position: fixed), not in a Portal: Astro's page transitions swap <body>.
 */
export function Toaster() {
	return (
		<div
			class="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-3 px-4"
			role="status"
			aria-live="polite"
		>
			<For each={toasts()}>
				{(toast) => (
					<div
						class="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl px-6 py-4 font-semibold text-lg text-white shadow-2xl ring-2 ring-white/70"
						classList={{ "bg-green-600": toast.tone === "success", "bg-red-600": toast.tone === "error" }}
						ref={(el) => {
							// Animate only once the element is in the page. Solid creates elements from a
							// <template> (an inert document), and an animation started there never runs,
							// leaving the toast stuck at its first frame (invisible).
							onMount(() => {
								if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
								el.animate(
									[
										{ opacity: 0, transform: "translateY(-12px)" },
										{ opacity: 1, transform: "translateY(0)" },
									],
									{ duration: 200, easing: "ease-out" },
								);
							});
						}}
					>
						<span>{toast.message}</span>
						<button
							type="button"
							class="rounded-full px-2 text-lg leading-none opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
							aria-label="Dismiss"
							onClick={() => dismiss(toast.id)}
						>
							×
						</button>
					</div>
				)}
			</For>
		</div>
	);
}
