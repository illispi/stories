import type { ParentComponent } from "solid-js";
import { Show, Suspense, createEffect, createSignal } from "solid-js";
import { Transition } from "solid-transition-group";
import Footer from "./Footer";
import { useIsRouting } from "@solidjs/router";

const TransitionSlideGlobal: ParentComponent = (props) => {
	const [vis, setVis] = createSignal(false);

	const [reload, setReload] = createSignal(true);
	const [scrollPrev, setScrollPrev] = createSignal(0);
	const [scrollTo, setScrollTo] = createSignal(0);
	const [scrollNow, setScrollNow] = createSignal(false);
	const [scrollReload, setScrollReload] = createSignal(0);

	const [animate, setAnimate] = createSignal(false);

	const isRouting = useIsRouting();

	//TODO check that back gesture animates

	createEffect(() => {
		window.addEventListener("popstate", () => {
			setScrollNow(true);
		});

		window.addEventListener("scroll", () => {
			setScrollReload(window.scrollY);
		});

		window.addEventListener("beforeunload", () => {
			localStorage.setItem("scrollPos", String(scrollReload()));
		});

		window.onload = () => {
			setTimeout(() => {
				setAnimate(true);
			}, 500);
		};

		if (isRouting()) {
			setAnimate(true);
		}
	});
	return (
		<div>
			<Transition
				onBeforeExit={() => {
					setScrollPrev(scrollTo());
					setScrollTo(window.scrollY);
					setReload(false);
					setVis(false);
				}}
				onEnter={(el, done) => {
					if (scrollNow() === true) {
						window.scrollTo(0, scrollPrev());
						setScrollNow(false);
					} else if (reload() === false) {
						window.scrollTo(0, 0);
					} else {
						window.scrollTo(0, Number(localStorage.getItem("scrollPos") ?? 0));
					}

					const a = animate()
						? el.animate(
								[
									{
										opacity: 0,
										transform: "translate(100px)",
										easing: "ease-out",
									},
									{ opacity: 1, transform: "translate(0)" },
								],
								{
									duration: 300,
								},
							)
						: el.animate([]);

					setVis(true);
					a.finished.then(done);
				}}
				onExit={(el, done) => {
					const a = el.animate(
						[
							{
								opacity: 1,
								transform: "translate(0)",
								easing: "ease-in",
							},
							{ opacity: 0, transform: "translate(-100px)" },
						],
						{
							duration: 300,
						},
					);
					a.finished.then(done);
				}}
				mode="outin"
			>
				<Suspense>{props.children}</Suspense>
			</Transition>
			<Transition
				onEnter={(el, done) => {
					const a = animate()
						? el.animate(
								[
									{
										opacity: 0,
										transform: "translate(100px)",
										easing: "ease-out",
									},
									{ opacity: 1, transform: "translate(0)" },
								],
								{
									duration: 300,
								},
							)
						: el.animate([]);
					a.finished.then(done);
				}}
				onExit={(el, done) => {
					const a = el.animate(
						[
							{
								opacity: 1,
								transform: "translate(0)",
								easing: "ease-in",
							},
							{ opacity: 0, transform: "translate(-100px)" },
						],
						{
							duration: 300,
						},
					);
					a.finished.then(done);
				}}
				mode="outin"
			>
				<Show when={vis()}>
					<Footer />
				</Show>
			</Transition>
		</div>
	);
};
export default TransitionSlideGlobal;
