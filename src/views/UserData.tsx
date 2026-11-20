import { Field, Form, type SubmitHandler, createForm, reset } from "@formisch/solid";
import { A, Navigate } from "~/utils/router";
import { route as routeGen } from "~/utils/routes";
import type { Component, ParentComponent } from "solid-js";
import { For, Show, createEffect, createSignal, on } from "solid-js";
import * as v from "valibot";
import CssTranstionGrow from "~/components/CssTranstionGrow";
import CustomButton from "~/components/CustomButton";
import PaginationNav from "~/components/PaginationNav";
import { withProviders } from "~/islands/withProviders";
import TransitionSlide from "~/components/TransitionSlide";
import { trpc } from "~/utils/trpc";

/* ---------- shared look for the three data sections ---------- */

const cardClass =
	"flex w-11/12 max-w-2xl flex-col items-center justify-start gap-12 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16";
const ctaClass =
	"w-full max-w-xs rounded-full border border-fuchsia-600 bg-white p-3 text-center font-semibold text-black text-xl shadow-fuchsia-600 shadow-lg transition-all duration-200 ease-out active:scale-125 hover:scale-110 2xl:text-2xl";
const deleteClass = "bg-red-500 hover:bg-red-600 focus:bg-red-600 active:bg-red-600";
const textareaClass =
	"box-border w-full resize-none rounded-lg border border-slate-600 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";
const inputClass =
	"box-border w-full rounded-lg border border-slate-600 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

const Section: ParentComponent<{ title: string }> = (props) => (
	<div class={cardClass}>
		<h2 class="text-center font-bold text-2xl lg:text-3xl">{props.title}</h2>
		{props.children}
	</div>
);

const EmptyState: Component<{ text: string; href: string; cta: string }> = (props) => (
	<div class="flex w-full flex-col items-center justify-center gap-8">
		<p class="text-center text-lg">{props.text}</p>
		<A class={ctaClass} href={props.href}>
			{props.cta}
		</A>
	</div>
);

/** Review status as a coloured pill, plus the decline reason when there is one. */
const Status: Component<{ accepted: boolean | null | undefined; reason?: string | null }> = (
	props,
) => (
	<div class="flex flex-col items-center gap-2">
		<span
			class="rounded-full px-3 py-1 font-semibold text-sm"
			classList={{
				"bg-green-100 text-green-800": props.accepted === true,
				"bg-red-100 text-red-800": props.accepted === false,
				"bg-amber-100 text-amber-800": props.accepted == null,
			}}
		>
			{props.accepted === true ? "Accepted" : props.accepted === false ? "Declined" : "Pending review"}
		</span>
		<Show when={props.accepted === false && props.reason}>
			<p class="text-center text-slate-700">{`Reason: ${props.reason}`}</p>
		</Show>
	</div>
);

/** Edit / Delete row, the same for every kind of submission. */
const ItemActions: Component<{
	what: string;
	editing: boolean;
	onToggleEdit: () => void;
	deleting: boolean;
	onDelete: () => void;
}> = (props) => (
	<div class="flex flex-wrap items-center justify-center">
		<CustomButton onClick={() => props.onToggleEdit()}>
			{props.editing ? "Cancel editing" : `Edit ${props.what}`}
		</CustomButton>
		<CustomButton class={deleteClass} disabled={props.deleting} onClick={() => props.onDelete()}>
			{`Delete ${props.what}`}
		</CustomButton>
	</div>
);

const Answer: ParentComponent<{ title: string }> = (props) => (
	<div class="flex w-full flex-col items-center gap-4">
		<h3 class="text-center font-bold text-2xl lg:text-3xl">{props.title}</h3>
		{props.children}
	</div>
);

const SaveError: Component<{ show: boolean }> = (props) => (
	<Show when={props.show}>
		<p class="text-center text-red-600">Couldn't save your changes. Check your answers and try again.</p>
	</Show>
);

