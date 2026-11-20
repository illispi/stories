import type { ParentComponent, Setter } from "solid-js";
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import type { QuestionPersonal } from "~/data/personalQuestionsArr";
import { questions as questionsP } from "~/data/personalQuestionsArr";
import { questions as questionsT } from "~/data/theirQuestionsArr";
/** Poll answers in localStorage, keyed by question (personal or relative poll). */
// biome-ignore lint/suspicious/noExplicitAny: values depend on the question type
type Answers = Record<string, any>;
import { confetti } from "~/utils/confetti";
import { isSensitive, LS_POLL, PREFER_NOT_LABEL } from "~/data/sensitiveQuestions";
import CustomButton from "./CustomButton";
import ModalPopUp from "./ModalPopUp";
import type { QuestionTheir } from "~/data/theirQuestionsArr";
import { integer, maxLength, maxValue, minLength, minValue, number as numberBot, safeParse, string, pipe } from "valibot";
import LoginA from "./LoginA";
import { trpc } from "~/utils/trpc";
import clsx from "clsx";

const Box: ParentComponent<{ question: string; start?: boolean }> = (props) => {
	return (
		<>
			<div class="flex h-24 w-80 items-center justify-center rounded-t-3xl bg-blue-300 p-8">
				<label class="text-center font-semibold">{props.question}</label>
			</div>
			<div
				class={clsx(
					"flex h-full flex-col items-center overflow-hidden overflow-y-auto",
					props.start ? "justify-start" : "justify-center",
				)}
			>
				{props.children}
			</div>
		</>
	);
};

