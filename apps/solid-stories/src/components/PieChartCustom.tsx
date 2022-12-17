import { PieChart } from "chartist";
import type { Component } from "solid-js";
import { For, onCleanup, onMount } from "solid-js";
import type { ChartistData } from "../types/types";
import "../styles/index.css";

const PieChartCustom: Component<{ data: ChartistData }> = (props) => {
  let pie: PieChart;
  const id = Math.floor(Math.random() * 100000000).toString();
  const colors = ["bg-[#aab2f7]", "bg-[#f77a9d]", "bg-[#f4c63d]"];

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
        chartPadding: 30,
        labelPosition: "outside",
      }
    );
  });

  onCleanup(() => pie?.detach);

  return (
    <div class="flex flex-col items-center justify-center">
      <div class="h-80 w-80" id={`chart${id}`} />
      <div>
        <For each={props.data.labels} fallback={<div>Error</div>}>
          {(label, index) => (
            <div class="flex items-center justify-left">
              <div class={`${colors[index()]} w-6 h-6 mx-2`} />
              <div class="text-sm">{label}</div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default PieChartCustom;
