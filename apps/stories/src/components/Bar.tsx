import type { AxisOptions, BarChartOptions } from "chartist";
import { createSignal, type Component, createEffect } from "solid-js";
import type { ChartistData } from "~/types/types";
import BarChartCustom from "./BarChartCustom";
import { useData } from "./globalSignals";
import { selector } from "~/utils/functions";
import { PersonalQuestions } from "~/types/zodFromTypes";

export const BarComponent: Component<{
  options?: BarChartOptions<AxisOptions, AxisOptions>;

  data?: "A" | "B";
  header: string;
  stat: keyof PersonalQuestions;
  function:
    | "dataSelection"
    | "dataOnset"
    | "dataGender"
    | "dataAgeOfRes"
    | "dataMultiSelect"
    | "weightBrackets"
}> = (props) => {
  const {dataA, dataB, data} = useData();

  const [chartistData, setChartistData] = createSignal(null);

  createEffect(() => {

    if((dataA() && dataB()) || data()){
    if (props.data) {
      if (props.data === "A")
        setChartistData(selector(props.function, dataA()[props.stat]));
      else if (props.data === "B")
        setChartistData(selector(props.function, dataB()[props.stat]));
    } else {
      setChartistData(selector(props.function, data()[props.stat]));
    }
  }
  });

  return (
    <div class="flex flex-col items-center justify-center">
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="mb-4 w-11/12">
        <BarChartCustom data={chartistData()} options={props.options} />
      </div>
    </div>
  );
};
