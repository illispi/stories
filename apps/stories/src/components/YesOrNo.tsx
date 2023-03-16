import { Component } from "solid-js";
import { MainReturn } from "~/types/types";
import { PersonalQuestions } from "~/types/zodFromTypes";
import PieChartCustom from "./PieChartCustom";

export const YesOrNoComponent: Component<{
    stat: keyof PersonalQuestions;
    header: string;
    data: MainReturn;
  }> = (props) => {
    const total = props.data[props.stat].yes + props.data[props.stat].no;
  
    return (
      <>
        <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
        <div class="z-10 flex max-w-xs items-center justify-center bg-white">
          <PieChartCustom
            data={{
              labels: [
                `Yes ${Math.floor((props.data[props.stat].yes / total) * 100)}%`,
                `No ${Math.floor((props.data[props.stat].no / total) * 100)}%`,
              ],
              series: [props.data[props.stat].yes, props.data[props.stat].no],
            }}
          />
        </div>
      </>
    );
  };