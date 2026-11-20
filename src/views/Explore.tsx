import { For, Show, createMemo, createSignal } from "solid-js";
import Segmented from "~/components/Segmented";
import { type Dimension, defaultExplore, type ExplorePoll, exploreDimensions, findDimension } from "~/data/explore";
import { withProviders } from "~/islands/withProviders";
import { type ChartOption, createChart } from "~/utils/echarts";
import { A, useNavigate, useParams, useSearchParams } from "~/utils/router";
import { route } from "~/utils/routes";
import { trpc } from "~/utils/trpc";

type Data = "real" | "fake";

const GROUP_COLOR = "#c026d3"; // fuchsia-600
const EVERYONE_COLOR = "#94a3b8"; // slate-400

const percent = (count: number, total: number) => (total ? Math.round((count / total) * 1000) / 10 : 0);

const selectClass =
	"w-full rounded-xl border border-slate-300 bg-white p-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500";

const Card = (props: { step?: string; title: string; children: any }) => (
	<section class="flex w-11/12 max-w-3xl flex-col gap-4 rounded-3xl border-fuchsia-600 border-t-4 bg-white p-6 shadow-xl lg:p-10">
		<h2 class="font-bold text-xl lg:text-2xl">
			<Show when={props.step}>
				<span class="mr-2 text-fuchsia-600">{props.step}</span>
			</Show>
			{props.title}
		</h2>
		{props.children}
	</section>
);

/** Grouped horizontal bars: the chosen group next to everyone, in percent. */
const ResultChart = (props: {
	target: Dimension;
	group: { answered: number; counts: Record<string, number> };
	everyone: { answered: number; counts: Record<string, number> };
	groupName: string;
}) => {
	const [el, setEl] = createSignal<HTMLDivElement>();
	const option = (): ChartOption => {
		const labels = props.target.options.map((o) => o.label);
		const values = (t: { answered: number; counts: Record<string, number> }) =>
			props.target.options.map((o) => percent(t.counts[o.value] ?? 0, t.answered));
		return {
			aria: { enabled: true },
			animationDuration: 400,
			legend: { top: 0, textStyle: { fontSize: 13 } },
			tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (v) => `${v}%` },
			grid: { left: 8, right: 48, top: 40, bottom: 8, containLabel: true },
			xAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%" } },
			yAxis: { type: "category", data: labels, inverse: true, axisLabel: { width: 140, overflow: "break" } },
			series: [
				{
					name: props.groupName,
					type: "bar",
					data: values(props.group),
					itemStyle: { color: GROUP_COLOR, borderRadius: [0, 4, 4, 0] },
					label: { show: true, position: "right", formatter: "{c}%" },
					barMaxWidth: 22,
				},
				{
					name: "Everyone",
					type: "bar",
					data: values(props.everyone),
					itemStyle: { color: EVERYONE_COLOR, borderRadius: [0, 4, 4, 0] },
					label: { show: true, position: "right", formatter: "{c}%" },
					barMaxWidth: 22,
				},
			],
		};
	};
	createChart(el, () => true, option);
	return (
		<div
			ref={setEl}
			class="w-full"
			style={{ height: `${props.target.options.length * 64 + 70}px` }}
			role="img"
			aria-label={`Bar chart: ${props.target.question}`}
		/>
	);
};

