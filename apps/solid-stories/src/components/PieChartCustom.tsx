import { PieChart } from "chartist";
import { Component, Show } from "solid-js";
import { For, onCleanup, onMount } from "solid-js";
import type { ChartistData } from "../types/types";
import "../styles/index.css";
import { pieChartCount, setPieChartCount } from "~/globalSignals";

const PieChartCustom: Component<{ data: ChartistData; labels?: boolean }> = (
  props
) => {
  let pie: PieChart;
  const colors = ["bg-[#aab2f7]", "bg-[#f77a9d]", "bg-[#f4c63d]"];
  setPieChartCount(pieChartCount() + 1);
  const id = pieChartCount().toString();

  onMount(() => {
    pie = new PieChart(
      `#chartPie${id}`,
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
      <div class="h-80 w-80" id={`chartPie${id}`} />
      <Show when={props.labels} fallback={null}>
        <div>
          <For each={props.data.labels} fallback={<div>Error</div>}>
            {(label, index) => (
              <div class="flex items-center justify-start">
                <div class={`${colors[index()]} mx-2 h-6 w-6`} />
                <div class="text-sm">{label}</div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

export default PieChartCustom;
