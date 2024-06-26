import {
	type SubmitHandler,
	createForm,
	reset,
	valiForm,
} from "@modular-forms/solid";
import {
	ErrorBoundary,
	For,
	Show,
	Suspense,
	createEffect,
	createSignal,
} from "solid-js";
import { type Input, maxLength, minLength, object, string } from "valibot";
import CustomButton from "~/components/CustomButton";
import ProtectedAdmin from "~/components/ProtectedAdmin";

import { trpc } from "~/utils/trpc";

const declineSchema = object({
	decline_reason: string([
		maxLength(600, "Your text is too long! (Max. 600 characters)"),
		minLength(10, "Your text is too short, 10 chars"),
	]),
});

type DeclineForm = Input<typeof declineSchema>;

export const { route, Page } = ProtectedAdmin((session) => {
	const [accepted, setAccepted] = createSignal<null | boolean>(null);
	const [pOrT, setPOrT] = createSignal<
		"Personal_questions" | "Their_questions"
	>("Personal_questions");
	const [page, setPage] = createSignal(0);
	const [pageArticles, setPageArticles] = createSignal(0);
	const [showModal, setShowModal] = createSignal(false);
	const [entryEdit, setEntryEdit] = createSignal<number>(0);
	const [tab, setTab] = createSignal<"poll" | "articles">("poll");

	const utils = trpc.useContext();

	const submissions = trpc.listSubmissions.createQuery(() => ({
		page: page(),
		accepted: accepted(),
		pOrT: pOrT(),
	}));

	const articles = trpc.listArticles.createQuery(() => ({
		page: pageArticles(),
		accepted: accepted(),
	}));

	const acceptMut = trpc.acceptSubmission.createMutation(() => ({
		onSuccess: () => utils.listSubmissions.invalidate(),
	}));
	const declineMut = trpc.declineSubmission.createMutation(() => ({
		onSuccess: () => utils.listSubmissions.invalidate(),
	}));
	const acceptArticleMut = trpc.acceptArticle.createMutation(() => ({
		onSuccess: () => utils.listArticles.invalidate(),
	}));
	const declineArticleMut = trpc.declineArticle.createMutation(() => ({
		onSuccess: () => utils.listArticles.invalidate(),
	}));

	const [declineForm, { Form, Field }] = createForm<DeclineForm>({
		validate: valiForm(declineSchema),
	});
	createEffect(() => {
		if (declineMut.isSuccess || declineArticleMut.isSuccess) {
			setShowModal(false);
			setEntryEdit(0);
			declineMut.reset();
			declineArticleMut.reset();
			reset(declineForm);
		}
	});

	const handleDecline: SubmitHandler<DeclineForm> = async (values, event) => {
		if (tab() === "poll") {
			declineMut.mutate({
				id: entryEdit(),
				pOrT: pOrT(),
				decline_reason: values.decline_reason,
			});
		} else if (tab() === "articles") {
			declineArticleMut.mutate({
				id: entryEdit(),
				decline_reason: values.decline_reason,
			});
		}
	};

	return (
		<>
			<div class="flex flex-col items-center">
				<Show when={showModal()}>
					<dialog open>
						<div class="fixed top-0 left-0 z-40 h-screen w-screen bg-black opacity-50" />
						<div class="fixed top-1/2 left-1/2 z-50 flex gap-10 border-2 border-red-700 bg-white p-8">
							<Form onSubmit={handleDecline}>
								<Field name="decline_reason">
									{(field, props) => (
										<>
											<textarea
												class="box-border w-11/12 resize-none rounded-lg border border-slate-600 p-4 focus-visible:outline-none"
												{...props}
												cols={20}
												rows={3}
												required
												autocomplete="off"
												placeholder="Decline reason"
											/>
											{field.error && <div>{field.error}</div>}
										</>
									)}
								</Field>
								<CustomButton
									disabled={declineArticleMut.isPending || declineMut.isPending}
									type="submit"
								>
									Decline
								</CustomButton>
								<CustomButton
									onClick={() => {
										setShowModal(false);
										setEntryEdit(0);
										reset(declineForm);
									}}
								>
									Cancel
								</CustomButton>
							</Form>
						</div>
					</dialog>
				</Show>
				<CustomButton
					onClick={() => {
						setTab(tab() === "articles" ? "poll" : "articles");
					}}
				>
					{tab() === "articles"
						? "Switch to poll CRUD"
						: "Switch to articles CRUD"}
				</CustomButton>
				<Show
					when={tab() === "poll"}
					fallback={
						<>
							<div class="flex w-full max-w-xs flex-col gap-8 xl:max-w-2xl">
								<For each={articles.data}>
									{(article, index) => (
										<div class="flex w-full flex-col gap-2 rounded-3xl bg-blue-200 p-8">
											<div class="m-8 flex items-center justify-between">
												<h3 class="font-bold text-xl">{index()}</h3>
												<Show
													when={accepted()}
													fallback={
														<>
															<CustomButton
																disabled={acceptArticleMut.isPending}
																onclick={() => {
																	acceptArticleMut.mutate({
																		id: article.id,
																	});
																}}
															>
																Accept
															</CustomButton>

															<CustomButton
																onclick={() => {
																	setEntryEdit(article.id);
																	setShowModal(true);
																}}
															>
																Decline
															</CustomButton>
														</>
													}
												>
													<CustomButton
														onclick={() => {
															setEntryEdit(article.id);
															setShowModal(true);
														}}
													>
														Decline
													</CustomButton>
												</Show>
											</div>
											<For each={Object.keys(article)}>
												{(keys) => (
													<>
														<h4 class="w-full font-bold text-lg">{keys}</h4>
														<p class="w-full">{article[keys]}</p>
													</>
												)}
											</For>
										</div>
									)}
								</For>
							</div>
							<div class="m-16 flex w-full items-center justify-around">
								<CustomButton
									class={pageArticles() === 0 ? "invisible" : ""}
									onClick={() =>
										setPageArticles((prev) => (prev === 0 ? 0 : prev - 1))
									}
								>
									Back
								</CustomButton>
								<h5 class="font-bold text-lg">{`Page: ${pageArticles() + 1}/${
									Math.floor(articles.data[0].count / 25) + 1
								}`}</h5>

								<CustomButton
									class={
										articles.data[0].count / ((pageArticles() + 1) * 25) <= 1
											? "invisible"
											: ""
									}
									onClick={() =>
										setPageArticles((prev) =>
											articles.data[0].count / ((prev + 1) * 25) <= 1
												? prev
												: prev + 1,
										)
									}
								>
									Next
								</CustomButton>
							</div>
						</>
					}
				>
					<div class="my-10 flex items-center justify-between gap-4 p-4">
						<CustomButton
							class={`${
								pOrT() === "Personal_questions"
									? "bg-blue-900 active:bg-blue-900 focus:bg-blue-900"
									: ""
							}`}
							onClick={() => setPOrT("Personal_questions")}
						>
							Personal
						</CustomButton>
						<CustomButton
							class={`${
								accepted()
									? "bg-blue-900 active:bg-blue-900 focus:bg-blue-900"
									: ""
							}`}
							onClick={() => setAccepted(accepted() === true ? null : true)}
						>
							Accepted
						</CustomButton>
						<CustomButton
							class={`${
								pOrT() === "Their_questions"
									? "bg-blue-900 active:bg-blue-900 focus:bg-blue-900"
									: ""
							}`}
							onClick={() => setPOrT("Their_questions")}
						>
							Their
						</CustomButton>
					</div>
					<div class="flex w-full max-w-xs flex-col gap-8 xl:max-w-2xl">
						<For each={submissions.data?.poll}>
							{(entry, index) => (
								<div class="flex w-full flex-col gap-2 rounded-3xl bg-blue-200 p-8">
									<div class="m-8 flex items-center justify-between">
										<h3 class="font-bold text-xl">{index()}</h3>
										<Show
											when={accepted()}
											fallback={
												<>
													<CustomButton
														disabled={acceptMut.isPending}
														onclick={() => {
															acceptMut.mutate({
																id: entry.id,
																pOrT: pOrT(),
															});
														}}
													>
														Accept
													</CustomButton>

													<CustomButton
														onclick={() => {
															setEntryEdit(entry.id);
															setShowModal(true);
														}}
													>
														Decline
													</CustomButton>
												</>
											}
										>
											<CustomButton
												onclick={() => {
													setEntryEdit(entry.id);
													setShowModal(true);
												}}
											>
												Decline
											</CustomButton>
										</Show>
									</div>
									<For each={Object.keys(entry)}>
										{(keys) => (
											<>
												<h4 class="w-full font-bold text-lg">{keys}</h4>
												<p class="w-full">{entry[keys]}</p>
											</>
										)}
									</For>
								</div>
							)}
						</For>
					</div>
					<div class="m-16 flex w-full items-center justify-around">
						<CustomButton
							class={page() === 0 ? "invisible" : ""}
							onClick={() => setPage((prev) => (prev === 0 ? 0 : prev - 1))}
						>
							Back
						</CustomButton>
						<h5 class="font-bold text-lg">{`Page: ${page() + 1}/${
							Math.floor(submissions.data?.total / 25) + 1
						}`}</h5>

						<CustomButton
							class={
								submissions.data?.total / ((page() + 1) * 25) <= 1
									? "invisible"
									: ""
							}
							onClick={() =>
								setPage((prev) =>
									submissions.data?.total / ((prev + 1) * 25) <= 1
										? prev
										: prev + 1,
								)
							}
						>
							Next
						</CustomButton>
					</div>
				</Show>
			</div>
		</>
	);
});

export default Page;

//BUG SSR doesnt work probably show without single parent jsx
