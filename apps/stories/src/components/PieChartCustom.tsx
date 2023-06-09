import { PieChart } from "chartist";
import {
  Component,
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { PieCounterProvider, usePieCounter } from "~/components/globalSignals";
import "../styles/index.css";
import type { ChartistData } from "../types/types";

const PieChartCustom: Component<{
  data: ChartistData;
  labels?: boolean;
  update?: boolean;
}> = (props) => {
  let pie: PieChart;
  const colors = ["bg-[#aab2f7]", "bg-[#f77a9d]", "bg-[#f4c63d]"];
  const [count, { increment }] = usePieCounter();

  increment();

  onMount(
    () => {
      pie = new PieChart(
        `#chartPie${count().toString()}`,
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
    }

    // pie.on("created", () =>
    // {})
  );

  // createEffect(() => {
  //   pie.update(props.data);
  // });

  onCleanup(() => {
    pie?.detach;
  });

  return (
    <>
        <div>
          <div class="flex flex-col items-center justify-center">
            <div class="h-64 w-64" id={`chartPie${count().toString()}`} />

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
        </div>
    </>
  );
};

export default PieChartCustom;
