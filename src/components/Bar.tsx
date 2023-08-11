import type { AxisOptions, BarChartOptions } from "chartist";
import { createSignal, createEffect, Component } from "solid-js";
import type { ChartistData, MainReturn } from "~/types/types";
import BarChartCustom from "./BarChartCustom";
import { useData } from "./globalSignals";
import { selector } from "~/utils/functions";
import { PersonalQuestions } from "~/types/zodFromTypes";

export const BarComponent: Component<{
  options?: BarChartOptions<AxisOptions, AxisOptions>;
  data: MainReturn | undefined;
  header: string;
  stat: keyof PersonalQuestions;
  function:
    | "dataSelection"
    | "dataOnset"
    | "dataGender"
    | "dataAgeOfRes"
    | "dataMultiSelect"
    | "weightBrackets";
}> = (props) => {
  return (
    <div class="flex flex-col items-center justify-center">
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="mb-4 w-11/12">
        <BarChartCustom
        {...props}
          data={selector(props.function, props.data?.[props.stat])}
          options={props.options}
        />
      </div>
    </div>
  );
};
