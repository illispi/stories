import { BarChart } from "chartist";
import type { Component } from "solid-js";
import { For, onCleanup, onMount } from "solid-js";
import type { ChartistData } from "~/types/types";
import "../styles/index.css";

const BarChartCustom: Component<{ data: ChartistData, distributeSeries: boolean }> = (props) => {
  let bar: BarChart;
  const id = Math.floor(Math.random() * 100000000).toString();

  onMount(() => {
    bar = new BarChart(
      `#chart${id}`,
      {
        series: props.data.series,
        labels: props.data.labels,
      },
      {
        chartPadding: 30,
        distributeSeries: props.distributeSeries,
      }
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
