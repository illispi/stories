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
import { hasLocalAnswers, localSavedAt, localSnapshot, restoreSnapshot, setLocalSavedAt } from "~/utils/pollDraftLocal";

/** Computed on the server by the .astro page (logged in? personal poll already submitted?). */
export type UserState = { user: boolean; data: boolean };

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

	const paginate = (newDirection: number) => {
		setDirection(newDirection);
		setPage(page() + newDirection);
	};

	createEffect(() => {
		const pageNav = Number.parseInt(
			localStorage.getItem(`page_${LsName}`) ?? "0",
		);

		if (page() < 0) {
			setPage(pageNav === 0 ? 0 : pageNav);
			setDirection(1);
		} else {
			localStorage.setItem(`page_${LsName}`, JSON.stringify(page()));
		}
	});

	/* ----- progress saved to the account (signed-in users), to continue on another device ----- */

	const signedIn = Boolean(user()?.user);
	const draftQuery = trpc.getDraft.createQuery(
		() => ({ poll: LsName }),
		() => ({ enabled: signedIn, refetchOnWindowFocus: false }),
	);
	const saveDraftMut = trpc.saveDraft.createMutation(() => ({
		onSuccess: (r) => setLocalSavedAt(LsName, r.updatedAt),
	}));
	const deleteDraftMut = trpc.deleteDraft.createMutation();
	// A newer draft from another device while this one has its own answers: let the user choose
	const [draftOffer, setDraftOffer] = createSignal<{ data: Record<string, string>; updatedAt: number } | null>(null);
	// Don't save before the saved draft has been checked, or a fresh device would overwrite it
	const [draftChecked, setDraftChecked] = createSignal(!signedIn);

	// Intro before the first question, for people who haven't started yet
	const [showIntro, setShowIntro] = createSignal(
		!hasLocalAnswers(LsName) && Number(localStorage.getItem(`page_${LsName}`) ?? 0) === 0,
	);

	// Not for someone who has already submitted the personal poll (they see a notice instead)
	const introVisible = () => showIntro() && !(user()?.data && LsName === "personalQuestions");

	const useDraft = (draft: { data: Record<string, string>; updatedAt: number }) => {
		setShowIntro(false);
		restoreSnapshot(LsName, draft.data, draft.updatedAt);
		setDraftOffer(null);
		setPage(-1); // re-read the page (and answers) from localStorage
	};

	createEffect(
		on(
			() => draftQuery.data,
			(draft) => {
				if (!signedIn || !draftQuery.isFetched || draftChecked()) return;
				setDraftChecked(true);
				if (!draft || draft.updatedAt <= localSavedAt(LsName)) return;
				if (!hasLocalAnswers(LsName)) {
					useDraft(draft);
					showToast("Continuing where you left off");
				} else {
					setDraftOffer(draft);
				}
			},
		),
	);

	// Save after every step (debounced), once the check above is done
	let saveTimer: ReturnType<typeof setTimeout> | undefined;
	createEffect(
		on(page, (p) => {
			if (!signedIn || !draftChecked() || draftOffer() || p < 0 || submissionStatus() === "success") return;
			clearTimeout(saveTimer);
			saveTimer = setTimeout(() => {
				if (hasLocalAnswers(LsName)) saveDraftMut.mutate({ poll: LsName, data: localSnapshot(LsName) });
			}, 800);
		}),
	);
	onCleanup(() => clearTimeout(saveTimer));

	const clearAnswers = () => {
		localStorage.clear();
		setClear(false);
		setPage(-1);
		if (signedIn) deleteDraftMut.mutate({ poll: LsName });
	};

	return (
		<div class="flex h-screen w-full flex-col items-center justify-start">
			<Toaster />
			<Show when={draftOffer()}>
				{(draft) => (
					<div
						role="dialog"
						aria-label="Saved progress"
						class="fixed inset-x-0 top-20 z-40 mx-auto flex w-11/12 max-w-lg flex-col gap-3 rounded-2xl bg-white p-5 text-center shadow-2xl ring-2 ring-fuchsia-300"
					>
						<p class="font-semibold">You have newer progress saved from another device.</p>
						<p class="text-slate-600 text-sm">
							Saved {new Date(draft().updatedAt).toLocaleString()}, at question{" "}
							{Number(draft().data[`page_${LsName}`] ?? 0) + 1} of {questions.length}.
						</p>
						<div class="flex flex-wrap justify-center gap-2">
							<CustomButton class="m-0" onClick={() => useDraft(draft())}>
								Continue from saved
							</CustomButton>
							<CustomButton
								class="m-0 bg-slate-500 hover:bg-slate-600 focus:bg-slate-600 active:bg-slate-600"
								onClick={() => {
									setDraftOffer(null);
									saveDraftMut.mutate({ poll: LsName, data: localSnapshot(LsName) });
								}}
							>
								Keep this device's answers
							</CustomButton>
						</div>
					</div>
				)}
			</Show>
			<Show when={introVisible()}>
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
			<Show when={!introVisible()}>
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
												const skipAmount = localStorage.getItem(
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
															const skipAmount = localStorage.getItem(
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
			</Show>
		</div>
	);
};

export default withProviders(PersonalQuestions);
