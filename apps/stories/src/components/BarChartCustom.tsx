import type { AxisOptions, BarChartOptions } from "chartist";
import { BarChart } from "chartist";
import type { Component } from "solid-js";
import { Show, createEffect, onCleanup, onMount } from "solid-js";
import type { ChartistData } from "~/types/types";
import "../styles/index.css";

let counter = 0;

interface Adds extends BarChartOptions<AxisOptions, AxisOptions> {
  height?: string;
}

const BarChartCustom: Component<{
  data: ChartistData | undefined;
  options?: Adds;
}> = (props) => {
  let bar: BarChart;
  let elRef: HTMLDivElement;
  let observer: IntersectionObserver;

  counter++;

  const id = counter.toString();

  onMount(() => {
    const options = {
      root: document.querySelector("#scrollArea"),
      rootMargin: "0px",
      threshold: 0.1,
    };

    observer = new IntersectionObserver((entires, observer) => {
      if (!bar && entires[0].isIntersecting) {
        bar = new BarChart(
          `#chartBar${id}`,
          {
            series: props.data?.series ?? [2, 2],
            labels: props.data?.labels ?? ["2", "2"],
          },
          { ...props.options, chartPadding: 30 } //BUG use mergeProps if you want defaults
        );
      }
    }, options);
    observer.observe(elRef);
  });

  createEffect(() => {
    if (props.data && bar) {
      bar.update(props.data);
    }
  });

  onCleanup(() => {
    observer.disconnect();
    bar?.detach;
  });

  return (
    <div>
      <Show
        when={props.options?.height}
        fallback={
          <div class="flex flex-col items-center justify-center">
            <div
              ref={elRef}
              class={`h-80 w-96 lg:w-[500px] ${!props.data ? "hidden" : ""}`}
              id={`chartBar${id}`}
            />
            <div
              class={`h-80 w-96 lg:w-[500px]  ${
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
        }
      >
        <div class="flex flex-col items-center justify-center">
          <div
            ref={elRef}
            class={`h-[${props.options?.height}px] w-96 lg:w-[500px] ${
              !props.data ? "hidden" : ""
            }`}
            id={`chartBar${id}`}
          />

          <div
            class={`h-[${props.options?.height}px] w-96 lg:w-[500px] ${
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
      </Show>
    </div>
  );
};

export default BarChartCustom;

//NOTE index.css is global but you can get over it with module.css, see start.solidjs.com "styling"
