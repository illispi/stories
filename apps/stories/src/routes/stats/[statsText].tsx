import { ErrorBoundary, For, Suspense } from "solid-js";
import { A, useParams } from "solid-start";
import { questions } from "~/data/personalQuestionsArr";
import { allStats } from "~/server/queries";
import type { PersonalQuestions } from "~/types/zodFromTypes";

const StatsText = () => {
  const params = useParams<{ statsText: keyof PersonalQuestions }>();
  const allStatsPersonal = allStats({ value: "all" });

  return (
    <div class="mt-8 flex flex-col items-center justify-center">
      <A noScroll={true} href={`/stats`}>
        <div
          class="m-2 my-8 rounded-full bg-blue-500 p-3 font-semibold
          text-white transition-all hover:scale-110 hover:bg-blue-600 active:scale-110 active:bg-blue-600"
        >
          Back to Stats
        </div>
      </A>
      <Suspense fallback={<div>Loading</div>}>
        <ErrorBoundary
          fallback={(err) => {
            console.log(err);
            return <div>err</div>;
          }}
        >
          <div class="flex w-11/12 max-w-xs flex-col items-center justify-center md:max-w-prose">
            <h4 class="m-2 my-8 text-center text-xl underline underline-offset-8">{`${
              questions[
                questions.findIndex((e) => params.statsText === e.questionDB)
              ].question
            }`}</h4>

            <For
              each={allStatsPersonal.data?.[params.statsText]}
              fallback={<div>failure</div>}
            >
              {(stat, i) =>
                stat ? (
                  <div class="flex w-full max-w-xs flex-col items-center justify-center md:max-w-prose ">
                    <h5 class="m-2 my-8 font-bold">{i() + 1}.</h5>
                    <p class="w-full">{stat}</p>
                  </div>
                ) : null
              }
            </For>
          </div>
        </ErrorBoundary>
      </Suspense>
      <A noScroll={true} href={`/stats`}>
        <div
          class="m-2 my-8 rounded-full bg-blue-500 p-3 font-semibold
          text-white transition-all hover:scale-110 hover:bg-blue-600 active:scale-110 active:bg-blue-600"
        >
          Back to Stats
        </div>
      </A>
    </div>
  );
};

export default StatsText;
//TODO replace suspense with some component
//TODO make backend for stats maybe with infinte pagination and store compare in localstorage if coming from there
