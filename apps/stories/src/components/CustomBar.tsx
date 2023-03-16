import type { AxisOptions, BarChartOptions } from "chartist";
import type { Component } from "solid-js";
import type { ChartistData } from "~/types/types";
import BarChartCustom from "./BarChartCustom";

export const CustomBarComponent: Component<{
  data: ChartistData;
  header: string;
  options?: BarChartOptions<AxisOptions, AxisOptions>;
}> = (props) => {
  return (
    <>
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="mb-4 w-11/12">
        <BarChartCustom data={props.data} options={props.options} />
      </div>
    </>
  );
};
