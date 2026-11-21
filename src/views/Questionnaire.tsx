import { A, useParams } from "~/utils/router";
import { withProviders } from "~/islands/withProviders";
import { route as routeGen } from "~/utils/routes";
import type { ParentComponent, Setter } from "solid-js";
import { createEffect, createSignal, on, onCleanup, Show, Suspense } from "solid-js";
import { Transition } from "solid-transition-group";
import CustomButton from "~/components/CustomButton";
import { ModalOptions } from "~/components/ModalOptions";
import TransitionFade from "~/components/TransitionFade";
import { UnitQuestion } from "~/components/UnitQuestion";
import type { QuestionPersonal } from "~/data/personalQuestionsArr";
import { questions as questionsPersonal } from "~/data/personalQuestionsArr";
import type { QuestionTheir } from "~/data/theirQuestionsArr";
import { questions as questionsTheirs } from "~/data/theirQuestionsArr";
import { trpc } from "~/utils/trpc";
import { Toaster, showToast } from "~/components/Toast";
import PollIntro from "~/components/PollIntro";
import {
	hasAnswers,
	loadPollStore,
	onPollStoreChange,
	pollSnapshot,
	pollStore,
	removeLegacyLocalProgress,
} from "~/utils/pollStore";

/** Computed on the server by the .astro page (logged in? personal poll already submitted?). */
export type UserState = { user: boolean; id: string | null; data: boolean };

const Counter: ParentComponent<{
	page: number;
	questions: QuestionPersonal[] | QuestionTheir[];
}> = (props) => {
	return (
		<div class="flex max-h-12 items-center justify-center rounded-lg bg-blue-300 shadow-md">
			<h3 class="p-6 text-lg font-semibold">{`${Math.floor(
				((props.page + 1) / props.questions.length) * 100,
			)}%`}</h3>
		</div>
	);
};

const Questions: ParentComponent<{
	direction: number;
	page: number;
	paginate: (newDirection: number) => void;
	questions: QuestionPersonal[] | QuestionTheir[];
	LsName: "personalQuestions" | "theirQuestions";
	setSubmissionStatus: Setter<string>;
}> = (props) => {
	return (
		<Show fallback={<div>Loading....</div>} when={props.page >= 0}>
			<Show
				fallback={<div>Done!!!</div>}
				when={props.page !== props.questions.length}
			>
				<div class="relative z-0 h-[600px] w-11/12 max-w-xs flex-col">
					{/*BUG During transition you should lock document from scrolling */}
					<Transition
						onEnter={(el, done) => {
							const a =
								props.direction > 0
									? el.animate(
											[
												{
													opacity: 0,
													transform: "translate(340px)",
													easing: "ease-in-out",
												},
												{ opacity: 1, transform: "translate(0)" },
											],
											{
												duration: 600,
											},
										)
									: el.animate(
											[
												{
													opacity: 0,
													transform: "translate(-340px)",
													easing: "ease-in-out",
												},
												{ opacity: 1, transform: "translate(0)" },
											],
											{
												duration: 600,
											},
										);
							a.finished.then(done);
						}}
						onExit={(el, done) => {
							const a =
								props.direction < 0
									? el.animate(
											[
												{
													opacity: 1,
													transform: "translate(0)",
													easing: "ease-in-out",
												},
												{
													opacity: 0,
													transform: "translate(340px)",
												},
											],
											{
												duration: 600,
											},
										)
									: el.animate(
											[
												{
													opacity: 1,
													transform: "translate(0)",
													easing: "ease-in-out",
												},
												{
													opacity: 0,
													transform: "translate(-340px)",
												},
											],
											{
												duration: 600,
											},
										);
							a.finished.then(done);
						}}
					>
						<Show when={props.page === 0 ? true : props.page} keyed>
							<div class="absolute z-30 flex h-full w-full flex-col rounded-3xl bg-white shadow-lg shadow-blue-400">
								<UnitQuestion
									setSubmissionStatus={props.setSubmissionStatus}
									content={props.questions[props.page]}
									paginate={props.paginate}
									LsName={props.LsName}
								/>
							</div>
						</Show>
					</Transition>
				</div>
			</Show>
		</Show>
	);
};

