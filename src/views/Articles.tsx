import { useSearchParams } from "~/utils/router";
import { withProviders } from "~/islands/withProviders";
import type { Component } from "solid-js";
import { For, Show, Suspense, createSignal } from "solid-js";
import ArticleSubmit from "~/components/ArticleSubmit";
import CssTranstionGrow from "~/components/CssTranstionGrow";
import CustomButton from "~/components/CustomButton";
import LoginA from "~/components/LoginA";
import PaginationNav from "~/components/PaginationNav";
import TransitionSlide from "~/components/TransitionSlide";
import { trpc } from "~/utils/trpc";

const articles: Component<{ user: boolean; admin?: boolean }> = (props) => {
	const user = () => props.user;

	const [searchParams, setSearchParams] = useSearchParams();
	const [page, setPage] = createSignal(Number(searchParams.page ?? 1) - 1);
	const [submitVis, setSubmitVis] = createSignal(false);
	const articlesData = trpc.articlesPagination.createQuery(
		() => ({
			page: page(),
		}),
		() => ({ placeholderData: (prev) => prev }),
	);

	const [dir, setDir] = createSignal(1);

	// Admin only (the server checks the role too): two-step delete, no browser dialog.
	const [confirmDelete, setConfirmDelete] = createSignal<number | null>(null);
	const utils = trpc.useContext();
	const deleteMut = trpc.deleteArticleAdmin.createMutation(() => ({
		onSuccess: () => {
			setConfirmDelete(null);
			utils.invalidate();
		},
	}));

	return (
		<Suspense>
			<div class="my-16 flex min-h-screen w-full flex-col items-center justify-start gap-8">
				<Suspense>
					<div class="flex w-11/12 max-w-prose flex-col items-center justify-start gap-10 rounded-3xl border-fuchsia-600 border-t-4 bg-white py-12 shadow-xl">
						<h2 class="font-bold text-2xl lg:text-3xl">
							Submit article/interview
						</h2>
						<Show when={user()} fallback={<LoginA />}>
							<CustomButton
								class={
									!submitVis()
										? ""
										: "bg-orange-500 active:bg-orange-600 focus:bg-orange-600 hover:bg-orange-600"
								}
								onClick={() => {
									setSubmitVis(!submitVis());
								}}
							>
								{`${submitVis() ? "Cancel" : "Submit new!"}`}
							</CustomButton>
						</Show>
						<CssTranstionGrow visible={submitVis()}>
							<ArticleSubmit setSubmitVis={setSubmitVis} />
						</CssTranstionGrow>
					</div>
					<h2 class="mt-8 font-bold text-4xl">Articles:</h2>
					<Show when={articlesData.data?.count}>
						{(data) => (
							<div class="flex w-full max-w-md items-center justify-around">
								<PaginationNav
									arrLength={Number(data().count)}
									page={page()}
									perPageNum={25}
									setPage={setPage}
									classButton="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
									dirSetter={setDir}
									backOnClick={() => setSearchParams({ page: page() + 1 })}
									nextOnClick={() => setSearchParams({ page: page() + 1 })}
								/>
							</div>
						)}
					</Show>
				</Suspense>

				<Show
					when={articlesData.data}
					fallback={<h2>No articles found yet!</h2>}
				>
					{(articles) => (
						<TransitionSlide dir={dir()}>
							<Show when={page() === 0 ? true : page()} keyed>
								<div class="flex flex-col items-center justify-center gap-8 border-t-fuchsia-600">
									<For each={articles().articles}>
										{(twentyfiveArticles) => (
											<div class="flex w-full flex-col items-center justify-center gap-8">
												<div class="flex w-11/12 max-w-prose flex-col items-center justify-start gap-8 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
													<a
														class="flex-1 text-fuchsia-600 text-lg transition-all hover:scale-110 visited:text-fuchsia-800"
														href={twentyfiveArticles.link}
													>
														{twentyfiveArticles.link}
													</a>
													<p class="flex-1 text-base">
														{twentyfiveArticles.description}
													</p>
													<Show when={props.admin}>
														<Show
															when={confirmDelete() === twentyfiveArticles.id}
															fallback={
																<CustomButton
																	class="bg-red-500 hover:bg-red-600 focus:bg-red-600 active:bg-red-600"
																	onClick={() => setConfirmDelete(twentyfiveArticles.id)}
																>
																	Delete (admin)
																</CustomButton>
															}
														>
															<div class="flex flex-col items-center gap-2">
																<p class="font-semibold text-red-700">Delete this article for everyone?</p>
																<div class="flex flex-wrap justify-center">
																	<CustomButton
																		class="bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-700"
																		disabled={deleteMut.isPending}
																		onClick={() => deleteMut.mutate({ id: twentyfiveArticles.id })}
																	>
																		Yes, delete
																	</CustomButton>
																	<CustomButton onClick={() => setConfirmDelete(null)}>Cancel</CustomButton>
																</div>
															</div>
														</Show>
													</Show>
												</div>
											</div>
										)}
									</For>
								</div>
							</Show>
						</TransitionSlide>
					)}
				</Show>
				<Suspense>
					<Show when={articlesData.data?.count}>
						{(data) => (
							<div class="flex w-full max-w-md items-center justify-around">
								<PaginationNav
									arrLength={Number(data().count)}
									page={page()}
									perPageNum={25}
									setPage={setPage}
									classButton="bg-fuchsia-500 hover:bg-fuchsia-600 focus:bg-fuchsia-600 active:bg-fuchsia-600"
									dirSetter={setDir}
									backOnClick={() => {
										setSearchParams({ page: page() + 1 });
										window.scrollTo({ top: 0, behavior: "smooth" });
									}}
									nextOnClick={() => {
										setSearchParams({ page: page() + 1 });
										window.scrollTo({ top: 0, behavior: "smooth" });
									}}
								/>
							</div>
						)}
					</Show>
				</Suspense>
			</div>
		</Suspense>
	);
};

export default withProviders(articles);

//TODO does this work on real network without useTransition
