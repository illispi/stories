import { For, createSignal, onCleanup } from "solid-js";

type Toast = { id: number; message: string; tone: "success" | "error" };

const [toasts, setToasts] = createSignal<Toast[]>([]);
let nextId = 1;

const dismiss = (id: number) => setToasts((all) => all.filter((t) => t.id !== id));

/** Show a short message at the bottom of the screen; it disappears after a few seconds. */
export const showToast = (message: string, tone: Toast["tone"] = "success") => {
	const id = nextId++;
	setToasts((all) => [...all, { id, message, tone }]);
	setTimeout(() => dismiss(id), 5000);
};

/**
 * Renders the toasts. Put one in each page island that calls showToast. Rendered in place
 * (position: fixed), not in a Portal: Astro's page transitions swap <body>.
 */
export function Toaster() {
	onCleanup(() => setToasts([]));
	return (
		<div
			class="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-3 px-4"
			role="status"
			aria-live="polite"
		>
			<For each={toasts()}>
				{(toast) => (
					<div
						class="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl px-5 py-3 font-semibold text-white shadow-xl"
						classList={{ "bg-green-600": toast.tone === "success", "bg-red-600": toast.tone === "error" }}
						ref={(el) => {
							if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
								el.animate(
									[
										{ opacity: 0, transform: "translateY(12px)" },
										{ opacity: 1, transform: "translateY(0)" },
									],
									{ duration: 200, easing: "ease-out" },
								);
							}
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
