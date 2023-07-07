import { ErrorBoundary, For, Suspense, createSignal } from "solid-js";
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

            <For each={texts.data} fallback={<div>failure</div>}>
              {(stat, i) =>
                stat ? (
                  <div class="flex w-full max-w-xs flex-col items-center justify-center md:max-w-prose ">
                    <h5 class="m-2 my-8 font-bold">{i() + 1}.</h5>
                    <h3 class="italic">{`Diagnosis: ${stat.diagnosis}, Gender: ${stat.gender}`}</h3>
                    <p class="m-8 w-full">{stat?.[params.statsText]}</p>
                  </div>
                ) : null
              }
            </For>
            <div class="m-16 flex w-full items-center justify-around">
              <CustomButton
                onClick={() => setPage((prev) => (prev === 0 ? 0 : prev - 1))}
              >
                Back
              </CustomButton>
              <h5 class="text-lg font-bold">{`Page: ${page() + 1}`}</h5>

              <CustomButton onClick={() => setPage((prev) => prev + 1)}>
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
//TODO back navigate should remember position
