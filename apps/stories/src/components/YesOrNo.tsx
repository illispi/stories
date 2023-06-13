import { Component, Show, createEffect, createSignal } from "solid-js";
import { MainReturn } from "~/types/types";
import { PersonalQuestions } from "~/types/zodFromTypes";
import PieChartCustom from "./PieChartCustom";

export const YesOrNoComponent: Component<{
  stat: keyof PersonalQuestions;
  header: string;
  data: MainReturn | undefined;
}> = (props) => {
  const [questionData, setQuestionData] = createSignal(null);

  createEffect(() => {
    if (props.data) {
      setQuestionData(props.data[props.stat]);
    } else {
      setQuestionData(null);
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
