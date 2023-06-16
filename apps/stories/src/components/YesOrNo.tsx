import { Component, Show, createEffect, createSignal } from "solid-js";
import { MainReturn } from "~/types/types";
import { PersonalQuestions } from "~/types/zodFromTypes";
import PieChartCustom from "./PieChartCustom";
import { useData } from "./globalSignals";

export const YesOrNoComponent: Component<{
  stat: keyof MainReturn;
  header: string;
  data?: "A" | "B";
}> = (props) => {
  const { dataA, dataB, data } = useData();

  const [questionData, setQuestionData] = createSignal(null);

  //NOTE below might not be reactive since data is data[ojetfj] aint signal

  createEffect(() => {
    if ((dataA() && dataB()) || data()) {
      if (props.data) {
        if (props.data === "A") setQuestionData(dataA()[props.stat]);
        else if (props.data === "B") setQuestionData(dataB()[props.stat]);
      } else {
        setQuestionData(data()[props.stat]);
      }
    }
  });

  return (
    <div class="flex flex-col items-center justify-center">
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="mb-4 flex w-11/12 items-center justify-center lg:max-w-xs">
        <PieChartCustom
          data={
            questionData()
              ? {
                  labels: [
                    `Yes ${Math.floor(
                      (questionData().yes /
                        (questionData().yes + questionData().no)) *
                        100
                    )}%`,
                    `No ${Math.floor(
                      (questionData().no /
                        (questionData().yes + questionData().no)) *
                        100
                    )}%`,
                  ],
                  series: [questionData().yes, questionData().no],
                }
              : null
          }
        />
      </div>
    </div>
  );
};
