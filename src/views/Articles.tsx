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
import { toWebLink } from "~/utils/articleLink";
import { TagChips } from "~/components/ArticleTags";
import { ARTICLE_TAGS, type ArticleTag, isArticleTag, tagLabel } from "~/data/articleTags";

const articles: Component<{ user: boolean }> = (props) => {
	const user = () => props.user;

	const [searchParams, setSearchParams] = useSearchParams();
	const [page, setPage] = createSignal(Math.max(0, Number(searchParams.page ?? 1) - 1 || 0));
	const [tag, setTag] = createSignal<ArticleTag | null>(isArticleTag(searchParams.tag) ? searchParams.tag : null);
	const [submitVis, setSubmitVis] = createSignal(false);
	const articlesData = trpc.articlesPagination.createQuery(
		() => ({
			page: page(),
			tag: tag(),
		}),
		() => ({ placeholderData: (prev) => prev }),
	);

	const chooseTag = (next: ArticleTag | null) => {
		setTag(next);
		setPage(0);
		setSearchParams({ tag: next, page: null });
	};

	const [dir, setDir] = createSignal(1);

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
					<nav aria-label="Filter articles by topic" class="flex w-11/12 max-w-3xl flex-wrap justify-center gap-2">
						<For each={[[null, "All topics"] as const, ...ARTICLE_TAGS]}>
							{([key, label]) => (
								<button
									type="button"
									aria-pressed={tag() === key}
									class="rounded-full px-4 py-1.5 font-semibold text-sm ring-1 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
									classList={{
										"bg-fuchsia-600 text-white ring-fuchsia-600": tag() === key,
										"bg-white text-slate-700 ring-slate-300 hover:bg-fuchsia-50": tag() !== key,
									}}
									onClick={() => chooseTag(key)}
								>
									{label}
								</button>
							)}
						</For>
					</nav>
					<Show when={Number(articlesData.data?.count?.count ?? 0) > 0 && articlesData.data?.count}>
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

				<Show when={articlesData.data && Number(articlesData.data.count?.count ?? 0) === 0}>
					<p class="text-center text-lg text-slate-600">
						{tag() ? `No articles about "${tagLabel(tag() as string)}" yet.` : "No articles found yet!"}
					</p>
				</Show>
				<Show when={articlesData.data}>
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
														href={toWebLink(twentyfiveArticles.link) ?? undefined}
														rel="nofollow ugc noreferrer"
													>
														{twentyfiveArticles.link}
													</a>
													<p class="flex-1 text-base">
														{twentyfiveArticles.description}
													</p>
													<TagChips tags={twentyfiveArticles.tags} />
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
					<Show when={Number(articlesData.data?.count?.count ?? 0) > 0 && articlesData.data?.count}>
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
