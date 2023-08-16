import { route } from "routes-gen";
import type { Component, ParentComponent } from "solid-js";
import {
  ErrorBoundary,
  For,
  Show,
  Suspense,
  createRenderEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { A, useParams } from "solid-start";
import { CompSelector } from "~/components/CompSelector";
import CustomButton from "~/components/CustomButton";
import { allStatsPersonalArr } from "~/data/stats/allStatsArr";
import { allStatsTheirArr } from "~/data/stats/allStatsTheir";
import { allStats } from "~/server/basic/queries";

const CompareButton: Component = () => {
  const params = useParams<{
    pOrT: "Personal_questions" | "Their_questions";
    fOrR: "real" | "fake";
  }>();
  return (
    <div class="m-6 flex flex-col items-center justify-between rounded-3xl border-2 border-gray-300 bg-gray-100 p-6">
      <A
        noScroll={true}
        href={route("/compare/:pOrT/:fOrT/compare", {
          pOrT: params.pOrT,
          fOrT: params.fOrR,
        })}
      >
        <CustomButton
          class="m-2 rounded-full bg-blue-500 p-5
      font-semibold text-white transition-all  hover:scale-110
    hover:bg-blue-600 active:scale-110 active:bg-blue-600"
        >
          Compare
        </CustomButton>
      </A>
      <div class="m-2" />
      <p>Allows to compare statistics between genders and diagnosis</p>
    </div>
  );
};

const AllStatsPage: ParentComponent = () => {
  const params = useParams<{
    pOrT: "Personal_questions" | "Their_questions";
    fOrT: "fake" | "real";
  }>();

  const allStatsData = allStats(
    () => ({
      value: "all",
      pOrT: params.pOrT,
      fake: params.fOrT,
    }),
    () => ({
      placeholderData: (prev) => prev,
    })
  );

  const compOrder =
    params.pOrT === "Personal_questions"
      ? allStatsPersonalArr
      : allStatsTheirArr;

  const selector = params.pOrT === "Personal_questions" ? "personal" : "their";

  const [shown, setShown] = createSignal<Element[]>([]);
  const [targets, setTargets] = createSignal<Element[]>([]);

  const removeShown = (el: Element) => {
    const index = shown().indexOf(el);
    if (index > -1) {
      setShown(() => shown().splice(index, 1));
    }
  };

  onMount(() => {
    const options = {
      root: document.querySelector("#scrollArea"),
      rootMargin: "0px",
      threshold: 0.01,
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setShown((els) => [...els, entry.target]);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    targets()?.forEach((el) => {
      observer.observe(el);
    });

    onCleanup(() => {
      observer.disconnect();
    });
  });

  return (
    <div class="flex h-full w-full flex-col items-center justify-center bg-slate-100 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
      {/* <Suspense fallback={<div>Loading</div>}>
        <ErrorBoundary
          fallback={(err) => {
            console.log(err);
            return <div>err</div>;
          }}
        > */}
      <Show
        when={allStatsData.data?.total >= 5}
        fallback={
          <div class="my-32 flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:my-64 lg:p-16">
            <h2 class="text-center text-2xl font-bold lg:text-3xl">
              {`${allStatsData.data?.total}/5`}
            </h2>
            <p class="text-center text-lg">
              Poll needs to be done by at least 5 people
            </p>
            <A
              class="rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
              href={route("/questionares/:personalQuestions", {
                personalQuestions:
                  params.pOrT === "Personal_questions"
                    ? "personalQuestions"
                    : "theirQuestions",
              })}
            >
              Do the poll now
            </A>
            <A
              class="rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
              href={route("/pollResults/:pOrT/:fOrT/pollResults", {
                fOrT: "fake",
                pOrT: params.pOrT,
              })}
            >
              View results with fake data
            </A>
          </div>
        }
      >
        <div class="my-32 flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 md:max-w-xl">
          <div class="flex h-16 items-center justify-center bg-blue-300 p-4">
            <h1 class="text-center font-semibold">Statistics personal</h1>
          </div>
          <div class="flex flex-col items-center justify-center">
            <div class="z-[5] flex w-full flex-col items-center justify-center bg-white">
              {/* <Suspense fallback={<div>Loading</div>}>
                    <ErrorBoundary
                      fallback={(err) => {
                        console.log(err);
                        return <div>err</div>;
                      }}
                    > */}
              <CompareButton />
              <For each={compOrder}>
                {(comp) => (
                  <CompSelector
                    {...comp}
                    data={allStatsData.data}
                    ref={(el: Element) => setTargets((p) => [...p, el])}
                    shown={shown()}
                    removeShown={removeShown}
                    selector={selector}
                  />
                )}
              </For>
              <CompareButton />
              {/* </ErrorBoundary>
                  </Suspense> */}
            </div>
          </div>
        </div>
      </Show>
      {/* </ErrorBoundary>
      </Suspense> */}
    </div>
  );
};

export default AllStatsPage;

//TODO might want to change ask first if you have told anybody and then who
//TODO what_others_Should_know and not_have_schizophrenia_description need custom logic in text to show yes and no separately, backend solution might be good
