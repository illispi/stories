import type { SubmitHandler } from "@modular-forms/solid";
import { createForm, valiForm } from "@modular-forms/solid";
import { cache, createAsync, useSearchParams } from "@solidjs/router";
import type { Component, Setter } from "solid-js";
import { For, Show, Suspense, createSignal } from "solid-js";
import type { Input } from "valibot";
import { maxLength, minLength, object, string } from "valibot";
import ArticleSubmit from "~/components/ArticleSubmit";
import CssTranstionGrow from "~/components/CssTranstionGrow";
import CustomButton from "~/components/CustomButton";
import LoginA from "~/components/LoginA";
import PaginationNav from "~/components/PaginationNav";
import TransitionSlide from "~/components/TransitionSlide";
import { userLoader } from "~/server/loader/userLoader";
import { trpc } from "~/utils/trpc";

const getUser = cache(async () => {
	return await userLoader();
}, "user");

export const route = {
	load: () => getUser(),
};

const articles: Component = () => {
	const user = createAsync(() => getUser());

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

export default articles;

//TODO does this work on real network without useTransition
