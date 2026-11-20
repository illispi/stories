import { mergeRefs } from "@solid-primitives/refs";
import { type Component, For, Show, createMemo, createSignal } from "solid-js";
import type { ChartistData } from "~/types/types";
import { type ChartOption, chartColor, createChart } from "~/utils/echarts";
import { useLazyReady } from "~/utils/useLazyReady";

const PieChartCustom: Component<{
	data: ChartistData | null | undefined;
	labels?: boolean;
	shown?: Element[];
	yesOrNo?: boolean;
	ref?: Element;
	removeShown?: (el: Element) => void;
}> = (props) => {
	const [el, setEl] = createSignal<HTMLDivElement>();
	const visible = useLazyReady(el, props);

	const option = createMemo<ChartOption | undefined>(() => {
		const data = props.data;
		if (!data) return undefined;
		const values = data.series as number[];
		return {
			aria: { enabled: true },
			tooltip: { trigger: "item", formatter: "{b}: {c}" },
			series: [
				{
					type: "pie",
					radius: ["45%", "75%"],
					startAngle: 180,
					avoidLabelOverlap: true,
					data: data.labels.map((name, i) => ({
						name,
						value: values[i] ?? 0,
						itemStyle: { color: chartColor(i) },
						label: { show: (values[i] ?? 0) > 0 },
					})),
					label: { color: "#000", fontSize: 14, width: 90, overflow: "break" },
					labelLine: { length: 6, length2: 6 },
				},
			],
		};
	});

	createChart(el, () => visible() && !!props.data, option);

	return (
		<div>
			<div class="flex flex-col items-center justify-center">
				<div
					ref={mergeRefs(props.ref, (node: Element) => setEl(node as HTMLDivElement))}
					class={`h-80 w-80 sm:h-96 sm:w-96 ${!props.data ? "hidden" : ""}`}
				/>
				<div class={`h-56 w-56 ${props.data ? "hidden" : ""} flex items-center justify-center`}>
					<svg
						class="h-16 w-16 animate-spin"
						fill="currentColor"
						stroke-width="0"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 1024 1024"
						height="1em"
						width="1em"
						style="overflow: visible;"
					>
						<path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z" />
					</svg>
				</div>
				<Show when={props.labels}>
					<div>
						<For each={props.data?.labels} fallback={<div>Error</div>}>
							{(label, index) => (
								<div class="flex items-center justify-start">
									<div class="mx-2 h-6 w-6" style={{ "background-color": chartColor(index()) }} />
									<div class="text-sm">{label}</div>
								</div>
							)}
						</For>
					</div>
				</Show>
			</div>
		</div>
	);
};

export default PieChartCustom;
