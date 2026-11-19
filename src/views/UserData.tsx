import { Field, Form, type SubmitHandler, createForm, reset } from "@formisch/solid";
import { A, Navigate } from "~/utils/router";
import {
	createMutation,
	createQuery,
	useQueryClient,
} from "@tanstack/solid-query";
import { route as routeGen } from "~/utils/routes";
import type { ParentComponent } from "solid-js";
import { For, Show, Suspense, createEffect, createSignal } from "solid-js";
import * as v from "valibot";
import CssTranstionGrow from "~/components/CssTranstionGrow";
import CustomButton from "~/components/CustomButton";
import PaginationNav from "~/components/PaginationNav";
import { withProviders } from "~/islands/withProviders";
import TransitionFade from "~/components/TransitionFade";
import TransitionSlide from "~/components/TransitionSlide";
import { trpc } from "~/utils/trpc";

const Box: ParentComponent = (props) => {
	return (
		<div class="my-8 flex w-11/12 max-w-2xl flex-col items-center justify-center gap-16 overflow-hidden rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
			{props.children}
		</div>
	);
};

/**
 * A free-text answer. Only answers the user already gave are editable, and they can't be
 * blanked: the server's poll schema requires them (some always, some depending on earlier
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
});

type PersonalFormKey = keyof v.InferInput<typeof PersonalFormSchema>;

interface theirEdit {
	data: any;
	id: number;
}

const Page = () => {
	//TODO test roles
	const headers = {
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

	const [showPersonal, setShowPersonal] = createSignal(false);
	const [showTheirs, setShowTheirs] = createSignal(false);
	const [showArticles, setShowArticles] = createSignal(false);
	const [showDeleteAccount, setShowDeleteAccount] = createSignal(false);
	const [pageTheir, setPageTheir] = createSignal(0);
	const [pageArticles, setPageArticles] = createSignal(0);
	const [personalEdit, setPersonalEdit] = createSignal(false);

	const [dir, setDir] = createSignal(1);

	const utils = trpc.useContext();

	//BUG should removeAcc redirect?

	const removeAccAndDataMut = trpc.removeAccountAndData.createMutation(() => ({
		onSuccess: () => {
			utils.invalidate();
		},
	}));
	const personalDataQuery = trpc.getPersonal.createQuery();
	const theirDataQuery = trpc.getTheirs.createQuery();

	const articlesDataQuery = trpc.getArticles.createQuery();

	const removePersonalMut = trpc.removePersonal.createMutation(() => ({
		onSuccess: () => {
			utils.invalidate();
		},
	}));

	const removeTheirMut = trpc.removeTheir.createMutation(() => ({
		onSuccess: () => {
			utils.invalidate();
		},
	}));

	const removeArticleMut = trpc.removeArticle.createMutation(() => ({
		onSuccess: () => {
			utils.invalidate();
		},
	}));

	const editPersonalMut = trpc.editPersonal.createMutation(() => ({
		onSuccess: () => {
			setPersonalEdit(false);
			utils.invalidate();
		},
	}));
	//TODO editTheir mut
	const editTheirMut = trpc.editTheir.createMutation(() => ({
		onSuccess: () => {
			utils.invalidate();
		},
	}));

	//TODO editArticle mut

	const personalForm = createForm({ schema: PersonalFormSchema });

	// Load the saved answers as the form's starting values
	createEffect(() => {
		if (personalDataQuery.data) {
			const data = personalDataQuery.data as Record<string, unknown>;
			const initialInput = Object.fromEntries(
				(Object.keys(headers) as PersonalFormKey[]).map((key) => [
					key,
					(data[key] as string | null | undefined) ?? undefined,
				]),
			);
			reset(personalForm, { initialInput });
		}
	});

	const handleEditPersonal: SubmitHandler<typeof PersonalFormSchema> = (values) => {
		// Only send fields that were edited; undefined would drop the saved answer
		const edited = Object.fromEntries(
			Object.entries(values).filter(([, value]) => value !== undefined),
		);
		// systemMetric is a form-only field: stored weights are already in kg
		editPersonalMut.mutate({
			...personalDataQuery.data,
			...edited,
			systemMetric: true,
		} as Parameters<typeof editPersonalMut.mutate>[0]);
	};

	return (
		<div class="flex min-h-screen w-full flex-col items-center justify-start gap-16 bg-slate-100 py-20 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
			<h1 class="my-28 font-bold text-4xl lg:my-40 lg:text-6xl">
				Your account and data
			</h1>

			<div class="flex w-11/12 max-w-2xl flex-col justify-between gap-12 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
				<h2 class="text-center font-bold text-2xl lg:text-3xl">
					Personal poll data
				</h2>
				<Show
					when={personalDataQuery.data}
					fallback={
						<div class="flex w-full flex-col items-center justify-center gap-8">
							<p class="text-center text-lg">
								You haven't submitted personal poll data yet
							</p>
							<A
								class="w-full max-w-xs rounded-full border border-fuchsia-600 bg-white p-3 text-center font-semibold text-black text-xl shadow-fuchsia-600 shadow-lg transition-all duration-200 ease-out active:scale-125 hover:scale-110 2xl:text-2xl"
								href={routeGen("/questionares/")}
							>
								Do personal poll
							</A>
						</div>
					}
				>
					<CustomButton
						onClick={() => {
							setShowPersonal(() => !showPersonal());
						}}
					>
						{`${!showPersonal() ? "Show" : "Close"} personal questions data`}
					</CustomButton>

					<TransitionFade>
						<Show when={showPersonal()}>
							<div class="flex flex-col items-center justify-start gap-8">
								<CustomButton
									disabled={removePersonalMut.isPending}
									class="bg-orange-500 active:bg-orange-600 focus:bg-orange-600 hover:bg-orange-600"
									onClick={() => {
										removePersonalMut.mutate();
									}}
								>
									Delete this personal poll data
								</CustomButton>
								<Show
									when={!personalEdit()}
									fallback={
										<CustomButton
											onClick={() => {
												setPersonalEdit(false);
											}}
										>
											Cancel editing personal poll data
										</CustomButton>
									}
								>
									<CustomButton
										onClick={() => {
											editPersonalMut.reset();
											setPersonalEdit(true);
										}}
									>
										Edit this personal poll data
									</CustomButton>
								</Show>
								<h4 class="font-semibold text-lg">{`status: ${
									personalDataQuery.data?.accepted
										? "Accepted"
										: personalDataQuery.data?.accepted === null
											? "Pending"
											: "Declined"
								}`}</h4>
								<Show when={!personalDataQuery.data?.accepted}>
									{personalDataQuery.data?.decline_reason}
								</Show>

								<Show
									when={!personalEdit()}
									fallback={
										<Form of={personalForm} onSubmit={handleEditPersonal}>
											<For
												each={
													Object.keys(headers) as Array<keyof typeof headers>
												}
											>
												{(el) => (
													<Show when={personalDataQuery.data?.[el]}>
														<h2 class="font-bold text-2xl lg:text-3xl">
															{headers[el]}
														</h2>
														<Field of={personalForm} path={[el]}>
															{(field) => (
																<>
																	<textarea
																		class="box-border w-11/12 resize-none rounded-lg border border-slate-600 p-4 focus-visible:outline-none"
																		{...field.props}
																		value={field.input ?? ""}
																		cols={20}
																		rows={8}
																		autocomplete="off"
																	/>
																	{field.errors && (
																		<div class="text-red-600">{field.errors[0]}</div>
																	)}
																</>
															)}
														</Field>
													</Show>
												)}
											</For>
											<Show when={editPersonalMut.isError}>
												<p class="text-red-600">
													Couldn't save your changes. Check your answers and try again.
												</p>
											</Show>
											<CustomButton
												disabled={editPersonalMut.isPending}
												type="submit"
											>
												Submit Edit
											</CustomButton>
										</Form>
									}
								>
									<For
										each={Object.keys(headers) as Array<keyof typeof headers>}
									>
										{(el) => (
											<Show when={personalDataQuery.data?.[el]}>
												<h2 class="font-bold text-2xl lg:text-3xl">
													{headers[el]}
												</h2>
												<p>{personalDataQuery.data?.[el]}</p>
											</Show>
										)}
									</For>
								</Show>
							</div>
						</Show>
					</TransitionFade>
				</Show>
			</div>

			<div class="flex w-11/12 max-w-2xl flex-col items-center justify-start gap-12 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
				<h2 class="text-center font-bold text-2xl lg:text-3xl">
					Other poll data
				</h2>
				<Show
					when={theirDataQuery.data}
					fallback={
						<div class="flex w-full flex-col items-center justify-center gap-8">
							<p class="text-center text-lg">
								You haven't submitted other poll data yet
							</p>
							<A
								class="w-full max-w-xs rounded-full border border-fuchsia-600 bg-white p-3 text-center font-semibold text-black text-xl shadow-fuchsia-600 shadow-lg transition-all duration-200 ease-out active:scale-125 hover:scale-110 2xl:text-2xl"
								href={routeGen("/questionares/")}
							>
								Do other poll
							</A>
						</div>
					}
				>
					<CustomButton
						class="bg-fuchsia-500 active:bg-fuchsia-600 focus:bg-fuchsia-600 hover:bg-fuchsia-600"
						onClick={() => {
							setShowTheirs(() => !showTheirs());
						}}
					>
						{`${!showTheirs() ? "Show" : "Close"} your other poll data`}
					</CustomButton>

					<CssTranstionGrow visible={showTheirs()}>
						<Show when={theirDataQuery.data}>
							{(their) => (
								<div class="flex w-full flex-col gap-16">
									<div class="flex items-center justify-center">
										<PaginationNav
											arrLength={their().length}
											page={pageTheir()}
											perPageNum={1}
											setPage={setPageTheir}
											classButton="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
											dirSetter={setDir}
										/>
									</div>

									<TransitionSlide dir={dir()}>
										<Show when={pageTheir() === 0 ? true : pageTheir()} keyed>
											<div class="flex flex-col items-center justify-center gap-8">
												<CustomButton
													disabled={removeTheirMut.isPending}
													class="bg-red-500 active:bg-red-600 focus:bg-red-600 hover:bg-red-600"
													onClick={() => {
														removeTheirMut.mutate({
															id: their()[pageTheir()].id,
														});
													}}
												>
													Delete this poll data
												</CustomButton>
												<Show when={their()[pageTheir()].personality_before}>
													<h2 class="font-bold text-2xl lg:text-3xl">
														Their personality before:
													</h2>
													<p>{their()[pageTheir()].personality_before}</p>
												</Show>
												<Show when={their()[pageTheir()].personality_after}>
													<h2 class="font-bold text-2xl lg:text-3xl">
														Their personality after:
													</h2>

													<p>{their()[pageTheir()].personality_after}</p>
												</Show>
												<Show
													when={their()[pageTheir()].what_others_should_know}
												>
													<h2 class="font-bold text-2xl lg:text-3xl">
														What others should know about schizophrenia:
													</h2>
													<p>{their()[pageTheir()].what_others_should_know}</p>
												</Show>
											</div>
										</Show>
									</TransitionSlide>
								</div>
							)}
						</Show>
					</CssTranstionGrow>
				</Show>
			</div>

			<div class="flex w-11/12 max-w-2xl flex-col items-center justify-start gap-12 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
				<h2 class="text-center font-bold text-2xl lg:text-3xl">
					Your submitted articles
				</h2>
				<Show
					when={articlesDataQuery.data}
					fallback={
						<div class="flex w-full flex-col items-center justify-center gap-8">
							<p class="text-center text-lg">
								You haven't submitted any articles yet
							</p>
							<A
								class="w-full max-w-xs rounded-full border border-fuchsia-600 bg-white p-3 text-center font-semibold text-black text-xl shadow-fuchsia-600 shadow-lg transition-all duration-200 ease-out active:scale-125 hover:scale-110 2xl:text-2xl"
								href={routeGen("/articles/")}
							>
								Submit articles
							</A>
						</div>
					}
				>
					<CustomButton
						class="bg-fuchsia-500 active:bg-fuchsia-600 focus:bg-fuchsia-600 hover:bg-fuchsia-600"
						onClick={() => {
							setShowArticles(() => !showArticles());
						}}
					>
						{`${!showArticles() ? "Show" : "Close"} your submitted articles`}
					</CustomButton>

					<CssTranstionGrow visible={showArticles()}>
						<Show when={articlesDataQuery.data}>
							{(articles) => (
								<div class="flex w-full flex-col gap-16">
									<div class="flex items-center justify-center">
										<PaginationNav
											arrLength={articles().length}
											page={pageArticles()}
											perPageNum={5}
											setPage={setPageArticles}
											classButton="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
											dirSetter={setDir}
										/>
									</div>
									<TransitionSlide dir={dir()}>
										<Show
											when={pageArticles() === 0 ? true : pageArticles()}
											keyed
										>
											<div class="flex flex-col items-center justify-center gap-8 border-t-fuchsia-600">
												<For
													each={articles().slice(
														pageArticles() * 5,
														pageArticles() * 5 + 5,
													)}
												>
													{(fiveArticles) => (
														<div class="flex w-full flex-col items-center justify-center gap-8">
															<CustomButton
																disabled={removeArticleMut.isPending}
																class="bg-red-500 active:bg-red-600 focus:bg-red-600 hover:bg-red-600"
																onClick={() => {
																	removeArticleMut.mutate({
																		id: fiveArticles.id,
																	});
																}}
															>
																Delete this article
															</CustomButton>
															<a
																class="flex-1 text-fuchsia-600 text-lg transition-all hover:scale-110 visited:text-fuchsia-800"
																href={fiveArticles.link}
															>
																{fiveArticles.link}
															</a>
															<p class="w-full flex-1 border-b-2 border-b-fuchsia-400 pb-8 text-base">
																{fiveArticles.description}
															</p>
														</div>
													)}
												</For>
											</div>
										</Show>
									</TransitionSlide>
								</div>
							)}
						</Show>
					</CssTranstionGrow>
				</Show>
			</div>

			<div class="flex w-11/12 max-w-2xl flex-col justify-between gap-6 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
				<h2 class="text-center font-bold text-2xl lg:text-3xl">
					Delete account
				</h2>
				<p class="text-center text-lg">
					Deletes both your account and all data you have submitted.
				</p>

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
								class="bg-red-500 active:bg-red-600 focus:bg-red-600 hover:bg-red-600"
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

//BUG counting in articles is messed up, only in SSR
