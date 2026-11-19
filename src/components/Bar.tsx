import { type Component, Show } from "solid-js";
import type { StatsData } from "~/types/types";
import { selector } from "~/utils/functions";
import BarChartCustom, { type Adds } from "./BarChartCustom";

export const BarComponent: Component<{
  options?: Adds;
  data: StatsData | undefined;
  header: string;
  stat: string;
  function:
    | "dataSelection"
    | "dataOnset"
    | "dataGender"
    | "dataAgeOfRes"
    | "dataMultiSelect"
    | "weightBrackets";
}> = (props) => {
  return (
    <div id={props.header.split(" ").join("")} class="flex w-full flex-col items-center justify-center">
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <Show
        when={props.data}
        fallback={
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
        }
      >
        <BarChartCustom
          {...props}
          data={selector(props.function, props.data?.[props.stat])}
          options={props.options}
        />
      </Show>
    </div>
  );
};