/** Slide used between the intro and the first question (same as between questions). */
const slide = (el: Element, dir: "in" | "out") =>
	el.animate(
		dir === "in"
			? [
					{ opacity: 0, transform: "translate(340px)" },
					{ opacity: 1, transform: "translate(0)" },
				]
			: [
					{ opacity: 1, transform: "translate(0)" },
					{ opacity: 0, transform: "translate(-340px)" },
				],
		{ duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450, easing: "ease-in-out" },
	);

const PersonalQuestions: ParentComponent<{ userState: UserState }> = (props) => {
	const user = () => props.userState;
	const params = useParams<{
		personalQuestions: "personalQuestions" | "theirQuestions";
	}>();
	const [page, setPage] = createSignal(-1);
	const [direction, setDirection] = createSignal(1);
	const [clear, setClear] = createSignal(false);

	const [submissionStatus, setSubmissionStatus] = createSignal("");

	createEffect(() => {
		page();
		window.scrollTo({ behavior: "smooth", top: 0 });
	});

	const questions =
		params.personalQuestions === "personalQuestions"
			? questionsPersonal
			: questionsTheirs;

	const LsName =
		params.personalQuestions === "personalQuestions"
			? "personalQuestions"
			: "theirQuestions";

	// Progress lives only in memory and in the account; clear what older versions left in the browser
	removeLegacyLocalProgress();

	const paginate = (newDirection: number) => {
		setDirection(newDirection);
		setPage(page() + newDirection);
	};

	createEffect(() => {
		const pageNav = Number.parseInt(
			pollStore.getItem(`page_${LsName}`) ?? "0",
		);

		if (page() < 0) {
			setPage(pageNav === 0 ? 0 : pageNav);
			setDirection(1);
		} else {
			pollStore.setItem(`page_${LsName}`, JSON.stringify(page()));
		}
	});

	/* ----- progress is saved to the account as you go (signed-in users only can answer) ----- */

	const signedIn = Boolean(user()?.user);
	const draftQuery = trpc.getDraft.createQuery(
		() => ({ poll: LsName }),
		() => ({ enabled: signedIn, refetchOnWindowFocus: false, staleTime: 0, gcTime: 0 }),
	);
	const saveDraftMut = trpc.saveDraft.createMutation(() => ({
		onError: () => showToast("Couldn't save your progress. Check your connection.", "error"),
	}));
	const deleteDraftMut = trpc.deleteDraft.createMutation();
	// Questions are shown only after the saved progress has been loaded into the store
	const [loaded, setLoaded] = createSignal(false);

	// Intro before the first question, for people who haven't started yet
	const [showIntro, setShowIntro] = createSignal(true);

	// Not for someone who has already submitted the personal poll (they see a notice instead)
	// Signed-out visitors only get the intro (with a preview of the questions): answering starts
	// after signing in.
	const introVisible = () =>
		!signedIn || (showIntro() && !(user()?.data && LsName === "personalQuestions"));

	createEffect(
		on(
			() => draftQuery.isFetched,
			(fetched) => {
				if (!signedIn || !fetched || loaded() || draftQuery.isError) return;
				loadPollStore(draftQuery.data?.data);
				setShowIntro(!hasAnswers(LsName));
				setPage(-1); // re-read the page from the loaded progress
				setLoaded(true);
			},
		),
	);

	// Save to the account shortly after every change, and right away when leaving the page
	const save = (keepalive = false) => {
		if (!loaded() || submissionStatus() === "success" || !hasAnswers(LsName)) return;
		const body: { poll: typeof LsName; data: Record<string, string> } = { poll: LsName, data: pollSnapshot(LsName) };
		if (keepalive) {
			// The page may be closing: a keepalive request still completes
			void fetch("/api/trpc/saveDraft", {
				method: "POST",
				keepalive: true,
				headers: { "content-type": "application/json" },
				body: JSON.stringify(body),
			});
		} else {
			saveDraftMut.mutate(body);
		}
	};
	let saveTimer: ReturnType<typeof setTimeout> | undefined;
	let pending = false;
	onPollStoreChange(() => {
		if (!loaded()) return;
		pending = true;
		clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			pending = false;
			save();
		}, 800);
	});
	const flush = () => {
		if (!pending) return;
		clearTimeout(saveTimer);
		pending = false;
		save(true);
	};
	const onHide = () => document.visibilityState === "hidden" && flush();
	document.addEventListener("visibilitychange", onHide);
	document.addEventListener("astro:before-preparation", flush);
	onCleanup(() => {
		flush();
		onPollStoreChange(null);
		document.removeEventListener("visibilitychange", onHide);
		document.removeEventListener("astro:before-preparation", flush);
	});

	const clearAnswers = () => {
		clearTimeout(saveTimer);
		pending = false;
		pollStore.clear();
		setClear(false);
		setShowIntro(true);
		setPage(-1);
		if (signedIn) deleteDraftMut.mutate({ poll: LsName });
	};

	return (
		<div class="flex min-h-screen w-full flex-col items-center justify-start">
			<Toaster />
			<Show when={signedIn && draftQuery.isError}>
				<div class="mx-auto mt-32 flex w-11/12 max-w-md flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-xl">
					<p class="font-semibold">Couldn't load your saved progress.</p>
					<CustomButton onClick={() => draftQuery.refetch()}>Try again</CustomButton>
				</div>
			</Show>
			<Show when={!signedIn || loaded()}>
			{/* Intro → first question: the same slide as moving between questions */}
			<Transition
				mode="outin"
				onEnter={(el, done) => slide(el, "in").finished.then(done)}
				onExit={(el, done) => slide(el, "out").finished.then(done)}
			>
				<Show
					when={introVisible()}
					fallback={
						<div class="flex w-full flex-col items-center justify-start">
			<Suspense
				fallback={
					<div class="flex h-screen w-full flex-col items-center justify-center">
						<div class="animate-ping">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="32"
								height="32"
								viewBox="0 0 24 24"
							>
								<path
									fill="currentColor"
									d="m11 12.2l-.9-.9q-.275-.275-.7-.275t-.7.275q-.275.275-.275.7t.275.7l2.6 2.6q.3.3.7.3t.7-.3l2.6-2.6q.275-.275.275-.7t-.275-.7q-.275-.275-.7-.275t-.7.275l-.9.9V9q0-.425-.288-.713T12 8q-.425 0-.713.288T11 9v3.2Zm1 9.8q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Z"
								/>
								<title>ping animation</title>
							</svg>
						</div>
					</div>
				}
			>
				<Show
					when={user()?.user}
					fallback={
						<div class="flex h-screen w-full flex-col items-center justify-start">
							<div class="flex h-full w-full flex-col items-center justify-start lg:h-5/6 lg:justify-center">
								<div class="flex h-20 w-80 items-center justify-between p-2">
									<Counter page={page()} questions={questions} />
									<CustomButton
										type="button"
										onClick={() => {
											if (page() >= 0) {
												const skipAmount = pollStore.getItem(
													`to_${questions[page()].questionDB}_${LsName}`,
												);

												paginate(skipAmount ? -1 - JSON.parse(skipAmount) : -1);
											}
										}}
									>
										Previous
									</CustomButton>
								</div>
								<Questions
									setSubmissionStatus={setSubmissionStatus}
									direction={direction()}
									page={page()}
									paginate={paginate}
									questions={questions}
									LsName={LsName}
								/>
							</div>
							<CustomButton
								class="my-4 w-48"
								onClick={() => {
									setClear(true);
								}}
							>
								Clear answers
							</CustomButton>
							<ModalOptions show={clear()} setShow={setClear}>
								<div class="flex w-11/12 flex-col justify-start gap-6 rounded-3xl border-t-4 border-fuchsia-600 bg-white p-8 shadow-xl ">
									<h2 class="text-center text-2xl font-bold lg:text-3xl">
										Clear all answers?
									</h2>

									<CustomButton
										class="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 active:bg-orange-600"
										onClick={clearAnswers}
									>
										Clear answers
									</CustomButton>

									<CustomButton
										onClick={() => {
											setClear(false);
										}}
									>
										Cancel
									</CustomButton>
								</div>
							</ModalOptions>
						</div>
					}
				>
					<Show
						when={
							!user()?.data || params.personalQuestions === "theirQuestions"
						}
						fallback={
							<div class="flex h-screen w-full flex-col items-center justify-center">
								<div class="flex w-11/12 max-w-2xl flex-col items-center justify-center gap-12 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
									<h2 class="m-8 text-lg">
										You have already submitted personal poll!
									</h2>
									<A
										href={routeGen("/user/data")}
										class="rounded-full border border-fuchsia-600 bg-white p-4 text-center font-semibold text-black text-xl shadow-fuchsia-600 shadow-lg transition-all duration-200 ease-out active:scale-125 hover:scale-110 2xl:text-2xl "
									>
										See status of it
									</A>
								</div>
							</div>
						}
					>
						<>
							<TransitionFade>
								<Show
									when={submissionStatus() !== "success"}
									fallback={
										<div class="flex h-screen w-full flex-col items-center justify-center">
											<div class="flex w-11/12 max-w-2xl flex-col items-center justify-center gap-12 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
												<h2 class="m-8 text-lg">
													Submitted successfully for approval!
												</h2>
												<A
													href={routeGen("/user/data")}
													class="rounded-full border border-fuchsia-600 bg-white p-4 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
												>
													See status
												</A>
											</div>
										</div>
									}
								>
									<div class="flex h-screen w-full flex-col items-center justify-start">
										<div class="flex h-full w-full flex-col items-center justify-start lg:h-5/6 lg:justify-center">
											<div class="flex h-20 w-80 items-center justify-between p-2">
												<Counter page={page()} questions={questions} />
												<CustomButton
													type="button"
													onClick={() => {
														if (page() >= 0) {
															const skipAmount = pollStore.getItem(
																`to_${questions[page()].questionDB}_${LsName}`,
															);

															paginate(
																skipAmount ? -1 - JSON.parse(skipAmount) : -1,
															);
														}
													}}
												>
													Previous
												</CustomButton>
											</div>
											<Questions
												setSubmissionStatus={setSubmissionStatus}
												direction={direction()}
												page={page()}
												paginate={paginate}
												questions={questions}
												LsName={LsName}
											/>
										</div>
										<CustomButton
											class="my-4 w-48"
											onClick={() => {
												setClear(true);
											}}
										>
											Clear answers
										</CustomButton>
										<ModalOptions show={clear()} setShow={setClear}>
											<div class="flex w-11/12 flex-col justify-start gap-6 rounded-3xl border-t-4 border-fuchsia-600 bg-white p-8 shadow-xl ">
												<h2 class="text-center text-2xl font-bold lg:text-3xl">
													Clear all answers?
												</h2>

												<CustomButton
													class="bg-orange-500 hover:bg-orange-600 focus:bg-orange-600 active:bg-orange-600"
													onClick={clearAnswers}
												>
													Clear answers
												</CustomButton>

												<CustomButton
													onClick={() => {
														setClear(false);
													}}
												>
													Cancel
												</CustomButton>
											</div>
										</ModalOptions>
									</div>
								</Show>
							</TransitionFade>
						</>
					</Show>
				</Show>
			</Suspense>
						</div>
					}
				>
				<PollIntro
					poll={LsName}
					questions={questions}
					signedIn={signedIn}
					onStart={() => {
						setShowIntro(false);
						window.scrollTo({ top: 0 });
					}}
				/>
				</Show>
			</Transition>
			</Show>
		</div>
	);
};

export default withProviders(PersonalQuestions);
