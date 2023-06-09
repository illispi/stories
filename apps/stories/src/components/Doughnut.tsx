import { Component } from "solid-js";
import { ChartistData } from "~/types/types";
import PieChartCustom from "./PieChartCustom";

export const DoughnutComponent: Component<{
  data: ChartistData;
  header: string;
  update?: boolean;
}> = (props) => {


  return (
    <div class="flex flex-col items-center justify-center">
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="mb-4 flex w-11/12 items-center justify-center lg:max-w-xs">
        <PieChartCustom data={props.data} update={props.update} />
      </div>
    </div>
  );
};