/** Shows the newer questions' answers, "Not answered" when empty. */
const ExtraAnswers: Component<{ row: Record<string, unknown> | undefined; labels: Record<ExtraKey, string> }> = (
	props,
) => (
	<For each={EXTRA_KEYS}>
		{(key) => (
			<Answer title={props.labels[key]}>
				<p classList={{ "italic text-slate-500": props.row?.[key] == null }}>{formatExtra(props.row?.[key])}</p>
			</Answer>
		)}
	</For>
);

/** Inputs for the newer questions. `form` is the personal or other-poll form; both have these fields. */
// biome-ignore lint/suspicious/noExplicitAny: shared by two differently typed forms
const ExtraFields: Component<{ form: any; labels: Record<ExtraKey, string> }> = (props) => (
	<For each={EXTRA_KEYS}>
		{(key) => (
			<Answer title={props.labels[key]}>
				<Field of={props.form} path={[key]}>
					{/* biome-ignore lint/suspicious/noExplicitAny: see above */}
					{(field: any) => (
						<>
							{key === "how_it_altered_life" ? (
								<textarea
									class={textareaClass}
									{...field.props}
									value={field.input ?? ""}
									rows={6}
									autocomplete="off"
									placeholder="Not answered"
								/>
							) : (
								// `selected` per option: a value on <select> is applied before the
								// options exist, so the saved answer wouldn't show
								<select class={inputClass} {...field.props}>
									<option value="" selected={!field.input}>
										Not answered
									</option>
									<For each={CHOICES[key as ChoiceKey]}>
										{(choice) => (
											<option value={choice} selected={field.input === choice}>
												{choice}
											</option>
										)}
									</For>
								</select>
							)}
							{field.errors && <div class="text-red-600">{field.errors[0]}</div>}
						</>
					)}
				</Field>
			</Answer>
		)}
	</For>
);

/* ---------- form schemas ---------- */

/**
 * A free-text answer. Only answers the user already gave are editable, and they can't be
 * blanked: the server's poll schemas require them (some always, some depending on earlier
 * answers). Unanswered questions aren't rendered, so their input stays undefined.
 */
const optionalText = v.optional(
	v.pipe(
		v.string(),
		v.trim(),
		v.maxLength(600, "Your text is too long! (Max. 600 characters)"),
		v.minLength(4, 'Your text is too short, even "okay" is enough'),
	),
);

/*
 * Questions added in 2026-11. Submissions from before then have no answer to them, so
 * here they're always shown and can be answered, changed or cleared (empty = no answer).
 */
const SCHOOL = ["really poorly", "bad", "average", "good", "great"] as const;
const EXERCISE = ["no exercise", "little", "moderately", "lots of exercise"] as const;
const EXTRA_KEYS = ["symptom_free_on_meds", "exercise", "school_performance", "how_it_altered_life"] as const;
type ExtraKey = (typeof EXTRA_KEYS)[number];
type ChoiceKey = Exclude<ExtraKey, "how_it_altered_life">;
const CHOICES: Record<ChoiceKey, readonly string[]> = {
	symptom_free_on_meds: ["yes", "no"],
	exercise: EXERCISE,
	school_performance: SCHOOL,
};

const extraFields = {
	symptom_free_on_meds: v.optional(v.picklist(["", "yes", "no"])),
	exercise: v.optional(v.picklist(["", ...EXERCISE])),
	school_performance: v.optional(v.picklist(["", ...SCHOOL])),
	how_it_altered_life: v.optional(
		v.pipe(
			v.string(),
			v.trim(),
			v.maxLength(600, "Your text is too long! (Max. 600 characters)"),
			v.check((text) => text === "" || text.length >= 4, 'Your text is too short, even "okay" is enough'),
		),
	),
};

