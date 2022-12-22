import { For, Show } from "solid-js";
import { A, useParams, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { questions } from "~/data/personalQuestionsArr";
import { personalStatsGet } from "../api/server";

export function routeData() {
  return createServerData$(() => personalStatsGet());
}

const StatsText = () => {
  const params = useParams();
  const personalStats = useRouteData<typeof routeData>();

  return (
    <Show
      when={
        !personalStats.loading ||
        personalStats.error ||
        questions[questions.findIndex((e) => params.statsText === e.questionDB)]
          ?.questionType === "text"
      }
      fallback={<div>loading</div>}
    >
      <div class="mt-8 flex w-screen flex-col items-center justify-center">
        <div class="flex w-11/12 max-w-xs flex-col items-center justify-center md:max-w-prose">
          <h4 class="m-2 my-8 text-center text-xl underline underline-offset-8">{`${
            questions[
              questions.findIndex((e) => params.statsText === e.questionDB)
            ].question
          }`}</h4>

          <For
            each={personalStats()?.arrayOfData}
            fallback={<div>failure</div>}
          >
            {(stat, i) =>
              stat[params.statsText] ? (
                <div class="flex w-full max-w-xs flex-col items-center justify-center md:max-w-prose ">
                  <h5 class="m-2 my-8 font-bold">{i() + 1}.</h5>
                  <p class="w-full">{stat[params.statsText]}</p>
                </div>
              ) : null
            }
          </For>

          <A href={`/stats`}>
            <div
              class="m-2 my-8 rounded-full bg-blue-500 p-3 font-semibold
          text-white transition-all hover:scale-110 hover:bg-blue-600 active:scale-110 active:bg-blue-600"
            >
              Back to Stats
            </div>
          </A>
        </div>
      </div>
    </Show>
  );
};

export default StatsText;
