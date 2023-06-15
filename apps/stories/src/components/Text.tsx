import { Component, Index, Show, createEffect, createSignal } from "solid-js";
import { A } from "solid-start";

import { MainReturn } from "~/types/types";
import { PersonalQuestions } from "~/types/zodFromTypes";
import { useData } from "./globalSignals";

export const TextComponent: Component<{
  header: string;
  stat: keyof PersonalQuestions;
  data?: "A" | "B";
}> = (props) => {
  const { dataA, dataB, data } = useData();

  const [questionData, setQuestionData] = createSignal(null);

  //NOTE below might not be reactive since data is data[ojetfj] aint signal

  createEffect(() => {
    if ((dataA() && dataB()) || data()) {
      if (props.data) {
        if (props.data === "A") setQuestionData(dataA[props.stat]);
        else if (props.data === "B") setQuestionData(dataB[props.stat]);
      } else {
        setQuestionData(data[props.stat]);
      }
    }
  });

  return (
    <Show when={questionData()}>
      <Show when={questionData().length > 0} fallback={<div>failure</div>}>
        <div class="flex w-11/12 max-w-xs flex-col items-center justify-center">
          <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
          <Index each={questionData()}>
            {(stat, i) => (
              <div class="flex w-full max-w-xs flex-col items-center justify-center">
                <h5 class="m-2 font-bold">{i + 1}.</h5>
                <p class="w-full">{stat()}</p>
              </div>
            )}
          </Index>

          <A href={`${props.stat}`}>
            <div
              class="m-2 my-8 rounded-full bg-blue-500 p-3 font-semibold
        text-white transition-all hover:scale-110 hover:bg-blue-600 active:scale-110 active:bg-blue-600"
            >
              Show more
            </div>
          </A>
        </div>
      </Show>
    </Show>
  );
};
