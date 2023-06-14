import { createEffect, type Component, createSignal } from "solid-js";
import { PersonalQuestions } from "~/types/zodFromTypes";
import { useData } from "./globalSignals";

export const Item: Component<{
  name: string;
  stat: keyof PersonalQuestions;
  data?: "A" | "B";
}> = (props) => {
  const [dataA, dataB, data] = useData();

  const [questionData, setQuestionData] = createSignal(null);

  //NOTE below might not be reactive since data is data[ojetfj] aint signal

  createEffect(() => {
    if (props.data) {
      if (props.data === "A") setQuestionData(dataA[props.stat]);
      else if (props.data === "B") setQuestionData(dataB[props.stat]);
    } else {
      setQuestionData(data[props.stat]);
    }
  });

  return (
    <div class="my-3 flex flex-col items-center justify-center">
      <p class="mb-8 text-center text-xl underline underline-offset-8">
        {props.name}
      </p>
      <p class=" mb-4 rounded-full border-2 border-slate-400 p-2 text-center font-semibold">
        {questionData()}
      </p>
    </div>
  );
};
