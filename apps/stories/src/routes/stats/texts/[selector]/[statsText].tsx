import { Motion, Presence } from "@motionone/solid";
import { ErrorBoundary, For, Show, Suspense, createSignal } from "solid-js";
import { useParams } from "solid-start";
import CustomButton from "~/components/CustomButton";
import ToggleButton from "~/components/ToggleButton";
import { questions } from "~/data/personalQuestionsArr";
import { textPagination } from "~/server/queries";
import type { PersonalQuestions } from "~/types/zodFromTypes";

const StatsText = () => {
  const params = useParams<{
    statsText: keyof PersonalQuestions;
    selector: "personal" | "their";
  }>();
  const [filter, setFilter] = createSignal(false);
  const [gender, setGender] = createSignal<"Female" | "Other" | "Male" | null>(
    null
  );
  const [diagnosis, setDiagnosis] = createSignal<
    "Schizophrenia" | "Schizoaffective" | null
  >(null);

  const [page, setPage] = createSignal(0);
  const texts = textPagination(() => ({
    page: page(),
    stat: params.statsText,
    diagnosis: diagnosis(),
    gender: gender(),
    personalOrTheir: params.selector,
  }));

  return (
    <div class="mt-8 flex flex-col items-center justify-center">
      <CustomButton onclick={() => setFilter(true)}>Filter</CustomButton>
      <CustomButton
        onclick={() => {
          setGender(null);
          setDiagnosis(null);
        }}
      >
        Clear Filters
      </CustomButton>
      <Presence>
        <Show when={filter()}>
          <Motion.div
            class="relative z-40"
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 0.5, easing: "ease-in-out" }}
            exit={{ opacity: [1, 0] }}
          >
            <div
              onClick={() => {
                setFilter(false);
                document.body.style.overflow = "auto";
              }}
              class="fixed left-0 top-0 flex h-screen w-screen items-center justify-center bg-black opacity-40"
            />

            <div class="absolute flex -translate-x-1/2 flex-col items-center justify-center rounded-3xl border-2 bg-blue-50 p-5 pt-8 opacity-100">
              <div class="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2">
                <CustomButton
                  class="bg-red-600 p-2 text-center hover:bg-red-900 active:bg-red-900"
                  onClick={() => {
                    setFilter(false);
                    document.body.style.overflow = "auto";
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-8 w-8"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </CustomButton>
              </div>
              <div class="flex">
                <ToggleButton
                  onClick={() =>
                    setGender((prev) => (prev === "Male" ? null : "Male"))
                  }
                  toggled={gender() === "Male"}
                >
                  Male
                </ToggleButton>
                <ToggleButton
                  onClick={() =>
                    setGender((prev) => (prev === "Female" ? null : "Female"))
                  }
                  toggled={gender() === "Female"}
                >
                  Female
                </ToggleButton>
                <ToggleButton
                  onClick={() =>
                    setGender((prev) => (prev === "Other" ? null : "Other"))
                  }
                  toggled={gender() === "Other"}
                >
                  Other
                </ToggleButton>
              </div>
              <div class="flex flex-col">
                <ToggleButton
                  onClick={() =>
                    setDiagnosis((prev) =>
                      prev === "Schizophrenia" ? null : "Schizophrenia"
                    )
                  }
                  toggled={diagnosis() === "Schizophrenia"}
                >
                  Schizophrenia
                </ToggleButton>
                <ToggleButton
                  onClick={() =>
                    setDiagnosis((prev) =>
                      prev === "Schizoaffective" ? null : "Schizoaffective"
                    )
                  }
                  toggled={diagnosis() === "Schizoaffective"}
                >
                  Schizoaffective
                </ToggleButton>
              </div>
              <CustomButton
                onClick={() => {
                  setPage(0);
                  setFilter(false);
                  document.body.style.overflow = "auto";
                }}
                class={"bg-green-500 hover:bg-green-600 active:bg-green-600"}
              >
                Filter
              </CustomButton>
            </div>
          </Motion.div>
        </Show>
      </Presence>
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

            <For each={texts.data?.stats} fallback={<div>None found</div>}>
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
                Math.floor(texts.data?.total / 25) + 1
              }`}</h5>

              <CustomButton
                class={
                  texts.data?.total / ((page() + 1) * 25) <= 1 ? "hidden" : ""
                }
                onClick={() =>
                  setPage((prev) =>
                    texts.data?.total / ((prev + 1) * 25) <= 1 ? prev : prev + 1
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
//TODO back navigate should remember position, and page shouldnt go to top before exit animation, maybe just have noScroll adn manually scrolltotop on every page
//TODO only filter after pressing filter in modal, X/offscreen to clear filters and intermediate selection of filters before committing
//TODO scroll to top on page switch
