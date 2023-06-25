import { Component, createEffect, createSignal } from "solid-js";
import { ChartistData, MainReturn } from "~/types/types";
import PieChartCustom from "./PieChartCustom";
import { PersonalQuestions } from "zod-types";
import { useData } from "./globalSignals";
import { selector } from "~/utils/functions";

export const DoughnutComponent: Component<{
  data: MainReturn | undefined;
  header: string;
  stat: keyof PersonalQuestions;
  function:
    | "dataSelection"
    | "dataOnset"
    | "dataGender"
    | "dataAgeOfRes"
    | "dataMultiSelect";
}> = (props) => {
  return (
    <div class="flex flex-col items-center justify-center">
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="mb-4 flex w-11/12 items-center justify-center lg:max-w-xs">
        <PieChartCustom
          {...props}
          data={selector(props.function, props.data?.[props.stat])}
        />
      </div>
    </div>
  );
};
