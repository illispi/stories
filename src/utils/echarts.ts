import type { BarSeriesOption, PieSeriesOption } from "echarts/charts";
import { BarChart, PieChart } from "echarts/charts";
import type {
	AriaComponentOption,
	GridComponentOption,
	TooltipComponentOption,
} from "echarts/components";
import { AriaComponent, GridComponent, TooltipComponent } from "echarts/components";
import type { ComposeOption, ECharts } from "echarts/core";
import { init, use } from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";

// Register only what the site uses, so the bundle stays small (tree-shaking).
use([BarChart, PieChart, GridComponent, TooltipComponent, AriaComponent, SVGRenderer]);

export type ChartOption = ComposeOption<
	BarSeriesOption | PieSeriesOption | GridComponentOption | TooltipComponentOption | AriaComponentOption
>;

/** The palette the Chartist charts used (series a, b, c, ...), so the colours stay the same. */
export const CHART_COLORS = [
	"#aab2f7",
	"#f77a9d",
	"#f4c63d",
	"#d17905",
	"#453d3f",
	"#59922b",
	"#0544d3",
	"#6b0392",
	"#e6805e",
	"#dda458",
	"#eacf7d",
	"#86797d",
	"#b2c326",
	"#6188e2",
	"#a748ca",
];

export const chartColor = (index: number) => CHART_COLORS[index % CHART_COLORS.length];

/**
 * Mounts an ECharts instance on `el` once `ready()` is true, keeps it in sync with `option()`,
 * resizes it with its container and disposes it when the component unmounts.
 */
export function createChart(
	el: Accessor<HTMLElement | undefined>,
	ready: Accessor<boolean>,
	option: Accessor<ChartOption | undefined>,
) {
	const [chart, setChart] = createSignal<ECharts>();
	let instance: ECharts | undefined;
	let observer: ResizeObserver | undefined;

	createEffect(() => {
		const target = el();
		if (!target || !ready() || instance) return;
		instance = init(target, null, { renderer: "svg" });
		const created = instance;
		observer = new ResizeObserver(() => created.resize());
		observer.observe(target);
		setChart(instance);
	});

	onCleanup(() => {
		observer?.disconnect();
		instance?.dispose();
	});

	createEffect(() => {
		const current = chart();
		const next = option();
		if (current && next) current.setOption(next);
	});

	return chart;
}
