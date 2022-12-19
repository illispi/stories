import type { AxisOptions, BarChartOptions } from "chartist";
import { BarChart } from "chartist";
import type { Component } from "solid-js";
import { onCleanup, onMount } from "solid-js";
import type { ChartistData } from "~/types/types";
import "../styles/index.css";

const BarChartCustom: Component<{
  data: ChartistData;
  options?: BarChartOptions<AxisOptions, AxisOptions>;
}> = (props) => {
  let bar: BarChart;
  const id = Math.floor(Math.random() * 100000000).toString();

  onMount(() => {
    bar = new BarChart(
      `#chart${id}`,
      {
        series: props.data.series,
        labels: props.data.labels,
      },
      { ...props.options, chartPadding: 30 } //BUG use mergeProps if you want defaults
    );
  });

  onCleanup(() => bar?.detach);

  return (
    <div class="flex flex-col items-center justify-center">
      <div class="h-80 w-96 lg:w-[500px]" id={`chart${id}`} />
    </div>
  );
};

export default BarChartCustom;

//NOTE index.css is global but you can get over it with module.css, see start.solidjs.com "styling"
