import { withProviders } from "~/islands/withProviders";
import { A, useParams } from "~/utils/router";
import { route } from "~/utils/routes";
import type { Component, ParentComponent } from "solid-js";
import { For, Show, Suspense, createEffect, createSignal, onCleanup } from "solid-js";
import { CompSelector } from "~/components/CompSelector";
import CustomButton from "~/components/CustomButton";
import { allStatsPersonalArr } from "~/data/stats/allStatsArr";
import { allStatsTheirArr } from "~/data/stats/allStatsTheir";
import { trpc } from "~/utils/trpc";
import YourAnswer from "~/components/YourAnswer";

const CompareButton: Component = () => {
	const params = useParams<{
		pOrT: "Personal_questions" | "Their_questions";
		fOrT: "real" | "fake";
	}>();
	return (
		<div class="m-6 flex flex-col items-center justify-between rounded-3xl border-2 border-gray-300 bg-gray-100 p-6">
			<A
				href={route("/compare/:pOrT/:fOrT/compare", {
					pOrT: params.pOrT,
					fOrT: params.fOrT,
				})}
			>
				<CustomButton class="m-2 rounded-full bg-blue-500 p-5 font-semibold text-white transition-all active:scale-110 hover:scale-110 active:bg-blue-600 hover:bg-blue-600">
					Compare
				</CustomButton>
			</A>
			<div class="m-2" />
			<p>Allows to compare statistics between genders and diagnosis</p>
			<div class="m-4" />
			<A
				href={route("/explore/:pOrT/:fOrT", {
					pOrT: params.pOrT,
					fOrT: params.fOrT,
				})}
			>
				<CustomButton class="m-2 rounded-full bg-fuchsia-600 p-5 font-semibold text-white transition-all active:scale-110 hover:scale-110 active:bg-fuchsia-700 hover:bg-fuchsia-700">
					Explore
				</CustomButton>
			</A>
			<div class="m-2" />
			<p>See how people with one answer answered other questions</p>
		</div>
	);
};

const AllStatsPage: ParentComponent = () => {
	const params = useParams<{
		pOrT: "Personal_questions" | "Their_questions";
		fOrT: "fake" | "real";
	}>();

	const allStatsData = trpc.allStats.createQuery(() => ({
		value: "all",
		pOrT: params.pOrT,
		fake: params.fOrT,
	}));

	const compOrder =
		params.pOrT === "Personal_questions"
			? allStatsPersonalArr
			: allStatsTheirArr;

	// "How do I compare?": signed-in users see their own answer under each chart
	const isPersonal = params.pOrT === "Personal_questions";
	const authQuery = trpc.authStatus.createQuery();
	const signedIn = () => Boolean(authQuery.data?.user);
	const personalQuery = trpc.getPersonal.createQuery(undefined, () => ({ enabled: signedIn() && isPersonal }));
	const theirsQuery = trpc.getTheirs.createQuery(undefined, () => ({ enabled: signedIn() && !isPersonal }));
	// Several relatives' polls: the user picks which one to compare (0 = hide)
	const [theirId, setTheirId] = createSignal<number | null>(null);
	const theirs = () => theirsQuery.data ?? [];
	const chosenTheir = () => {
		const id = theirId() ?? theirs()[0]?.id;
		return theirs().find((r) => r.id === id) ?? null;
	};
	const myRow = (): Record<string, unknown> | null =>
		isPersonal ? (personalQuery.data ?? null) : chosenTheir();
	const theirLabel = (r: Record<string, unknown>, index: number) =>
		[`Poll ${index + 1}`, r.relation, r.gender, r.current_age ? `age ${r.current_age}` : null, r.diagnosis]
			.filter(Boolean)
			.join(" · ");

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
		// console.log("observer");

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

	return (
		<Suspense>
			<div>
				<Show
					when={
						((allStatsData.data?.total && allStatsData.data?.total >= 5) ||
							params.fOrT === "fake") &&
						allStatsData.data
					}
					fallback={
						<Suspense>
							<Show when={allStatsData.data}>
								<div class="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
									<div class="my-32 flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:my-64 lg:p-16">
										<h2 class="text-center text-2xl font-bold lg:text-3xl">
											{`${allStatsData.data?.total ?? 0}/5`}
										</h2>
										<p class="text-center text-lg">
											Poll needs to be done by at least 5 people
										</p>
										<A
											class="rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
											href={route("/questionares/:personalQuestions", {
												personalQuestions:
													params.pOrT === "Personal_questions"
														? "personalQuestions"
														: "theirQuestions",
											})}
										>
											Do the poll now
										</A>
										<A
											class="rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
											href={route("/pollResults/:pOrT/:fOrT/pollResults", {
												fOrT: "fake",
												pOrT: params.pOrT,
											})}
										>
											View results with fake data
										</A>
									</div>
								</div>
							</Show>
						</Suspense>
					}
				>
					{(data) => (
						<div class="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
							<div class="my-32 flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 md:max-w-xl">
								<div class="flex h-16 items-center justify-center bg-blue-300 p-4">
									<h1 class="text-center font-semibold">Statistics personal</h1>
								</div>
								<div class="flex flex-col items-center justify-center">
									<div class="z-[5] flex w-full flex-col items-center justify-center gap-4 bg-white">
										<CompareButton />
										<Show when={signedIn() && (isPersonal ? personalQuery.data : theirs().length)}>
											<div class="mx-6 flex flex-col items-center gap-3 rounded-3xl bg-fuchsia-50 p-6 text-center ring-1 ring-fuchsia-200">
												<h2 class="font-bold text-lg">How do I compare?</h2>
												<Show
													when={!isPersonal}
													fallback={<p>Your own answers are shown under each chart.</p>}
												>
													<label class="flex w-full flex-col gap-2">
														<span>Show the answers from one of your relatives' polls under each chart:</span>
														<select
															class="w-full rounded-xl border border-slate-300 bg-white p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500"
															onChange={(e) => setTheirId(Number(e.currentTarget.value))}
														>
															<For each={theirs()}>
																{(r, i) => (
																	<option value={r.id} selected={r.id === chosenTheir()?.id}>
																		{theirLabel(r, i())}
																	</option>
																)}
															</For>
															<option value={0} selected={theirId() === 0}>
																Don't show my answers
															</option>
														</select>
													</label>
												</Show>
												<Show when={myRow() && myRow()?.accepted !== true}>
													<p class="text-slate-600 text-sm">
														{myRow()?.accepted === false
															? "This poll was declined, so it isn't counted in these results."
															: "This poll is waiting for review, so it isn't counted in these results yet."}
													</p>
												</Show>
												<Show when={params.fOrT === "fake"}>
													<p class="text-slate-600 text-sm">These results are fake data.</p>
												</Show>
											</div>
										</Show>
										<For each={compOrder}>
											{(comp) => (
												<div class="w-full">
													<CompSelector
														{...comp}
														data={data()}
														ref={(el: Element) => setTargets((p) => [...p, el])}
														shown={shown()}
														removeShown={removeShown}
														pOrT={params.pOrT}
														fOrT={params.fOrT}
													/>
													<YourAnswer poll={params.pOrT} stat={"stat" in comp ? String(comp.stat) : ""} row={myRow()} />
												</div>
											)}
										</For>

										<CompareButton />
									</div>
								</div>
							</div>
						</div>
					)}
				</Show>
			</div>
		</Suspense>
	);
};

export default withProviders(AllStatsPage);

//TODO might want to change ask first if you have told anybody and then who
//TODO what_others_Should_know and not_have_schizophrenia_description need custom logic in text to show yes and no separately, backend solution might be good