/** Saved row → form input ("" when not answered). */
const extraInput = (row: Record<string, unknown>) => ({
	symptom_free_on_meds:
		row.symptom_free_on_meds == null ? "" : row.symptom_free_on_meds ? "yes" : "no",
	exercise: (row.exercise as string | null) ?? "",
	school_performance: (row.school_performance as string | null) ?? "",
	how_it_altered_life: (row.how_it_altered_life as string | null) ?? "",
});

/** Form values → column values (null when cleared). */
const extraOutput = (values: Record<string, unknown>) => {
	const out: Record<string, unknown> = {};
	for (const key of EXTRA_KEYS) {
		const value = values[key];
		if (value === undefined) continue;
		out[key] =
			value === "" ? null : key === "symptom_free_on_meds" ? value === "yes" : value;
	}
	return out;
};

const withoutExtra = (values: Record<string, unknown>) =>
	Object.fromEntries(
		Object.entries(values).filter(([key]) => !(EXTRA_KEYS as readonly string[]).includes(key)),
	);

const formatExtra = (value: unknown) =>
	value == null || value === "" ? "Not answered" : value === true ? "Yes" : value === false ? "No" : String(value);

const PersonalFormSchema = v.object({
	describe_hospital: optionalText,
	what_kind_of_care_after: optionalText,
	personality_before: optionalText,
	personality_after: optionalText,
	other_help: optionalText,
	goals_after: optionalText,
	responded_to_telling: optionalText,
	life_satisfaction_description: optionalText,
	what_others_should_know: optionalText,
	not_have_schizophrenia_description: optionalText,
	...extraFields,
});
type PersonalFormKey = Exclude<keyof v.InferInput<typeof PersonalFormSchema>, ExtraKey>;

const TheirFormSchema = v.object({
	personality_before: optionalText,
	personality_after: optionalText,
	what_others_should_know: optionalText,
	...extraFields,
});
type TheirFormKey = Exclude<keyof v.InferInput<typeof TheirFormSchema>, ExtraKey>;

/** Same rules as the article submit form. */
const ArticleFormSchema = v.object({
	link: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(5, "Please enter your link to article."),
		v.maxLength(1000, "Your link is too long"),
	),
	description: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(10, "Article description must be at least 10 characters long."),
		v.maxLength(500, "Max length of article description is 500 characters."),
	),
});

const personalHeaders: Record<PersonalFormKey, string> = {
	describe_hospital: "Describe hospital:",
	what_kind_of_care_after: "What kind of hospital care:",
	personality_before: "Your personality before:",
	personality_after: "Your personality after:",
	other_help: "Other help beyond medication:",
	goals_after: "Life goals after illness:",
	responded_to_telling: "How people responded to you:",
	life_satisfaction_description: "Your life satisfaction:",
	what_others_should_know: "What others should know about illness:",
	not_have_schizophrenia_description: "Have or not have schizophrenia:",
};

const theirHeaders: Record<TheirFormKey, string> = {
	personality_before: "Their personality before:",
	personality_after: "Their personality after:",
	what_others_should_know: "What others should know about schizophrenia:",
};

const personalExtraLabels: Record<ExtraKey, string> = {
	symptom_free_on_meds: "Symptom free while on medication:",
	exercise: "How much you exercise:",
	school_performance: "How you did in school:",
	how_it_altered_life: "How the illness altered your life:",
};

const theirExtraLabels: Record<ExtraKey, string> = {
	symptom_free_on_meds: "Symptom free while on medication:",
	exercise: "How much they exercise:",
	school_performance: "How they did in school:",
	how_it_altered_life: "How the illness altered their life:",
};

/** Only send fields that were edited; undefined would drop the saved answer. */
const editedOnly = (values: Record<string, unknown>) =>
	Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));

