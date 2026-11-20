import type { ParentComponent } from "solid-js";
import { Transition } from "solid-transition-group";

const DURATION = 300;
const EASING = "ease-in-out";

/**
 * Slides the old page out and the new one in ("outin"). The wrapper's height is held
 * while the old page leaves and then animated to the new page's height, so content
 * below doesn't jump when the two pages differ in height.
 */
const TransitionSlide: ParentComponent<{ dir: number }> = (props) => {
	let box!: HTMLDivElement;
	let heightAnim: Animation | undefined;

	const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	return (
		<div ref={box}>
			<Transition
				mode="outin"
				onExit={(el, done) => {
					// Keep the space the old page takes until the new one is measured
					heightAnim?.cancel();
					box.style.height = `${box.offsetHeight}px`;
					box.style.overflow = "hidden";
					if (reduced()) return done();
					el.animate(
						[
							{ opacity: 1, transform: "translate(0)" },
							{ opacity: 0, transform: `translate(${props.dir * -100}px)` },
						],
						{ duration: DURATION, easing: EASING },
					).finished.then(done);
				}}
				onEnter={(el, done) => {
					const from = box.offsetHeight;
					const to = (el as HTMLElement).offsetHeight;
					const release = () => {
						box.style.height = "";
						box.style.overflow = "";
					};
					if (reduced() || !box.style.height) {
						release();
						return done();
					}
					heightAnim = box.animate([{ height: `${from}px` }, { height: `${to}px` }], {
						duration: DURATION,
						easing: EASING,
					});
					heightAnim.finished.then(release, () => {});
					el.animate(
						[
							{ opacity: 0, transform: `translate(${props.dir * 100}px)` },
							{ opacity: 1, transform: "translate(0)" },
						],
						{ duration: DURATION, easing: EASING },
					).finished.then(done);
				}}
			>
				{props.children}
			</Transition>
		</div>
	);
};

export default TransitionSlide;
