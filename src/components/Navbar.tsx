import { Title } from "@solidjs/meta";
import { A, useSearchParams } from "@solidjs/router";
import { route as routeGen } from "routes-gen";
import type { Accessor, Component, Setter } from "solid-js";
import {
	ErrorBoundary,
	Show,
	Suspense,
	createEffect,
	createSignal,
} from "solid-js";

import Auth from "./Auth";
import { trpc } from "~/utils/trpc";
import BellNotification from "./BellNotification";

const MenuItem: Component<{ route: string; content: string }> = (props) => {
	return (
		<>
			<A
				class={`text-3xl font-light uppercase transition-all hover:scale-110 ${props.class}`}
				href={props.route}
			>
				{props.content}
			</A>
		</>
	);
};

//NOTE remove this comment

const Hamburger: Component<{
	menuOpen: Accessor<boolean>;
	setMenuOpen: Setter<boolean>;
}> = (props) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const authQuery = trpc.authStatus.createQuery();

	const [reloaded, setReloaded] = createSignal(false);

	createEffect(() => {
		window.addEventListener("popstate", (event) => {
			if (searchParams.nav === "true") {
				setSearchParams({ nav: null });
			}
		});
		if (window.performance.getEntriesByType && !reloaded()) {
			if (
				window.performance.getEntriesByType("navigation")[0].type === "reload"
			) {
				setReloaded(true);
				if (searchParams.nav === "true") {
					setSearchParams({ nav: null });
				}
			}
		}

		//TODO if open and close nav and then go back history is gone
		//BUG on mobile refresh has nav on bit weird position, might be able to solve with start disabled, see personalQuestions.tsx motion.one
	});

	return (
		<>
			<div class="relative w-12 h-12  flex justify-center items-center ">
				<button
					type="button"
					class="absolute transition-transform duration-200 ease-out hover:scale-125 active:scale-150"
					onClick={() => {
						if (searchParams.nav === "true") {
							setSearchParams({ nav: null });
						} else {
							setSearchParams({ nav: true });
						}
					}}
				>
					<Show
						when={searchParams.nav === "true"}
						fallback={
							<svg
								fill="none"
								stroke-width="2"
								xmlns="http://www.w3.org/2000/svg"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								viewBox="0 0 24 24"
								height="2em"
								width="2em"
								style="overflow: visible; color: currentcolor;"
							>
								<title>Menu</title>
								<path d="M3 12 21 12" />
								<path d="M3 6 21 6" />
								<path d="M3 18 21 18" />
							</svg>
						}
					>
						<svg
							fill="currentColor"
							stroke-width="0"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 1024 1024"
							height="2em"
							width="2em"
							style="overflow: visible; color: currentcolor;"
						>
							<title>Close</title>
							<path d="m563.8 512 262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" />
						</svg>
					</Show>
				</button>
			</div>

			<div
				class="fixed right-0 top-14 z-30 h-screen w-screen bg-slate-950 transition-all duration-300"
				classList={{
					["opacity-0 invisible"]: !searchParams.nav,
					["visible, opacity-40"]: searchParams.nav === "true",
				}}
				onClick={() => {
					setSearchParams({ nav: null });
				}}
			/>
			<div
				class={`fixed right-0 top-14 z-30 flex items-center justify-start gap-6 p-8 ${
					searchParams.nav === "true"
						? `translate-x-0 opacity-100 ease-out`
						: `translate-x-full opacity-0 ease-in`
				} h-screen w-80 flex-col border-l border-blue-400 bg-blue-200 transition-all duration-300`}
			>
				<Auth />
				<Suspense>
					<ErrorBoundary
						fallback={(err) => {
							console.log(err);
							return <div>err</div>;
						}}
					>
						<Show when={authQuery.data?.user}>
							<MenuItem route={routeGen("/user/data")} content="Your data" />
						</Show>
					</ErrorBoundary>
				</Suspense>
				<div class="w-full border-b-2 border-black" />
				<MenuItem route={routeGen("/pollResults/")} content="results" />
				<MenuItem route={routeGen("/questionares/")} content="poll" />
				<MenuItem route={routeGen("/articles/")} content="Articles" />
				<Show when={import.meta.env.DEV}>
					<MenuItem route={"/testing/"} content="Testing" />
				</Show>
				<Show when={authQuery.data?.admin}>
					<MenuItem route={"/admin/"} content="admin" />
				</Show>
				<button
					type="button"
					class="p-16 transition-all hover:scale-125"
					onClick={() => {
						setSearchParams({ nav: null });
					}}
				>
					<div class="rounded-full border border-black p-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="currentColor"
							viewBox="0 0 24 24"
							stroke-width="0.6"
							stroke="currentColor"
							class="h-16 w-16"
						>
							<title>idk</title>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</div>
				</button>
			</div>
		</>
	);
};

const NavBar: Component = () => {
	const [menuOpen, setMenuOpen] = createSignal(false);

	const authStatusQ = trpc.authStatus.createQuery();

	return (
		<>
			<Title>Home</Title>
			<div class="sticky top-0 z-40 flex w-full items-center justify-between bg-gradient-to-b from-blue-200 to-blue-300">
				<A
					class="p-3 transition-transform duration-200 ease-out hover:scale-125 active:scale-150"
					noScroll={true}
					href={routeGen("/")}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
					>
						<title>Home</title>
						<path fill="currentColor" d="M4 21V9l8-6l8 6v12h-6v-7h-4v7H4Z" />
					</svg>
				</A>
				<div class="flex justify-end items-center gap-4">
					<Show when={authStatusQ.data?.user}>
						<BellNotification />
					</Show>
					<Hamburger menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
				</div>
			</div>
		</>
	);
};

export default NavBar;
