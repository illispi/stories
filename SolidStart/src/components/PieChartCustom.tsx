import { mergeRefs } from "@solid-primitives/refs";
import { PieChart } from "chartist";
import {
  Component,
  createEffect,
  createUniqueId,
  For,
  onCleanup,
  Show,
} from "solid-js";
import "../styles/index.css";
import type { ChartistData } from "../types/types";

//BUG currently everytime trigger changes your run cEff on all components

const PieChartCustom: Component<{
  data: ChartistData | null;
  labels?: boolean;
  shown?: Element[];
  yesOrNo?: boolean;
  ref?: Element;
  removeShown?: (el: Element) => void;
}> = (props) => {
  let pie: PieChart;

  const colors = ["bg-[#aab2f7]", "bg-[#f77a9d]", "bg-[#f4c63d]"];

  const id = createUniqueId();

  let ref: Element;

  // pie.on("created", () =>
  // {})

  createEffect(() => {
    if (!pie && props.shown?.includes(ref) && props.data) {
      props.removeShown(ref);
      pie = new PieChart(
        `#chartPie${id}`,
        {
          series: props.data?.series,
          labels: props.data?.labels,
        },
        {
          donut: true,
          donutWidth: 50,
          startAngle: 270,
          showLabel: true,
          chartPadding: 30,
          labelPosition: "outside",
        }
      );
    }

    if (props.data && pie) {
      pie.update(props.data);
    }
    
  });

  onCleanup(() => {
    pie?.detach;
  });

  return (
    <div>
      <div class="flex flex-col items-center justify-center">
        <div
          ref={mergeRefs(props.ref, (el) => (ref = el))}
          class={`h-56 w-56 ${!props.data ? `hidden` : ""}`}
          id={`chartPie${id}`}
        />
        <div
          class={`h-56 w-56 ${
            props.data ? `hidden` : ""
          } flex items-center justify-center`}
        >
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
            <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path>
          </svg>
        </div>
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
  );
};

export default PieChartCustom;
