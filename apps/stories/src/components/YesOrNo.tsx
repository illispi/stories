import { Component, Show, createEffect, createSignal } from "solid-js";
import { MainReturn } from "~/types/types";
import { PersonalQuestions } from "~/types/zodFromTypes";
import PieChartCustom from "./PieChartCustom";
import { useData } from "./globalSignals";

export const YesOrNoComponent: Component<{
  stat: keyof MainReturn;
  header: string;
  data: MainReturn | undefined;
}> = (props) => {
  return (
    <div class="flex flex-col items-center justify-center">
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="mb-4 flex w-11/12 items-center justify-center lg:max-w-xs">
        <PieChartCustom
          data={
            props.data?.[props.stat]
              ? {
                  labels: [
                    `Yes ${Math.floor(
                      (props.data?.[props.stat].yes /
                        (props.data?.[props.stat].yes +
                          props.data?.[props.stat].no)) *
                        100
                    )}%`,
                    `No ${Math.floor(
                      (props.data?.[props.stat].no /
                        (props.data?.[props.stat].yes +
                          props.data?.[props.stat].no)) *
                        100
                    )}%`,
                  ],
                  series: [
                    props.data?.[props.stat].yes,
                    props.data?.[props.stat].no,
                  ],
                }
              : null
          }
        />
      </div>
    </div>
  );
};
