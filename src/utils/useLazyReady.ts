import { type Accessor, createEffect, createSignal } from "solid-js";

/**
 * True once the chart should be drawn. Without `shown`, that's straight away.
 * With `shown` (the IntersectionObserver list kept by the Compare and PollResults views),
 * it waits until this element has scrolled into view, then tells the view to forget it.
 */
export function useLazyReady(
	el: Accessor<Element | undefined>,
	props: { shown?: Element[]; removeShown?: (el: Element) => void },
) {
	const [ready, setReady] = createSignal(false);

	createEffect(() => {
		const target = el();
		if (!target || ready()) return;
		if (!props.shown) {
			setReady(true);
			return;
		}
		if (props.shown.includes(target)) {
			props.removeShown?.(target);
			setReady(true);
		}
	});

	return ready;
}
