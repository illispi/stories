import type { Component, ParentComponent } from "solid-js";
import {
  ErrorBoundary,
  For,
  Index,
  Suspense,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { A } from "solid-start";
import { CompSelector } from "~/components/CompSelector";
import CustomButton from "~/components/CustomButton";
import { allStatsArr } from "~/data/statsArrays";
import { allStats } from "~/server/queries";

const CompareButton: Component = () => {
  return (
    <div class="m-6 flex flex-col items-center justify-between rounded-3xl border-2 border-gray-300 bg-gray-100 p-6">
      <A href={"compare"}>
        <CustomButton
          class="m-2 rounded-full bg-blue-500 p-5
      font-semibold text-white transition-all  hover:scale-110
    hover:bg-blue-600 active:scale-110 active:bg-blue-600"
        >
          Compare
        </CustomButton>
      </A>
      <div class="m-2" />
      <p>Allows to compare statistics between genders and diagonosis</p>
    </div>
  );
};

const Stats: ParentComponent = () => {
  const allStatsPersonal = allStats({ value: "all" });

  const [compOrder, setCompOrder] = createSignal(allStatsArr);

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
    <div class="mt-8 flex  flex-col items-center justify-center">
      <div class="flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 md:max-w-xl">
        <div class="flex h-16 items-center justify-center bg-blue-300 p-4">
          <h1 class="text-center font-semibold">Statistics personal</h1>
        </div>
        <div class="flex flex-col items-center justify-center">
          <div class="z-[5] flex w-full flex-col items-center justify-center bg-white">
            <Suspense fallback={<div>Loading</div>}>
              <ErrorBoundary
                fallback={(err) => {
                  console.log(err);
                  return <div>err</div>;
                }}
              >
                <CompareButton />
                <For each={compOrder()}>
                  {(comp, i) => (
                    <CompSelector
                      {...comp}
                      data={allStatsPersonal.data}
                      ref={(el: Element) => setTargets((p) => [...p, el])}
                      shown={shown()}
                      removeShown={removeShown}
                    />
                  )}
                </For>
                <CompareButton />
              </ErrorBoundary>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;

//TODO might want to change ask first if you have told anybody and then who
//TODO what_others_Should_know and not_have_schizophrenia_description need custom logic in text to show yes and no separately, backend solution might be good