const firstLetterUpperCase = (string: string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

export const UnitQuestion: ParentComponent<{
	content: QuestionPersonal | QuestionTheir;
	LsName: "personalQuestions" | "theirQuestions";
	paginate: (newDirection: number) => void;
	setSubmissionStatus: Setter<string>;
}> = (props) => {
	const utils = trpc.useContext();
	const authQuery = trpc.authStatus.createQuery();

	const personalMut = trpc.postPersonalStats.createMutation(() => ({
		onSuccess: () => utils.invalidate(),
	}));

	const theirMut = trpc.postTheirStats.createMutation(() => ({
		onSuccess: () => utils.invalidate(),
	}));

	const sendStats =
		props.LsName === "personalQuestions" ? personalMut : theirMut;

	// Show why a submit was refused (e.g. ages that don't fit, poll already submitted)
	createEffect(() => {
		const err = sendStats.error;
		if (!err) return;
		let message = err.message;
		try {
			// Validation errors arrive as a JSON list of issues
			const issues = JSON.parse(message) as { message?: string }[];
			if (Array.isArray(issues) && issues[0]?.message) message = issues[0].message;
		} catch {
			// a plain message
		}
		setError(`Couldn't submit: ${message}`);
	});

	createEffect(() => {
		if (sendStats.isSuccess) {
			props.setSubmissionStatus("success");
			confetti();
			localStorage.clear();
		}
	});

	const questions =
		props.LsName === "personalQuestions" ? questionsP : questionsT;

	const { question, questionDB, questionType, selections, multiSelect, skip } =
		props.content;

	const questionsLs: Answers = JSON.parse(
		localStorage.getItem(props.LsName) ?? "{}",
	);

	const valueOfLS = questionsLs[questionDB] ?? "";

	const multiSelInit = () => {
		const selectionsObj = multiSelect
			?.map((e) => e[0])
			.reduce(
				(acc, curr) => (
					curr in questionsLs && (acc[curr] = questionsLs[curr] as boolean), acc
				),
				{} as Record<string, boolean>,
			);

		if (Object.keys(selectionsObj ? selectionsObj : {}).length === 0) {
			const allFalse = multiSelect?.reduce(
				(acc, curr) => ((acc[curr[0]] = false), acc),
				{} as Record<string, boolean>,
			);

			return allFalse;
		}
		return selectionsObj;
	};

	//NOTE removed lazy inits in solid see old react code

	const [number, setNumber] = createSignal<string | null>(valueOfLS as string);
	const [text, setText] = createSignal(valueOfLS as string);
	const [error, setError] = createSignal<string | null>(null);
	const [multiSelections, setMultiSelections] = createSignal<Record<string, boolean>>(multiSelInit() ?? {});
	const [yesOrNO, setYesOrNO] = createSignal(valueOfLS as boolean);
	// "Prefer not to say" (sensitive questions only): stored as null + the key in `declined`
	const sensitive = isSensitive(LS_POLL[props.LsName], questionDB);
	const [declined, setDeclined] = createSignal(
		Array.isArray(questionsLs.declined) && (questionsLs.declined as string[]).includes(questionDB),
	);
	const [selection, setSelection] = createSignal(valueOfLS as string);
	const [metric, setMetric] = createSignal<boolean>(
		JSON.parse(localStorage.getItem("system") ?? '"true"'),
	);

	const submitResults = () => {
		(Object.keys(questionsLs) as Array<string>).forEach(
			(e) => {
				if (
					questions.find((el) => el.questionDB === e)?.questionType ===
					"integer"
				) {
					(questionsLs as unknown as Record<string, number>)[ //TODO this as unknown has to have something better
						e
					] = Number(questionsLs[e]); //NOTE is this as number really good practice?
				}
			},
		);

		const array2 = Object.keys(questionsLs);
		questions
			.map((k) => k.questionDB)
			.filter((j) => !array2?.includes(j))
			.forEach((s) => {
				(questionsLs[s] as null) = null;
			});

		questions
			.filter((e) => e.multiSelect)
			.flatMap((e) => e.multiSelect?.map((el) => el[0]))
			.filter((j) => !array2?.includes(j ? j : "")) //BUG there might be a bug here
			.forEach((e) => (e ? ((questionsLs[e] as boolean) = false) : null));

		// Answers come from localStorage; the server validates them with the poll schema.
		if (props.LsName === "personalQuestions") {
			personalMut.mutate({
				...questionsLs,
				systemMetric: JSON.parse(localStorage.getItem("system") ?? "true"),
			} as Parameters<typeof personalMut.mutate>[0]);
		} else {
			theirMut.mutate(questionsLs as Parameters<typeof theirMut.mutate>[0]);
		}
	};

	const handleMultiSubmit = (
		values: Record<string, boolean>,
	) => {
		if (!values) {
			return undefined; //TODO might need something better, this a null check
		}
		if (
			(Object.keys(values) as Array<string>).filter(
				(e) => values[e] === false,
			).length === multiSelect?.map((e) => e[0]).length
		) {
			setError("Please select at least one option");
		} else {
			setError(null);
			try {
				//TODO clear all values on previous gesture, if skipping
				//TODO remeber to refactor this as well to delete on skip no

				localStorage.setItem(
					props.LsName,
					JSON.stringify({ ...questionsLs, ...values }),
				);

				props.paginate(1);
			} catch (err) {
				console.log(err);
				return undefined;
			}
		}
	};

	const handleSubmit = (
		value: {
			[property: string]: boolean | number | string | null | undefined;
		},
		skipAmount?: number,
		declineAnswer = false,
	) => {
		try {
			if (questionDB === "weight_amount") {
				localStorage.setItem("system", JSON.stringify(metric()));
			}
			if (
				questionDB === "weight_amount" &&
				!metric() &&
				typeof value === "string"
			) {
				value = {
					[questionDB]: Math.floor(Number.parseInt(value) * 0.45359237),
				};
			}
			setSelection(value[questionDB] as string);
			setYesOrNO(value[questionDB] as boolean);
			setDeclined(declineAnswer);
			const declinedList = new Set<string>(
				Array.isArray(questionsLs.declined) ? (questionsLs.declined as string[]) : [],
			);
			if (declineAnswer) declinedList.add(questionDB);
			else declinedList.delete(questionDB);
			localStorage.setItem(
				props.LsName,
				JSON.stringify({ ...questionsLs, ...value, declined: [...declinedList] }),
			);
			const LsExistsJunctions = localStorage.getItem(
				`junctions_${props.LsName}`,
			);
			let junctions: Record<string, number> = LsExistsJunctions
				? JSON.parse(LsExistsJunctions)
				: null;

			if (questionType === "yesOrNo" || questionType === "unknown") {
				if (
					(value[questionDB] === true || value[questionDB] === "yes") &&
					skip
				) {
					junctions = {
						...junctions,
						[questionDB]:
							questions.findIndex((e) => e.questionDB === skip) -
							questions.findIndex((e) => e.questionDB === questionDB),
					};
					localStorage.setItem(
						`junctions_${props.LsName}`,
						JSON.stringify(junctions),
					);
				} else {
					if (junctions?.[questionDB]) {
						const LsTotal = localStorage.getItem(props.LsName);
						const curQuestionsObject = LsTotal ? JSON.parse(LsTotal) : null;

						const indexOfItem = questions.findIndex(
							(e) => e.questionDB === questionDB,
						);

						const plusIndexes = junctions[questionDB];
						questions
							.slice(indexOfItem, indexOfItem + plusIndexes)
							.forEach((e) => {
								if (e.multiSelect && e.multiSelect?.length > 0) {
									e.multiSelect?.forEach((el) => {
										delete curQuestionsObject[el[0]];
									});
								}
								e.questionDB !== questionDB
									? delete curQuestionsObject[e.questionDB]
									: curQuestionsObject;
								if (junctions[e.questionDB]) {
									delete junctions[e.questionDB];
								}
							});

						localStorage.setItem(
							props.LsName,
							JSON.stringify(curQuestionsObject),
						);
						delete junctions[questionDB];
						localStorage.setItem(
							`junctions_${props.LsName}`,
							JSON.stringify(junctions),
						);
					}
				}

				if (skipAmount) {
					localStorage.setItem(
						`to_${skip}_${props.LsName}`,
						JSON.stringify(skipAmount),
					);
				} else {
					localStorage.removeItem(`to_${skip}_${props.LsName}`);
				}
			}

			props.paginate(1 + (skipAmount ? skipAmount : 0));
		} catch (err) {
			console.log(err);
			return undefined;
		}
	};

	/** "Prefer not to say": like "No", it skips the follow-up questions. */
	const preferNot = () =>
		handleSubmit(
			{ [questionDB]: null },
			skip
				? questions.findIndex((e) => e.questionDB === skip) -
						questions.findIndex((e) => e.questionDB === questionDB) -
						1
				: undefined,
			true,
		);

	const PreferNotButton = () => (
		<Show when={sensitive}>
			<button
				type="button"
				class="w-56 rounded-full border-2 px-4 py-3 font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
				classList={{
					"border-green-500 bg-green-500 text-white": declined(),
					"border-slate-300 bg-white text-slate-700 hover:bg-slate-100": !declined(),
				}}
				onClick={preferNot}
			>
				{PREFER_NOT_LABEL}
			</button>
		</Show>
	);

	const handleNumber = (
		e: SubmitEvent & { currentTarget: HTMLFormElement },
	) => {
		e.preventDefault();

		let numberSchema;

		if (questionDB === "weight_amount") {
			if (metric()) {
				numberSchema = pipe(numberBot("Weight is required, 1-300 kilograms"),
					minValue(1, "Minimum weight increase is 1 kilos"),
					maxValue(300, "Maximum weight increase is 300 kilos"),
					integer("Please provide whole number only (e.g 15, not 15.6)"),
				);
			} else {
				numberSchema = pipe(numberBot("Weight is required, 1-650 pounds"),
					minValue(1, "Minimum weight increase is 1 pounds"),
					maxValue(650, "Maximum weight increase is 650 pounds"),
					integer("Please provide whole number only (e.g 15, not 15.6)"),
				);
			}
		} else {
			numberSchema = pipe(numberBot("Age is required, 5-110"),
				minValue(5, "Minimum age is 5"),
				maxValue(110, "Maximum age is 110"),
				integer("Please provide whole number only (e.g 15, not 15.6)"),
			);
		}

		const result = safeParse(numberSchema, Number(number()));

		// Age of onset can't be after the current age (current age is asked first)
		const saved: Record<string, unknown> = JSON.parse(localStorage.getItem(props.LsName) ?? "{}");
		const ageConflict = !result.success
			? null
			: questionDB === "age_of_onset" && typeof saved.current_age === "number" && result.output > saved.current_age
				? `Age of onset can't be higher than current age (${saved.current_age}).`
				: questionDB === "current_age" && typeof saved.age_of_onset === "number" && result.output < saved.age_of_onset
					? `Current age can't be lower than age of onset (${saved.age_of_onset}).`
					: null;

		if (!result.success) {
			setError(result.issues[0].message);
		} else if (ageConflict) {
			setError(ageConflict);
		} else {
			handleSubmit({ [questionDB]: result.output });
			setError(null);
		}
	};

	const handleText = (
		e: SubmitEvent & { currentTarget: HTMLFormElement },
	) => {
		e.preventDefault();

		const textFieldSchema = pipe(string(),
			maxLength(600, "Your text is too long! (Max. 600 characters)"),
			minLength(4, 'Your text is too short, even "okay" is enough'),
		);
		const result = safeParse(textFieldSchema, text());

		if (!result.success) {
			setError(result.issues[0].message);
		} else {
			handleSubmit({ [questionDB]: result.output });
			setError(null);
		}
	};

	return (
		<Switch fallback={<div>Error</div>}>
			<Match when={questionType === "selection"}>
				<Box question={question}>
					<div
						class={clsx(
							"flex flex-col items-center justify-end",
							questionDB === "current_med" ? "mt-20" : "",
						)}
					>
						<For each={selections} fallback={<div>No selection found</div>}>
							{(v) => (
								<div class="m-2">
									<CustomButton
										onClick={() => handleSubmit({ [questionDB]: v })}
										class={
											v === selection()
												? "w-56 bg-green-500 active:bg-green-600 focus:bg-green-500 hover:bg-green-600"
												: "w-56"
										}
									>
										{firstLetterUpperCase(v)}
									</CustomButton>
								</div>
							)}
						</For>
					</div>
				</Box>
			</Match>
			<Match when={questionType === "unknown"}>
				<Box question={question}>
					<div class="flex flex-col items-center justify-end">
						<For
							each={["yes", "no", "unknown"]}
							fallback={<div>No selection found</div>}
						>
							{(v) => (
								<div class="m-2">
									<CustomButton
										onClick={() => {
											if (v === "no" || v === "unknown") {
												handleSubmit(
													{ [questionDB]: v },
													skip
														? questions.findIndex(
																(e) => e.questionDB === skip,
															) -
																questions.findIndex(
																	(e) => e.questionDB === questionDB,
																) -
																1
														: undefined,
												);
											} else {
												handleSubmit({ [questionDB]: v });
											}
										}}
										class={
											v === selection()
												? "w-56 bg-green-500 active:bg-green-600 focus:bg-green-500 hover:bg-green-600"
												: "w-56"
										}
									>
										{firstLetterUpperCase(v)}
									</CustomButton>
								</div>
							)}
						</For>
						<div class="m-2">
							<PreferNotButton />
						</div>
					</div>
				</Box>
			</Match>
			<Match
				when={questionType === "integer" && questionDB === "weight_amount"}
			>
				<Box question={question}>
					<form onSubmit={handleNumber}>
						<div class="flex flex-col items-center justify-end">
							<input
								class="m-4 box-border p-4 focus-visible:outline-none"
								autocomplete="off"
								placeholder={`${
									metric()
										? "Weight gain in kilograms"
										: "Weight gain in pounds"
								}`}
								id="int"
								type="number"
								value={number() ?? ""}
								onInput={(e) => {
									setNumber(e.target.value);
									setError(null);
								}}
							/>
							<CustomButton
								onClick={() => {
									setMetric(false);
									setNumber(null);
								}}
								class={
									!metric()
										? "w-56 bg-green-500 active:bg-green-600 focus:bg-green-500 hover:bg-green-600"
										: "w-56 bg-orange-500 active:bg-orange-600 focus:bg-orange-500 hover:bg-orange-600"
								}
							>
								Imperial (lbs)
							</CustomButton>
							<CustomButton
								onClick={() => {
									setMetric(true);
									setNumber(null);
								}}
								class={
									metric()
										? "w-56 bg-green-500 active:bg-green-600 focus:bg-green-500 hover:bg-green-600"
										: "w-56 bg-orange-500 active:bg-orange-600 focus:bg-orange-500 hover:bg-orange-600"
								}
							>
								Metric (kg)
							</CustomButton>
							<CustomButton class="mt-12" type="submit">
								Next
							</CustomButton>
							<ModalPopUp message={error()} setMessage={setError} />
						</div>
					</form>
				</Box>
			</Match>

			<Match when={questionType === "integer"}>
				<Box question={question}>
					<form onSubmit={handleNumber}>
						<div class="flex flex-col items-center justify-end">
							{/*NOTE might want to do controlled inputs and not type="number"
               <input
                autocomplete="off"
                id="int"
                type="number"
                value={number() ?? ""}
                onInput={(e) => {
                  e.currentTarget.value.match("^[0-9]*$")
                    ? setNumber(e.currentTarget.value)
                    : (e.currentTarget.value = number());
                  setError(null);
                }}
              /> */}
							<input
								class="m-4 box-border p-4 focus-visible:outline-none"
								placeholder="Age"
								autocomplete="off"
								id="int"
								type="number"
								value={number() ?? ""}
								onInput={(e) => {
									setNumber(e.target.value);
									setError(null);
								}}
							/>
							<CustomButton type="submit">Next</CustomButton>
							<ModalPopUp message={error()} setMessage={setError} />
						</div>
					</form>
				</Box>
			</Match>

			<Match when={questionType === "text"}>
				<Box question={question} start={true}>
					<ModalPopUp message={error()} setMessage={setError} />

					<form onSubmit={handleText}>
						<div class="flex flex-col items-center justify-start">
							<textarea
								rows={14}
								cols={30}
								class="box-border resize-none p-4 focus-visible:outline-none"
								placeholder="Text"
								autocomplete="off"
								id="int"
								value={text()}
								onInput={(e) => {
									setText(e.target.value);
									localStorage.setItem(
										props.LsName,
										JSON.stringify({ ...questionsLs, [questionDB]: text() }),
									);
									setError(null);
								}}
							/>
							<CustomButton type="submit">Next</CustomButton>
						</div>
					</form>
				</Box>
			</Match>
			<Match when={questionType === "yesOrNo"}>
				<Box question={question}>
					<div class="flex flex-col items-center justify-end gap-8">
						<CustomButton
							// TODO might better to use state of yesOrNO instead of valueOfLS
							class={
								yesOrNO() === true
									? "w-56 bg-green-500 active:bg-green-600 focus:bg-green-500 hover:bg-green-600"
									: "w-56"
							}
							onClick={() => handleSubmit({ [questionDB]: true })}
						>
							Yes
						</CustomButton>
						<CustomButton
							class={
								yesOrNO() === false
									? "w-56 bg-green-500 active:bg-green-600 focus:bg-green-500 hover:bg-green-600"
									: "w-56"
							}
							onClick={() =>
								handleSubmit(
									{ [questionDB]: false },
									skip
										? questions.findIndex((e) => e.questionDB === skip) -
												questions.findIndex(
													(e) => e.questionDB === questionDB,
												) -
												1
										: undefined,
								)
							}
						>
							No
						</CustomButton>
						<PreferNotButton />
					</div>
				</Box>
			</Match>
			<Match when={questionType === "multiSelect"}>
				<Box question={question}>
					<div class="flex flex-col items-center justify-end">
						<ModalPopUp message={error()} setMessage={setError} />
						<For fallback={<div>Multiselect error</div>} each={multiSelect}>
							{(v) => (
								<>
									<CustomButton
										class={
											multiSelections()[v[0]] === true
												? "w-56 bg-green-500 active:bg-green-600 focus:bg-green-500 hover:bg-green-600"
												: "w-56"
										}
										onClick={() => {
											setMultiSelections(
												multiSelections()[v[0]] === true
													? { ...multiSelections(), [v[0]]: false }
													: { ...multiSelections(), [v[0]]: true },
											);
											setError(null);
										}}
									>
										{v[1]}
									</CustomButton>
								</>
							)}
						</For>
						<CustomButton
							class="mt-12"
							onClick={() => handleMultiSubmit(multiSelections())}
						>
							Next
						</CustomButton>
					</div>
				</Box>
			</Match>

			{/* TODO When you press submit something should happen */}
			<Match when={questionType === "submit"}>
				<Box question={question}>
					<Show
						when={authQuery.data?.user}
						fallback={
							<div class="flex w-11/12 flex-col items-center justify-center gap-6">
								<h3 class="text-center font-semibold text-lg">
									You have to be signed up/in to submit
								</h3>
								<LoginA />
							</div>
						}
					>
						<Show
							when={!sendStats.isSuccess}
							fallback={
								<>
									<div class="font-semibold text-lg">
										Submitted succesfully!
									</div>
								</>
							}
						>
							<>
								<CustomButton
									disabled={sendStats.isPending}
									onClick={submitResults}
								>
									Submit
								</CustomButton>
							</>
						</Show>
					</Show>
				</Box>
			</Match>
		</Switch>
	);
};
