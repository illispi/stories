import { Motion, Presence } from "@motionone/solid";
import type { Component, ParentComponent } from "solid-js";
import {
  createEffect,
  createSignal,
  ErrorBoundary,
  Index,
  Show,
  Suspense,
} from "solid-js";
import { A } from "solid-start";
import { CustomBarComponent } from "~/components/Bar";
import { CompSelector } from "~/components/CompSelector";
import CustomButton from "~/components/CustomButton";
import { DoughnutComponent } from "~/components/Doughnut";
import { Item } from "~/components/Item";
import { TextComponent } from "~/components/Text";
import { YesOrNoComponent } from "~/components/YesOrNo";
import {
  BarCounterProvider,
  PieCounterProvider,
  useData,
} from "~/components/globalSignals";
import { allSTatsArr, allStatsArr } from "~/data/statsArrays";
import { allStats } from "~/server/queries";
import {
  dataAgeOfRes,
  dataGender,
  dataMultiSelect,
  dataOnset,
  dataSelection,
  weightBrackets,
} from "~/utils/functions";

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
  const { setData } = useData();
  createEffect(() => {
    setData(allStatsPersonal.data);
  });

  const [compOrder, setCompOrder] = createSignal(allStatsArr);

  return (
    <Suspense fallback={<div>Loading</div>}>
      <ErrorBoundary
        fallback={(err) => {
          console.log(err);
          return <div>err</div>;
        }}
      >
        <BarCounterProvider count={0}>
          <PieCounterProvider count={0}>
            <div class="mt-8 flex w-screen flex-col items-center justify-center">
              <div class="flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 md:max-w-xl">
                <div class="flex h-16 items-center justify-center bg-blue-300 p-4">
                  <h1 class="text-center font-semibold">Statistics personal</h1>
                </div>
                <div class="flex flex-col items-center justify-center">
                  <div class="z-[5] flex w-full flex-col items-center justify-center bg-white">
                    <CompareButton />
                    <Index each={compOrder()}>
                      {(comp, i) => <CompSelector {...comp()} />}
                    </Index>
                    <CompareButton />
                  </div>
                </div>
              </div>
            </div>
          </PieCounterProvider>
        </BarCounterProvider>
      </ErrorBoundary>
    </Suspense>
  );
};

export default Stats;

//TODO might want to change ask first if you have told anybody and then who
