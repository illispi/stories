import { PieChart } from "chartist";
import { Component, onCleanup, onMount } from "solid-js";
import  type{ ChartistData } from "../types/types";

const PieChartCustom: Component<{ data: ChartistData }> = (
  props
) => {
  let pie: PieChart;
  const id = Math.floor(Math.random() * 100000000).toString();

  onMount(() => {
    pie = new PieChart(
      `#chart${id}`,
      {
        series: props.data.series,
        labels: props.data.labels,
      },
      {
        donut: true,
        donutWidth: 70,
        startAngle: 270,
        showLabel: true,
      }
    );
  });

  onCleanup(() => pie?.detach);

  return <div id={`chart${id}`} class="h-80" />;
};

export default PieChartCustom;
