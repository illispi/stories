import {
  ErrorBoundary,
  For,
  Suspense,
  createEffect,
  createSignal,
} from "solid-js";
import { useParams } from "solid-start";
import CustomButton from "~/components/CustomButton";
import { questions } from "~/data/personalQuestionsArr";
import { textPagination } from "~/server/queries";
import type { PersonalQuestions } from "~/types/zodFromTypes";

const StatsText = () => {
  const params = useParams<{ statsText: keyof PersonalQuestions }>();
  const [page, setPage] = createSignal(0);
  const texts = textPagination(() => ({
    page: page(),
    stat: params.statsText,
  }));

  createEffect(() => {
    console.log((texts.data?.total / (page() + 1)) * 100);
  });

  return (
    <div class="mt-8 flex flex-col items-center justify-center">
      <CustomButton>Filter</CustomButton>
      <Suspense fallback={<div>Loading</div>}>
        <ErrorBoundary
          fallback={(err) => {
            console.log(err);
            return <div>err</div>;
          }}
        >
          <div class="flex w-11/12 max-w-xs flex-col items-center justify-center md:max-w-prose">
            <h4 class="sticky top-12 w-full bg-white py-12 text-center text-xl underline underline-offset-8">{`${
              questions[
                questions.findIndex((e) => params.statsText === e.questionDB)
              ].question
            }`}</h4>

            <For each={texts.data?.stats} fallback={<div>failure</div>}>
              {(stat, i) =>
                stat ? (
                  <div class="flex w-full max-w-xs flex-col items-center justify-center md:max-w-prose ">
                    <h5 class="m-2 my-8 font-bold">{i() + 1}.</h5>
                    <p class="m-8 w-full">{stat?.[params.statsText]}</p>
                    <h3 class="text-sm italic">{`Diagnosis: ${stat.diagnosis}, Gender: ${stat.gender}`}</h3>
                  </div>
                ) : null
              }
            </For>
            <div class="m-16 flex w-full items-center justify-around">
              <CustomButton
                class={page() === 0 ? "hidden" : ""}
                onClick={() => setPage((prev) => (prev === 0 ? 0 : prev - 1))}
              >
                Back
              </CustomButton>
              <h5 class="text-lg font-bold">{`Page: ${page() + 1}/${
                Math.floor(texts.data?.total / 50) + 1
              }`}</h5>

              <CustomButton
                class={
                  texts.data?.total / ((page() + 1) * 100) <= 1 ? "hidden" : ""
                }
                onClick={() =>
                  setPage((prev) =>
                    texts.data?.total / ((prev + 1) * 100) <= 1
                      ? prev
                      : prev + 1
                  )
                }
              >
                Next
              </CustomButton>
            </div>
          </div>
        </ErrorBoundary>
      </Suspense>
    </div>
  );
};

export default StatsText;
//TODO replace suspense with some component
//TODO make backend for stats maybe with infinte pagination and store compare in localstorage if coming from there
//TODO back navigate should remember position, and page shouldnt go to top before exit animation, maybe just have noScroll adn manually scrolltotop on every page
//BUG textarea two small on mobile
