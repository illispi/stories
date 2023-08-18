import type { AxisOptions, BarChartOptions } from "chartist";
import { BarChart } from "chartist";
import type { Component } from "solid-js";
import {
  Show,
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  onMount,
} from "solid-js";
import type { ChartistData } from "~/types/types";
import "../styles/index.css";
import { isServer } from "solid-js/web";
import { mergeRefs } from "@solid-primitives/refs";

interface Adds extends BarChartOptions<AxisOptions, AxisOptions> {
  height?: string;
}

const BarChartCustom: Component<{
  data: ChartistData | undefined;
  options?: Adds;
  shown?: Element[];
  removeShown?: (el: Element) => void;
}> = (props) => {
  let bar: BarChart;
  let ref: Element;
  const id = createUniqueId();

  createEffect(() => {
    if (props.shown?.includes(ref) && !bar && props.data) {
      props.removeShown(ref);
      bar = new BarChart(
        `#chartBar${id}`,
        {
          series: props.data?.series,
          labels: props.data?.labels,
        },
        {
          ...props.options,
          width: "100%",
          chartPadding: 25,
          axisX: {
            onlyInteger: true,
          },
          axisY: { offset: 80, scaleMinSpace: 25 },
        } //BUG use mergeProps if you want defaults
      );
    }
    if (props.data && bar) {
      bar.update(props.data);
    }
  });

  onCleanup(() => {
    bar?.detach;
  });

  return (
    <>
      <div class="flex w-full flex-col items-center justify-center">
        <div
          ref={mergeRefs(props.ref, (el) => (ref = el))}
          class={`h-64 w-full ${!props.data ? "hidden" : ""}`}
          classList={{
            "h-[350px]": props.data?.labels.length > 2,
            "h-[450px]": props.data?.labels.length > 3,
            "h-[550px]": props.data?.labels.length > 4,
          }}
          id={`chartBar${id}`}
        />
        <div
          class={`h-80 w-11/12 ${
            props.data ? "hidden" : ""
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
      </div>
    </>
  );
};

export default BarChartCustom;

//NOTE index.css is global but you can get over it with module.css, see start.solidjs.com "styling"
