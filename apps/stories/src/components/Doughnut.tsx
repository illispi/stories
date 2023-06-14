import { Component, createEffect, createSignal } from "solid-js";
import { ChartistData } from "~/types/types";
import PieChartCustom from "./PieChartCustom";
import { PersonalQuestions } from "zod-types";
import { useData } from "./globalSignals";
import { selector } from "~/utils/functions";

export const DoughnutComponent: Component<{
  data?: "A" | "B";
  header: string;
  stat: keyof PersonalQuestions;
  function:
    | "dataSelection"
    | "dataOnset"
    | "dataGender"
    | "dataAgeOfRes"
    | "dataMultiSelect";
}> = (props) => {
  const [dataA, dataB, data] = useData();

  const [chartistData, setChartistData] = createSignal(null);

  createEffect(() => {
    if (props.data) {
      if (props.data === "A")
        setChartistData(selector(props.function, dataA[props.stat]));
      else if (props.data === "B")
        setChartistData(selector(props.function, dataB[props.stat]));
    } else {
      setChartistData(selector(props.function, data[props.stat]));
    }
  });

  return (
    <div class="flex flex-col items-center justify-center">
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="mb-4 flex w-11/12 items-center justify-center lg:max-w-xs">
        <PieChartCustom data={chartistData()} />
      </div>
    </div>
  );
};