const Page = () => {
	const [showPersonal, setShowPersonal] = createSignal(false);
	const [showTheirs, setShowTheirs] = createSignal(false);
	const [showArticles, setShowArticles] = createSignal(false);
	const [showDeleteAccount, setShowDeleteAccount] = createSignal(false);
	const [pageTheir, setPageTheir] = createSignal(0);
	const [pageArticles, setPageArticles] = createSignal(0);
	const [personalEdit, setPersonalEdit] = createSignal(false);
	const [theirEdit, setTheirEdit] = createSignal(false);
	const [editingArticle, setEditingArticle] = createSignal<number | null>(null);

	const [dir, setDir] = createSignal(1);

	// Leaving a page closes any edit form that was open on it
	createEffect(on(pageTheir, () => setTheirEdit(false), { defer: true }));
	createEffect(on(pageArticles, () => setEditingArticle(null), { defer: true }));

	const utils = trpc.useContext();
	const invalidate = () => utils.invalidate();

	const removeAccAndDataMut = trpc.removeAccountAndData.createMutation(() => ({
		onSuccess: invalidate,
	}));
	const personalDataQuery = trpc.getPersonal.createQuery();
	const theirDataQuery = trpc.getTheirs.createQuery();
	const articlesDataQuery = trpc.getArticles.createQuery();

	const removePersonalMut = trpc.removePersonal.createMutation(() => ({ onSuccess: invalidate }));
	const removeTheirMut = trpc.removeTheir.createMutation(() => ({
		onSuccess: () => {
			setTheirEdit(false);
			setPageTheir(0);
			invalidate();
		},
	}));
	const removeArticleMut = trpc.removeArticle.createMutation(() => ({ onSuccess: invalidate }));

	const editPersonalMut = trpc.editPersonal.createMutation(() => ({
		onSuccess: () => {
			setPersonalEdit(false);
			invalidate();
		},
	}));
	const editTheirMut = trpc.editTheir.createMutation(() => ({
		onSuccess: () => {
			setTheirEdit(false);
			invalidate();
		},
	}));
	const editArticleMut = trpc.editArticle.createMutation(() => ({
		onSuccess: () => {
			setEditingArticle(null);
			invalidate();
		},
	}));

	/* ----- personal poll ----- */

	const personalForm = createForm({ schema: PersonalFormSchema });

	// Load the saved answers as the form's starting values
	createEffect(() => {
		if (personalDataQuery.data) {
			const data = personalDataQuery.data as Record<string, unknown>;
			const initialInput = Object.fromEntries(
				(Object.keys(personalHeaders) as PersonalFormKey[]).map((key) => [
					key,
					(data[key] as string | null | undefined) ?? undefined,
				]),
			);
			reset(personalForm, { initialInput: { ...initialInput, ...extraInput(data) } });
		}
	});

	const handleEditPersonal: SubmitHandler<typeof PersonalFormSchema> = (values) => {
		// systemMetric is a form-only field: stored weights are already in kg
		editPersonalMut.mutate({
			...personalDataQuery.data,
			...editedOnly(withoutExtra(values)),
			...extraOutput(values),
			systemMetric: true,
		} as Parameters<typeof editPersonalMut.mutate>[0]);
	};

	/* ----- other poll (one submission per page) ----- */

	const theirForm = createForm({ schema: TheirFormSchema });
	const currentTheir = () => theirDataQuery.data?.[pageTheir()];

	const startTheirEdit = () => {
		const row = currentTheir() as Record<string, unknown> | undefined;
		if (!row) return;
		editTheirMut.reset();
		reset(theirForm, {
			initialInput: {
				...Object.fromEntries(
					(Object.keys(theirHeaders) as TheirFormKey[]).map((key) => [
						key,
						(row[key] as string | null | undefined) ?? undefined,
					]),
				),
				...extraInput(row),
			},
		});
		setTheirEdit(true);
	};

	const handleEditTheir: SubmitHandler<typeof TheirFormSchema> = (values) => {
		const row = currentTheir();
		if (!row) return;
		editTheirMut.mutate({
			id: row.id,
			data: { ...row, ...editedOnly(withoutExtra(values)), ...extraOutput(values) },
		} as Parameters<typeof editTheirMut.mutate>[0]);
	};

	/* ----- articles (five per page, one edited at a time) ----- */

	const articleForm = createForm({ schema: ArticleFormSchema });

	const startArticleEdit = (article: { id: number; link: string; description: string }) => {
		editArticleMut.reset();
		reset(articleForm, { initialInput: { link: article.link, description: article.description } });
		setEditingArticle(article.id);
	};

	const handleEditArticle: SubmitHandler<typeof ArticleFormSchema> = (values) => {
		const id = editingArticle();
		if (id === null) return;
		editArticleMut.mutate({ id, ...values });
	};

	return (
		<div class="flex min-h-screen w-full flex-col items-center justify-start gap-16 bg-slate-100 py-20 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
			<h1 class="my-28 font-bold text-4xl lg:my-40 lg:text-6xl">Your account and data</h1>

			<Section title="Personal poll data">
				<Show
					when={personalDataQuery.data}
					fallback={
						<EmptyState
							text="You haven't submitted personal poll data yet"
							href={routeGen("/questionares/")}
							cta="Do personal poll"
						/>
					}
				>
					<CustomButton onClick={() => setShowPersonal(!showPersonal())}>
						{`${showPersonal() ? "Close" : "Show"} your personal poll data`}
					</CustomButton>

					<CssTranstionGrow visible={showPersonal()}>
						<div class="flex w-full flex-col items-center justify-start gap-8">
							<Status
								accepted={personalDataQuery.data?.accepted}
								reason={personalDataQuery.data?.decline_reason}
							/>
							<ItemActions
								what="poll data"
								editing={personalEdit()}
								onToggleEdit={() => {
									editPersonalMut.reset();
									setPersonalEdit(!personalEdit());
								}}
								deleting={removePersonalMut.isPending}
								onDelete={() => removePersonalMut.mutate()}
							/>

							<Show
								when={!personalEdit()}
								fallback={
									<Form of={personalForm} onSubmit={handleEditPersonal}>
										<div class="flex w-full flex-col items-center gap-8">
										<For each={Object.keys(personalHeaders) as PersonalFormKey[]}>
											{(el) => (
												<Show when={personalDataQuery.data?.[el]}>
													<Answer title={personalHeaders[el]}>
														<Field of={personalForm} path={[el]}>
															{(field) => (
																<>
																	<textarea
																		class={textareaClass}
																		{...field.props}
																		value={field.input ?? ""}
																		rows={8}
																		autocomplete="off"
																	/>
																	{field.errors && <div class="text-red-600">{field.errors[0]}</div>}
																</>
															)}
														</Field>
													</Answer>
												</Show>
											)}
										</For>
										<ExtraFields form={personalForm} labels={personalExtraLabels} />
										<SaveError show={editPersonalMut.isError} />
										<CustomButton disabled={editPersonalMut.isPending} type="submit">
											Save changes
										</CustomButton>
										</div>
									</Form>
								}
							>
								<For each={Object.keys(personalHeaders) as PersonalFormKey[]}>
									{(el) => (
										<Show when={personalDataQuery.data?.[el]}>
											<Answer title={personalHeaders[el]}>
												<p>{personalDataQuery.data?.[el]}</p>
											</Answer>
										</Show>
									)}
								</For>
								<ExtraAnswers
									row={personalDataQuery.data as Record<string, unknown> | undefined}
									labels={personalExtraLabels}
								/>
							</Show>
						</div>
					</CssTranstionGrow>
				</Show>
			</Section>

			<Section title="Other poll data">
				<Show
					when={theirDataQuery.data}
					fallback={
						<EmptyState
							text="You haven't submitted other poll data yet"
							href={routeGen("/questionares/")}
							cta="Do other poll"
						/>
					}
				>
					{(their) => (
						<>
							<CustomButton onClick={() => setShowTheirs(!showTheirs())}>
								{`${showTheirs() ? "Close" : "Show"} your other poll data`}
							</CustomButton>

							<CssTranstionGrow visible={showTheirs()}>
								<div class="flex w-full flex-col gap-16">
									<div class="flex items-center justify-center">
										<PaginationNav
											arrLength={their().length}
											page={pageTheir()}
											perPageNum={1}
											setPage={setPageTheir}
											dirSetter={setDir}
										/>
									</div>

									<TransitionSlide dir={dir()}>
										<Show when={pageTheir() === 0 ? true : pageTheir()} keyed>
											<div class="flex flex-col items-center justify-center gap-8">
												<Status
													accepted={currentTheir()?.accepted}
													reason={currentTheir()?.decline_reason}
												/>
												<ItemActions
													what="poll data"
													editing={theirEdit()}
													onToggleEdit={() => (theirEdit() ? setTheirEdit(false) : startTheirEdit())}
													deleting={removeTheirMut.isPending}
													onDelete={() => {
														const row = currentTheir();
														if (row) removeTheirMut.mutate({ id: row.id });
													}}
												/>
												<Show
													when={!theirEdit()}
													fallback={
														<Form of={theirForm} onSubmit={handleEditTheir}>
															<div class="flex w-full flex-col items-center gap-8">
															<For each={Object.keys(theirHeaders) as TheirFormKey[]}>
																{(el) => (
																	<Show when={currentTheir()?.[el]}>
																		<Answer title={theirHeaders[el]}>
																			<Field of={theirForm} path={[el]}>
																				{(field) => (
																					<>
																						<textarea
																							class={textareaClass}
																							{...field.props}
																							value={field.input ?? ""}
																							rows={8}
																							autocomplete="off"
																						/>
																						{field.errors && (
																							<div class="text-red-600">{field.errors[0]}</div>
																						)}
																					</>
																				)}
																			</Field>
																		</Answer>
																	</Show>
																)}
															</For>
															<ExtraFields form={theirForm} labels={theirExtraLabels} />
															<SaveError show={editTheirMut.isError} />
															<CustomButton disabled={editTheirMut.isPending} type="submit">
																Save changes
															</CustomButton>
															</div>
														</Form>
													}
												>
													<For each={Object.keys(theirHeaders) as TheirFormKey[]}>
														{(el) => (
															<Show when={currentTheir()?.[el]}>
																<Answer title={theirHeaders[el]}>
																	<p>{currentTheir()?.[el]}</p>
																</Answer>
															</Show>
														)}
													</For>
													<ExtraAnswers
														row={currentTheir() as Record<string, unknown> | undefined}
														labels={theirExtraLabels}
													/>
												</Show>
											</div>
										</Show>
									</TransitionSlide>
								</div>
							</CssTranstionGrow>
						</>
					)}
				</Show>
			</Section>

			<Section title="Your submitted articles">
				<Show
					when={articlesDataQuery.data}
					fallback={
						<EmptyState
							text="You haven't submitted any articles yet"
							href={routeGen("/articles/")}
							cta="Submit articles"
						/>
					}
				>
					{(articles) => (
						<>
							<CustomButton onClick={() => setShowArticles(!showArticles())}>
								{`${showArticles() ? "Close" : "Show"} your submitted articles`}
							</CustomButton>

							<CssTranstionGrow visible={showArticles()}>
								<div class="flex w-full flex-col gap-16">
									<div class="flex items-center justify-center">
										<PaginationNav
											arrLength={articles().length}
											page={pageArticles()}
											perPageNum={5}
											setPage={setPageArticles}
											dirSetter={setDir}
										/>
									</div>
									<TransitionSlide dir={dir()}>
										<Show when={pageArticles() === 0 ? true : pageArticles()} keyed>
											<div class="flex flex-col items-center justify-center gap-8">
												<For each={articles().slice(pageArticles() * 5, pageArticles() * 5 + 5)}>
													{(article) => (
														<div class="flex w-full flex-col items-center justify-center gap-6 border-b-2 border-b-fuchsia-400 pb-8">
															<Status accepted={article.accepted} reason={article.decline_reason} />
															<ItemActions
																what="article"
																editing={editingArticle() === article.id}
																onToggleEdit={() =>
																	editingArticle() === article.id
																		? setEditingArticle(null)
																		: startArticleEdit(article)
																}
																deleting={removeArticleMut.isPending}
																onDelete={() => removeArticleMut.mutate({ id: article.id })}
															/>
															<Show
																when={editingArticle() === article.id}
																fallback={
																	<>
																		<a
																			class="break-all text-center text-fuchsia-600 text-lg transition-all hover:scale-105 visited:text-fuchsia-800"
																			href={article.link}
																		>
																			{article.link}
																		</a>
																		<p class="w-full text-base">{article.description}</p>
																	</>
																}
															>
																<Form of={articleForm} onSubmit={handleEditArticle}>
																	<div class="flex w-full flex-col items-center gap-4">
																	<Field of={articleForm} path={["link"]}>
																		{(field) => (
																			<label class="flex w-full flex-col gap-2">
																				<span class="font-semibold">Link</span>
																				<input
																					class={inputClass}
																					{...field.props}
																					type="url"
																					value={field.input ?? ""}
																					autocomplete="off"
																				/>
																				{field.errors && <span class="text-red-600">{field.errors[0]}</span>}
																			</label>
																		)}
																	</Field>
																	<Field of={articleForm} path={["description"]}>
																		{(field) => (
																			<label class="flex w-full flex-col gap-2">
																				<span class="font-semibold">Description</span>
																				<textarea
																					class={textareaClass}
																					{...field.props}
																					value={field.input ?? ""}
																					rows={5}
																					autocomplete="off"
																				/>
																				{field.errors && <span class="text-red-600">{field.errors[0]}</span>}
																			</label>
																		)}
																	</Field>
																	<SaveError show={editArticleMut.isError} />
																	<CustomButton disabled={editArticleMut.isPending} type="submit">
																		Save changes
																	</CustomButton>
																	</div>
																</Form>
															</Show>
														</div>
													)}
												</For>
											</div>
										</Show>
									</TransitionSlide>
								</div>
							</CssTranstionGrow>
						</>
					)}
				</Show>
			</Section>

			<p class="w-11/12 max-w-2xl text-center text-slate-600">
				Edited submissions go back to review before they show up in the results.
			</p>

			<div class="flex w-11/12 max-w-2xl flex-col justify-between gap-6 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
				<h2 class="text-center font-bold text-2xl lg:text-3xl">Delete account</h2>
				<p class="text-center text-lg">Deletes both your account and all data you have submitted.</p>

				<Show when={removeAccAndDataMut.isSuccess}>
					<Navigate href={"/"} />
				</Show>

				<CustomButton
					class="bg-fuchsia-500 active:bg-fuchsia-600 focus:bg-fuchsia-600 hover:bg-fuchsia-600"
					onClick={() => {
						setShowDeleteAccount(!showDeleteAccount());
					}}
				>
					{`${!showDeleteAccount() ? "Open" : "Close"}`}
				</CustomButton>

				<CssTranstionGrow visible={showDeleteAccount()}>
					<div class="flex flex-col items-center justify-center gap-16 rounded-lg border-2 border-fuchsia-600 p-8">
						<h2 class="text-center font-bold text-2xl lg:text-3xl">
							Are you sure you want to delete all your data?
						</h2>
						<div class="flex flex-col items-center justify-center gap-8">
							<CustomButton
								disabled={removeAccAndDataMut.isPending}
								class={deleteClass}
								onClick={() => {
									removeAccAndDataMut.mutate();
								}}
							>
								Delete account and data
							</CustomButton>
							<CustomButton
								onClick={() => {
									setShowDeleteAccount(false);
								}}
							>
								Cancel deleting account/data
							</CustomButton>
						</div>
					</div>
				</CssTranstionGrow>
			</div>
		</div>
	);
};

export default withProviders(Page);
