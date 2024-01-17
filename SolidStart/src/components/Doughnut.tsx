import { Component, Show } from "solid-js";
import { PersonalQuestions } from "zod-types";
import { MainReturn } from "~/types/types";
import { selector } from "~/utils/functions";
import PieChartCustom from "./PieChartCustom";

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
        <Show
          when={props.data}
          fallback={
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
          }
        >
          <PieChartCustom
            {...props}
            data={selector(props.function, props.data?.[props.stat])}
          />
        </Show>
      </div>
    </div>
  );
};
