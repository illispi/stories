import { withProviders } from "~/islands/withProviders";
import { useParams, A as Alink } from "~/utils/router";
import { route } from "~/utils/routes";
import type { Component, Setter } from "solid-js";
import { For, Show, createEffect, createSignal, onCleanup } from "solid-js";
import { Transition } from "solid-transition-group";
import { CompSelector } from "~/components/CompSelector";
import CustomButton from "~/components/CustomButton";
import ModalPopUp from "~/components/ModalPopUp";
import ToggleButton from "~/components/ToggleButton";
import { byDiagnosisPersonal } from "~/data/stats/comparePersonal/byDiagnosisPersonal";
import { byGenderPersonal } from "~/data/stats/comparePersonal/byGenderPersonal";
import { byDiagnosisTheir } from "~/data/stats/compareTheir/byDiagnosisTheir";
import { byGenderTheir } from "~/data/stats/compareTheir/byGenderTheir";
import type { Bar, Doughnut, Stat, Text, YesOrNo } from "~/types/types";
import { trpc } from "~/utils/trpc";

type CompareOptions =
	| "all"
	| "schizophrenia"
	| "schizoaffective"
	| "female"
	| "other"
	| "male";

type DiagnosisFilter = "all" | "schizophrenia" | "schizoaffective";

const isGender = (v: CompareOptions) => v === "male" || v === "female" || v === "other";

/** Pill-shaped radio group: one option is always selected. */
function Segmented<T extends string>(props: {
	label: string;
	options: [T, string][];
	value: T;
	onChange: (value: T) => void;
}) {
	return (
		<div
			role="radiogroup"
			aria-label={props.label}
			class="inline-flex flex-wrap justify-center rounded-full bg-slate-100 p-1 ring-1 ring-slate-200"
		>
			<For each={props.options}>
				{([value, text]) => (
					<button
						type="button"
						role="radio"
						aria-checked={props.value === value}
						class="rounded-full px-4 py-1.5 font-semibold text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
						classList={{
							"bg-blue-800 text-white shadow-sm": props.value === value,
							"text-slate-700 hover:bg-white": props.value !== value,
						}}
						onClick={() => props.onChange(value)}
					>
						{text}
					</button>
				)}
			</For>
		</div>
	);
}

