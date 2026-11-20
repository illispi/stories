import { mergeRefs } from "@solid-primitives/refs";
import type { Component } from "solid-js";
import { Show, createMemo, createSignal } from "solid-js";
import type { ChartistData } from "~/types/types";
import { type ChartOption, chartColor, createChart } from "~/utils/echarts";
import { useLazyReady } from "~/utils/useLazyReady";

/**
 * Bar options as written in src/data/stats. The data files still use the old Chartist
 * option names; only `reverseData` changes the ECharts chart (first label at the top).
 * Bars are always horizontal, one colour per bar.
 */
export interface Adds {
	height?: string;
	reverseData?: boolean;
	distributeSeries?: boolean;
	horizontalBars?: boolean;
	axisY?: { offset?: number };
}

const LABEL_WIDTH = 140;

const flatten = (series: ChartistData["series"]) =>
	(series as (number | number[])[]).map((v) => (Array.isArray(v) ? (v[0] ?? 0) : v));

const BarChartCustom: Component<{
	data: ChartistData | null | undefined;
	options?: Adds;
	ref?: Element;
	shown?: Element[];
	removeShown?: (el: Element) => void;
}> = (props) => {
	const [el, setEl] = createSignal<HTMLDivElement>();
	const visible = useLazyReady(el, props);

	const option = createMemo<ChartOption | undefined>(() => {
		const data = props.data;
		if (!data) return undefined;
		const values = flatten(data.series);
		return {
			aria: { enabled: true },
			tooltip: { trigger: "item" },
			// Fixed label column, so every bar chart starts its bars at the same x.
			grid: { left: LABEL_WIDTH + 12, right: 40, top: 8, bottom: 24, outerBoundsMode: "none" },
			xAxis: {
				type: "value",
				minInterval: 1,
				axisLabel: { color: "#000" },
				splitLine: { lineStyle: { color: "rgba(0, 0, 0, 0.2)", type: "dashed" } },
			},
			yAxis: {
				type: "category",
				data: data.labels,
				inverse: !!props.options?.reverseData,
				axisTick: { show: false },
				axisLabel: { color: "#000", fontSize: 14, width: LABEL_WIDTH, overflow: "break" },
			},
			series: [
				{
					type: "bar",
					barMaxWidth: 48,
					data: values.map((value, i) => ({ value, itemStyle: { color: chartColor(i) } })),
					label: { show: true, position: "right", color: "#000" },
				},
			],
		};
	});

	createChart(el, () => visible() && !!props.data, option);

	return (
		<Show when={props.data}>
			<div class="flex w-full flex-col items-center justify-center">
				<div
					ref={mergeRefs(props.ref, (node: Element) => setEl(node as HTMLDivElement))}
					class="h-64 w-full lg:w-11/12"
					classList={{
						"h-[350px]": (props.data?.labels?.length ?? 0) > 2,
						"h-[450px]": (props.data?.labels?.length ?? 0) > 3,
						"h-[550px]": (props.data?.labels?.length ?? 0) > 4,
					}}
				/>
			</div>
		</Show>
	);
};

export default BarChartCustom;
