import type { Component } from "solid-js";
import { Show, createEffect, createSignal } from "solid-js";
import type { ChartistData, StatsData } from "~/types/types";
import PieChartCustom from "./PieChartCustom";

export const YesOrNoComponent: Component<{
	stat: string;
	header: string;
	data: StatsData | undefined;
}> = (props) => {
	const [qDAata, setQDAata] = createSignal<ChartistData | null>(null);

	createEffect(() => {
		const d = props.data?.[props.stat] as { yes: number; no: number; prefer_not?: number } | undefined;
		if (d) {
			// A third slice for "Prefer not to say" on sensitive questions, when anyone chose it
			const parts: [string, number][] = [
				["Yes", d.yes],
				["No", d.no],
				...(d.prefer_not ? ([["Prefer not to say", d.prefer_not]] as [string, number][]) : []),
			];
			const total = parts.reduce((a, [, n]) => a + n, 0);
			setQDAata({
				labels: parts.map(([label, n]) => `${label} ${total ? Math.floor((n / total) * 100) : 0}%`),
				series: parts.map(([, n]) => n),
			});
		}
	});

	return (
		<div
			id={props.header.split(" ").join("")}
			class="flex flex-col items-center justify-center"
		>
			<h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
			<div class="mb-4 flex w-11/12 items-center justify-center lg:max-w-md">
				<Show
					when={props.data}
					fallback={
						<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
					}
				>
					<PieChartCustom yesOrNo={true} {...props} data={qDAata()} />
				</Show>
			</div>
		</div>
	);
};
