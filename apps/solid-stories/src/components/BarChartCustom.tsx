import type { AxisOptions, BarChartOptions } from "chartist";
import { BarChart } from "chartist";
import type { Component } from "solid-js";
import { onCleanup, onMount } from "solid-js";
import type { ChartistData } from "~/types/types";
import "../styles/index.css";
import { barChartCount, setBarChartCount } from "../globalSignals";

const BarChartCustom: Component<{
  data: ChartistData;
  options?: BarChartOptions<AxisOptions, AxisOptions>;
}> = (props) => {
  let bar: BarChart;
  setBarChartCount(barChartCount() + 1);
  const id = barChartCount().toString(); //NOTE is this good way to do this? whats even the point of onMount?
  onMount(() => {
    bar = new BarChart(
      `#chartBar${id}`,
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
      <div class="h-80 w-96 lg:w-[500px]" id={`chartBar${id}`} />
    </div>
  );
};

export default BarChartCustom;

//NOTE index.css is global but you can get over it with module.css, see start.solidjs.com "styling"