const Compared: Component<{
	setB: Setter<CompareOptions>;
	setA: Setter<CompareOptions>;
	setCompOrder: Setter<(Stat | YesOrNo | Doughnut | Bar | Text)[]>;
	a: CompareOptions;
	b: CompareOptions;
	diagnosis: DiagnosisFilter;
	setDiagnosis: Setter<DiagnosisFilter>;
}> = (props) => {
	const [selection, setSelection] = createSignal<"diagnosis" | "gender">(
		"diagnosis",
	);

	const params = useParams<{
		pOrT: "Personal_questions" | "Their_questions";
	}>();

	const byGender =
		params.pOrT === "Personal_questions" ? byGenderPersonal : byGenderTheir;
	const byDiagnosis =
		params.pOrT === "Personal_questions"
			? byDiagnosisPersonal
			: byDiagnosisTheir;

	const [male, setMale] = createSignal(true);
	const [female, setFemale] = createSignal(true);
	const [other, setOther] = createSignal(false);
	const [message, setMessage] = createSignal<string | null>(null);
	const [genderModalVisible, setGenderModalVisible] = createSignal(false);

	const logic = () => {
		const arr: [boolean, CompareOptions][] = [
			[male(), "male"],
			[female(), "female"],
			[other(), "other"],
		];

		if (arr.filter((e) => e[0] === true).length > 2) {
			setMessage("Please select only two genders");
		} else if (arr.filter((e) => e[0] === true).length < 2) {
			setMessage("Please select two genders");
		} else {
			const filtered = arr.filter((e) => e[0] === true);

			props.setCompOrder(byGender);
			props.setA(filtered[0][1]);
			props.setB(filtered[1][1]);

			setMessage(null);
			setGenderModalVisible(false);
			document.body.style.overflow = "auto";
		}
	};

	const chooseDiagnosis = () => {
		setSelection("diagnosis");
		props.setDiagnosis("all");
		props.setCompOrder(byDiagnosis);
		props.setA("schizophrenia");
		props.setB("schizoaffective");
	};

	const chooseGender = () => {
		setSelection("gender");
		setMale(true);
		setFemale(true);
		setOther(false);
		props.setDiagnosis("all");
		props.setCompOrder(byGender);
		props.setA("male");
		props.setB("female");
	};

	return (
		<div class="my-6 flex flex-col items-center justify-between">
			<ModalPopUp setMessage={setMessage} message={message()} />
			<div class="flex w-11/12 max-w-md justify-center rounded-3xl bg-white p-4 shadow-sm shadow-slate-400 lg:max-w-xl">
				{/* w-fit keeps the labels in one right-aligned column and the controls left-aligned. */}
				<div class="w-full sm:w-fit">
				<div class="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
					<span class="text-sm font-medium text-slate-600 sm:w-24 sm:text-right">Compare by</span>
					<Segmented
						label="Compare by"
						options={[
							["diagnosis", "Diagnosis"],
							["gender", "Gender"],
						]}
						value={selection()}
						onChange={(v) => (v === "diagnosis" ? chooseDiagnosis() : chooseGender())}
					/>
				</div>
				{/* Gender options fold open below; grid-rows animates the height. */}
				<div
					class="grid transition-all duration-300 ease-in-out"
					classList={{
						"mt-4 grid-rows-[1fr] opacity-100": selection() === "gender",
						"grid-rows-[0fr] opacity-0": selection() !== "gender",
					}}
					inert={selection() !== "gender"}
				>
					<div class="overflow-hidden">
						<div class="flex flex-col gap-3 border-slate-200 border-t pt-4">
							<div class="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
								<span class="text-sm font-medium text-slate-600 sm:w-24 sm:text-right">Genders</span>
								<button
									type="button"
									class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 font-semibold text-slate-800 text-sm ring-1 ring-slate-200 transition-colors duration-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
									onClick={() => {
										setGenderModalVisible(true);
										document.body.style.overflow = "hidden";
									}}
								>
									<span class="capitalize">{props.a}</span>
									<span class="font-normal text-slate-500">vs</span>
									<span class="capitalize">{props.b}</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										class="h-4 w-4 text-blue-700"
										aria-hidden="true"
									>
										<path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z" />
									</svg>
									<span class="sr-only">Change genders</span>
								</button>
							</div>
							<div class="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
								<span class="text-sm font-medium text-slate-600 sm:w-24 sm:text-right">Diagnosis</span>
								<Segmented
									label="Diagnosis"
									options={[
										["all", "All"],
										["schizophrenia", "Schizophrenia"],
										["schizoaffective", "Schizoaffective"],
									]}
									value={props.diagnosis}
									onChange={props.setDiagnosis}
								/>
							</div>
						</div>
					</div>
				</div>
				</div>
			</div>

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
				<Show when={genderModalVisible()}>
					<div class="relative z-40">
						<div
							onClick={() => {
								setGenderModalVisible(false);
								document.body.style.overflow = "auto";
							}}
							class="fixed left-0 top-0 flex h-screen w-screen items-center justify-center bg-black opacity-40"
						/>

						<div class="absolute flex -translate-x-1/2 flex-col items-center justify-center rounded-3xl border-2 bg-blue-50 p-5 pt-8 opacity-100">
							<div class="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2">
								<CustomButton
									class="bg-red-600 p-2 text-center hover:bg-red-900 active:bg-red-900"
									onClick={() => {
										setGenderModalVisible(false);
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
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</CustomButton>
							</div>
							<div class="flex">
								<ToggleButton onClick={() => setMale(!male())} toggled={male()}>
									Male
								</ToggleButton>
								<ToggleButton
									onClick={() => setFemale(!female())}
									toggled={female()}
								>
									Female
								</ToggleButton>
								<ToggleButton
									onClick={() => setOther(!other())}
									toggled={other()}
								>
									Other
								</ToggleButton>
							</div>
							<CustomButton
								onClick={() => {
									logic();
								}}
								class={"bg-green-500 hover:bg-green-600 active:bg-green-600"}
							>
								Compare
							</CustomButton>
						</div>
					</div>
				</Show>
			</Transition>
		</div>
	);
};

const CompareStats = () => {
	const params = useParams<{
		pOrT: "Personal_questions" | "Their_questions";
		fOrT: "real" | "fake";
	}>();
	const byDiagnosis =
		params.pOrT === "Personal_questions"
			? byDiagnosisPersonal
			: byDiagnosisTheir;

	const [A, setA] = createSignal<CompareOptions>("schizophrenia");
	const [B, setB] = createSignal<CompareOptions>("schizoaffective");
	const [diagnosis, setDiagnosis] = createSignal<DiagnosisFilter>("all");
	/** Heading for a side: "male", or "male · schizophrenia" when a gender view is narrowed. */
	const label = (v: CompareOptions) =>
		isGender(v) && diagnosis() !== "all" ? `${v} · ${diagnosis()}` : v;

	const [compOrder, setCompOrder] = createSignal(byDiagnosis); //BUG this needs to change to byGender also

	const [shown, setShown] = createSignal<Element[]>([]);
	const [targets, setTargets] = createSignal<Element[]>([]);

	const removeShown = (el: Element) => {
		setShown((els) => els.filter((e) => e !== el));
	};

	createEffect(() => {
		const options = {
			root: document.querySelector("#scrollArea"),
			rootMargin: "0px",
			threshold: 0.01,
		};

		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setShown((els) => [...els, entry.target]);
					observer.unobserve(entry.target);
				}
			});
		}, options);

		targets()?.forEach((el) => {
			observer.observe(el);
		});

		onCleanup(() => {
			observer.disconnect();
		});
	});

	const statsA = trpc.allStats.createQuery(
		() => ({
			value: A(),
			pOrT: params.pOrT,
			fake: params.fOrT,
			diagnosis: diagnosis(),
		}),
		() => ({ placeholderData: (prev) => prev }),
	);
	const statsB = trpc.allStats.createQuery(
		() => ({
			value: B(),
			pOrT: params.pOrT,
			fake: params.fOrT,
			diagnosis: diagnosis(),
		}),
		() => ({ placeholderData: (prev) => prev }),
	);

	return (
		<Show
			when={
				(statsA.data?.total &&
					statsB.data?.total &&
					statsA.data?.total >= 5 &&
					statsB.data?.total >= 5) ||
				params.fOrT === "fake"
			}
			fallback={
				<div class="flex min-h-screen w-full items-center justify-center">
					<div class="my-32 flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:my-64 lg:p-16">
						<div class="flex flex-col items-center justify-center gap-2">
							<h2 class="text-center text-2xl font-bold lg:text-3xl">
								{`${statsA.data?.total ?? 0}/5 ${label(A())}`}
							</h2>
							<h2 class="text-center text-2xl font-bold lg:text-3xl">{`${
								statsB.data?.total ?? 0
							}/5 ${label(B())}`}</h2>
						</div>
						<p class="text-center text-lg">
							Poll needs to be done by at least 5 people on both comparisons
						</p>
						<Show when={diagnosis() !== "all"}>
							<button
								type="button"
								class="rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
								onClick={() => setDiagnosis("all")}
							>
								Compare across all diagnoses
							</button>
						</Show>
						<Alink
							class="rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
							href={route("/questionares/:personalQuestions", {
								personalQuestions:
									params.pOrT === "Personal_questions"
										? "personalQuestions"
										: "theirQuestions",
							})}
						>
							Do the poll now
						</Alink>
						<Alink
							class="rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
							href={route("/compare/:pOrT/:fOrT/compare", {
								fOrT: "fake",
								pOrT: params.pOrT,
							})}
						>
							View results with fake data
						</Alink>
					</div>
				</div>
			}
		>
			<div class="flex-1">
				<Compared
					setA={setA}
					setB={setB}
					setCompOrder={setCompOrder}
					a={A()}
					b={B()}
					diagnosis={diagnosis()}
					setDiagnosis={setDiagnosis}
				/>
				<div class="flex flex-col items-center justify-center">
					<div class="flex w-11/12 max-w-md flex-col rounded-3xl bg-white shadow-sm shadow-slate-500 lg:max-w-5xl">
						<div class="flex h-16 items-center justify-center rounded-t-3xl bg-blue-300 p-4">
							<h1 class="text-center font-semibold">Statistics Comparison</h1>
						</div>
						<div class="flex flex-col items-center justify-center">
							<Show
								when={statsA.isSuccess && statsB.isSuccess}
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
											</svg>
										</div>
									</div>
								}
							>
								<div class="z-[5] flex w-full flex-col items-center justify-center lg:grid  lg:grid-cols-2 lg:items-start">
									<div class="sticky top-12 z-10 hidden items-center justify-center lg:flex">
										<h3 class="m-3 w-96 rounded-full border-4 border-blue-800 bg-white p-3 text-center text-2xl">
											{label(A())}
										</h3>
									</div>
									<div class="sticky top-12 z-10 hidden items-center justify-center  lg:flex">
										<h3 class="m-3 w-96 rounded-full border-4 border-blue-800 bg-white p-3 text-center text-2xl">
											{label(B())}
										</h3>
									</div>
									<For each={compOrder()}>
										{(comp) => (
											<>
												<Show
													when={comp.type !== "bar"}
													fallback={
														<>
															<h5 class="text-xl lg:hidden">{label(A())}:</h5>
															<CompSelector
																{...comp}
																data={statsA.data}
																ref={(el: Element) => {
																	setTargets((p) => [...p, el]);
																}}
																shown={shown()}
																removeShown={removeShown}
																pOrT={params.pOrT}
																fOrT={params.fOrT}
															/>

															<h5 class="text-xl lg:hidden">{label(B())}:</h5>
															<CompSelector
																{...comp}
																data={statsB.data}
																ref={(el: Element) => {
																	setTargets((p) => [...p, el]);
																}}
																shown={shown()}
																removeShown={removeShown}
																pOrT={params.pOrT}
																fOrT={params.fOrT}
															/>
															<div class="my-12 w-full border-2 border-b-black lg:hidden " />
														</>
													}
												>
													<>
														<h5 class="text-xl lg:hidden">{label(A())}:</h5>
														<CompSelector
															{...comp}
															data={statsA.data}
															ref={(el: Element) => {
																setTargets((p) => [...p, el]);
															}}
															shown={shown()}
															removeShown={removeShown}
															pOrT={params.pOrT}
															fOrT={params.fOrT}
														/>
														<h5 class="text-xl lg:hidden">{label(B())}:</h5>
														<CompSelector
															{...comp}
															data={statsB.data}
															ref={(el: Element) => {
																setTargets((p) => [...p, el]);
																onCleanup(() => {
																	if (targets().length >= 0) {
																		setTargets([]);
																	}
																});
															}}
															shown={shown()}
															removeShown={removeShown}
															pOrT={params.pOrT}
															fOrT={params.fOrT}
														/>
														<div class="my-12 w-full border-2 border-b-black lg:hidden" />
													</>
												</Show>
											</>
										)}
									</For>
								</div>
							</Show>
						</div>
					</div>
				</div>
			</div>
		</Show>
	);
};

export default withProviders(CompareStats);

//TODO A and B for text routes need to work as well
//BUG SSR fails when switiching to gender
