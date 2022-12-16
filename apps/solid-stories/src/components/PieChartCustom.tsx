import { PieChart } from "chartist";
import { type Component, onCleanup, onMount } from "solid-js";
import  type{ ChartistData } from "../types/types";
import "./index.css";


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

  return <div class="h-80" id={`chart${id}`} />
};

export default PieChartCustom;
