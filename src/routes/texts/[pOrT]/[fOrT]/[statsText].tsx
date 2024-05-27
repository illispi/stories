import { ErrorBoundary, For, Show, Suspense, createSignal } from "solid-js";
import { Transition } from "solid-transition-group";
import CustomButton from "~/components/CustomButton";
import PaginationNav from "~/components/PaginationNav";
import ToggleButton from "~/components/ToggleButton";
import { questions } from "~/data/personalQuestionsArr";
import type { PersonalQuestions } from "~/types/zodFromTypes";
import TransitionSlide from "~/components/TransitionSlide";
import { trpc } from "~/utils/trpc";
import { useParams, useSearchParams } from "@solidjs/router";

const StatsText = () => {
	const params = useParams<{
		statsText: keyof PersonalQuestions;
		pOrT: "Personal_questions" | "Their_questions";
		fOrT: "fake" | "real";
	}>();
	const [filter, setFilter] = createSignal(false);
	const [gender, setGender] = createSignal<"Female" | "Other" | "Male" | null>(
		null,
	);
	const [diagnosis, setDiagnosis] = createSignal<
		"Schizophrenia" | "Schizoaffective" | null
	>(null);

	const [diagFilter, setDiagFilter] = createSignal<
		"Schizophrenia" | "Schizoaffective" | null
	>(null);

	const [genderFilter, setGenderFilter] = createSignal<
		"Female" | "Other" | "Male" | null
	>(null);

	const [page, setPage] = createSignal(0);

	const [dir, setDir] = createSignal(1);

	const texts = trpc.textPagination.createQuery(
		() => ({
			page: page(),
			stat: params.statsText,
			diagnosis: diagFilter(),
			gender: genderFilter(),
			personalOrTheir: params.pOrT,
			fake: params.fOrT,
		}),
		() => ({ placeholderData: (prev) => prev }),
	);

	return (
		<div class="mt-8 flex flex-col items-center justify-center">
			<CustomButton onclick={() => setFilter(true)}>Filter</CustomButton>
			<CustomButton
				onclick={() => {
					setGender(null);
					setDiagnosis(null);
					setDiagFilter(null);
					setGenderFilter(null);
					setPage(0);
					window.scrollTo({ top: 0, behavior: "smooth" });
				}}
			>
				Clear Filters
			</CustomButton>
			<Show when={diagFilter() || genderFilter()}>
				<p class="my-6 font-semibold text-lg">{`Current filters: ${
					diagFilter() ?? ""
				} ${genderFilter() ?? ""}`}</p>
			</Show>
			<Transition
				onEnter={(el, done) => {
					const a = el.animate([{ opacity: 0 }, { opacity: 1 }], {
						duration: 500,
						easing: "ease-in-out",
					});
					a.finished.then(done);
				}}
				onExit={(el, done) => {
					const a = el.animate([{ opacity: 1 }, { opacity: 0 }], {
						duration: 500,
						easing: "ease-in-out",
					});
					a.finished.then(done);
				}}
			>
				<Show when={filter()}>
					<div class="relative z-40">
						<div
							onClick={() => {
								setFilter(false);
								document.body.style.overflow = "auto";
							}}
							class="fixed left-0 top-0 flex h-screen w-screen items-center justify-center bg-black opacity-40"
						/>

						<div class="absolute flex -translate-x-1/2 flex-col items-center justify-center rounded-3xl border-2 bg-blue-50 p-5 pt-8 opacity-100">
							<div class="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2">
								<CustomButton
									class="bg-red-600 p-2 text-center hover:bg-red-900 active:bg-red-900"
									onClick={() => {
										setFilter(false);
										document.body.style.overflow = "auto";
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										class="h-8 w-8"
									>
										<title>Something</title>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</CustomButton>
							</div>
							<div class="flex">
								<ToggleButton
									onClick={() =>
										setGender((prev) => (prev === "Male" ? null : "Male"))
									}
									toggled={gender() === "Male"}
								>
									Male
								</ToggleButton>
								<ToggleButton
									onClick={() =>
										setGender((prev) => (prev === "Female" ? null : "Female"))
									}
									toggled={gender() === "Female"}
								>
									Female
								</ToggleButton>
								<ToggleButton
									onClick={() =>
										setGender((prev) => (prev === "Other" ? null : "Other"))
									}
									toggled={gender() === "Other"}
								>
									Other
								</ToggleButton>
							</div>
							<div class="flex flex-col">
								<ToggleButton
									onClick={() =>
										setDiagnosis((prev) =>
											prev === "Schizophrenia" ? null : "Schizophrenia",
										)
									}
									toggled={diagnosis() === "Schizophrenia"}
								>
									Schizophrenia
								</ToggleButton>
								<ToggleButton
									onClick={() =>
										setDiagnosis((prev) =>
											prev === "Schizoaffective" ? null : "Schizoaffective",
										)
									}
									toggled={diagnosis() === "Schizoaffective"}
								>
									Schizoaffective
								</ToggleButton>
							</div>
							<CustomButton
								onClick={() => {
									setPage(0);
									setDiagFilter(diagnosis());
									setGenderFilter(gender());
									window.scrollTo({ top: 0, behavior: "smooth" });
									setFilter(false);
									document.body.style.overflow = "auto";
								}}
								class={"bg-green-500 hover:bg-green-600 active:bg-green-600"}
							>
								Filter
							</CustomButton>
						</div>
					</div>
				</Show>
			</Transition>
			<ErrorBoundary
				fallback={(err) => {
					console.log(err);
					return <div>err</div>;
				}}
			>
				<Suspense>
					<div class="flex w-11/12 max-w-xs flex-col items-center justify-center md:max-w-prose">
						<h4 class="sticky top-12 w-full bg-white py-12 text-center text-xl underline underline-offset-8">{`${
							questions[
								questions.findIndex((e) => params.statsText === e.questionDB)
							].question
						}`}</h4>

						<Show when={texts.data?.count}>
							{(count) => (
								<>
									<div class="m-16 flex w-full items-center justify-around">
										<PaginationNav
											arrLength={count()}
											page={page()}
											perPageNum={25}
											setPage={setPage}
											backOnClick={() => {
												window.scrollTo({ top: 0, behavior: "smooth" });
											}}
											nextOnClick={() => {
												window.scrollTo({ top: 0, behavior: "smooth" });
											}}
											dirSetter={setDir}
										/>
									</div>
								</>
							)}
						</Show>
						<Suspense>
							<TransitionSlide dir={dir()}>
								<Show when={page() === 0 ? true : page()} keyed>
									<div>
										<For
											each={texts.data?.stats}
											fallback={<div>None found</div>}
										>
											{(stat, i) =>
												stat ? (
													<div class="flex w-full max-w-xs flex-col items-center justify-center md:max-w-prose ">
														<h5 class="m-2 my-8 font-bold">{i() + 1}.</h5>
														<p class="m-8 w-full">{stat?.[params.statsText]}</p>
														<h3 class="text-sm italic">{`Diagnosis: ${stat.diagnosis}, Gender: ${stat.gender}`}</h3>
													</div>
												) : null
											}
										</For>
									</div>
								</Show>
							</TransitionSlide>
						</Suspense>

						<Show when={texts.data?.count}>
							{(count) => (
								<>
									<div class="m-16 flex w-full items-center justify-around">
										<PaginationNav
											arrLength={count()}
											page={page()}
											perPageNum={25}
											setPage={setPage}
											backOnClick={() => {
												window.scrollTo({ top: 0, behavior: "smooth" });
											}}
											nextOnClick={() => {
												window.scrollTo({ top: 0, behavior: "smooth" });
											}}
											dirSetter={setDir}
										/>
									</div>
								</>
							)}
						</Show>
					</div>
				</Suspense>
			</ErrorBoundary>
		</div>
	);
};

export default StatsText;
//TODO replace suspense with some component
//TODO back navigate should remember position, and page shouldnt go to top before exit animation, maybe just have noScroll adn manually scrolltotop on every page
//TODO usetransition in filter