const Explore = () => {
	const params = useParams<{ pOrT: ExplorePoll; fOrT: Data }>();
	const navigate = useNavigate();
	const [search, setSearch] = useSearchParams<{ f?: string; a?: string; t?: string }>();

	const dims = exploreDimensions[params.pOrT];
	const defaults = defaultExplore[params.pOrT];

	// Selection lives in the URL, so a view can be shared or bookmarked
	const filter = createMemo(() => findDimension(params.pOrT, search.f) ?? (findDimension(params.pOrT, defaults.filter) as Dimension));
	const answer = createMemo(() => {
		const a = search.a ?? (filter().key === defaults.filter ? defaults.answer : undefined);
		return filter().options.some((o) => o.value === a) ? (a as string) : filter().options[0].value;
	});
	const target = createMemo(() => {
		const t = findDimension(params.pOrT, search.t ?? defaults.target);
		return t && t.key !== filter().key ? t : (dims.find((d) => d.key !== filter().key) as Dimension);
	});
	const answerLabel = () => filter().options.find((o) => o.value === answer())?.label ?? answer();

	const result = trpc.crossFilter.createQuery(
		() => ({ pOrT: params.pOrT, fake: params.fOrT, filter: filter().key, answer: answer(), target: target().key }),
		() => ({ placeholderData: (prev) => prev }),
	);

	const switchPage = (pOrT: ExplorePoll, fOrT: Data) =>
		navigate(
			route("/explore/:pOrT/:fOrT", { pOrT, fOrT }) +
				// Question keys differ between the two polls; keep the selection only within one poll
				(pOrT === params.pOrT ? location.search : ""),
		);

	const groupName = () => `"${answerLabel()}"`;

	return (
		<div class="flex min-h-screen w-full flex-col items-center gap-10 bg-slate-100 py-20 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
			<header class="mt-16 flex w-11/12 max-w-3xl flex-col items-center gap-4 text-center lg:mt-28">
				<h1 class="font-bold text-4xl lg:text-6xl">Explore answers</h1>
				<p class="text-lg text-slate-700">
					Pick a group of people by one answer, then see how they answered another question compared with
					everyone.
				</p>
				<div class="flex flex-wrap justify-center gap-3">
					<Segmented
						label="Poll"
						options={[
							["Personal_questions", "Personal poll"],
							["Their_questions", "Relatives' poll"],
						]}
						value={params.pOrT}
						onChange={(v) => switchPage(v, params.fOrT)}
					/>
					<Segmented
						label="Data"
						options={[
							["real", "Real data"],
							["fake", "Fake data"],
						]}
						value={params.fOrT}
						onChange={(v) => switchPage(params.pOrT, v)}
					/>
				</div>
			</header>

			<Card step="1." title="Choose a group">
				<label class="flex flex-col gap-2">
					<span class="font-semibold text-slate-600 text-sm">People who answered</span>
					<select
						class={selectClass}
						onChange={(e) => setSearch({ f: e.currentTarget.value, a: null })}
					>
						<For each={dims}>
							{(d) => (
								<option value={d.key} selected={d.key === filter().key}>
									{d.question}
								</option>
							)}
						</For>
					</select>
				</label>
				<div class="flex flex-col gap-2">
					<span class="font-semibold text-slate-600 text-sm">with</span>
					<div>
						<Segmented
						label="Answer"
						options={filter().options.map((o) => [o.value, o.label] as [string, string])}
						value={answer()}
						onChange={(v) => setSearch({ a: v })}
						/>
					</div>
				</div>
			</Card>

			<Card step="2." title="Compare their answers to">
				<select
					class={selectClass}
					aria-label="Question to compare"
					onChange={(e) => setSearch({ t: e.currentTarget.value })}
				>
					<For each={dims.filter((d) => d.key !== filter().key)}>
						{(d) => (
							<option value={d.key} selected={d.key === target().key}>
								{d.question}
							</option>
						)}
					</For>
				</select>
			</Card>

			<Card title={target().question}>
				<p class="text-slate-700">
					People who answered <strong>{answerLabel()}</strong> to <em>{filter().question}</em> compared with
					everyone who answered this question.
				</p>
				<Show when={result.isError}>
					<p class="text-red-600">Couldn't load these results. Try another combination.</p>
				</Show>
				<Show when={result.data}>
					{(data) => (
						<Show
							when={data().group}
							fallback={
								<div class="flex flex-col items-center gap-3 rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
									<Show
										when={data().hiddenReason === "group"}
										fallback={
											<p>
												Another answer to <em>{filter().question}</em> has fewer than {data().minGroup} people so far.
												This comparison stays hidden until it has more, because otherwise their answers could be worked
												out from the totals.
											</p>
										}
									>
										<p class="font-semibold text-2xl">
											{data().groupAnswered}/{data().minGroup}
										</p>
										<p>
											Only {data().groupAnswered} {data().groupAnswered === 1 ? "person" : "people"} in this group{" "}
											{data().groupAnswered === 1 ? "has" : "have"} answered so far. Results show once at least{" "}
											{data().minGroup} have, so nobody can be recognised from them.
										</p>
									</Show>
									<A
										class="font-semibold text-fuchsia-700 underline underline-offset-4"
										href={route("/explore/:pOrT/:fOrT", { pOrT: params.pOrT, fOrT: "fake" }) + location.search}
									>
										Try it with fake data
									</A>
								</div>
							}
						>
							{(group) => (
								<>
									<p class="text-slate-600 text-sm">
										Based on <strong>{group().answered}</strong> {group().answered === 1 ? "answer" : "answers"} in this group
										and <strong>{data().everyone.answered}</strong> overall.
										<Show when={target().kind === "multiSelect"}>
											{" "}People could pick several options, so the bars can add up to more than 100%.
										</Show>
									</p>
									<Show when={group().answered < 20}>
										<p class="rounded-xl bg-amber-50 p-3 text-amber-900 text-sm ring-1 ring-amber-200">
											This is a small group, so a few answers can change these numbers a lot. Read them with care.
										</p>
									</Show>
									<ResultChart target={target()} group={group()} everyone={data().everyone} groupName={groupName()} />
									<details class="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
										<summary class="cursor-pointer font-semibold">Show as a table</summary>
										<table class="mt-3 w-full text-left text-sm">
											<thead>
												<tr class="border-slate-300 border-b">
													<th class="py-2">Answer</th>
													<th class="py-2 text-right">{groupName()}</th>
													<th class="py-2 text-right">Everyone</th>
												</tr>
											</thead>
											<tbody>
												<For each={target().options}>
													{(o) => (
														<tr class="border-slate-200 border-b last:border-0">
															<td class="py-2">{o.label}</td>
															<td class="py-2 text-right">
																{percent(group().counts[o.value] ?? 0, group().answered)}% ({group().counts[o.value] ?? 0})
															</td>
															<td class="py-2 text-right">
																{percent(data().everyone.counts[o.value] ?? 0, data().everyone.answered)}% (
																{data().everyone.counts[o.value] ?? 0})
															</td>
														</tr>
													)}
												</For>
											</tbody>
										</table>
									</details>
								</>
							)}
						</Show>
					)}
				</Show>
				<p class="text-slate-500 text-sm">
					These numbers show how answers go together in this poll, not what causes what.
				</p>
			</Card>
		</div>
	);
};

export default withProviders(Explore);
