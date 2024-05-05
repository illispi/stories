import { route } from "routes-gen";
import type { Component } from "solid-js";
import InfoBox from "~/components/InfoBox";

const Compare: Component = () => (
  <div class="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
    <h1 class="my-16 text-5xl font-bold lg:mt-48 lg:text-6xl">Comparison</h1>
    <div class="mb-16 flex h-full w-11/12 max-w-screen-2xl flex-col items-center justify-center gap-8 lg:mb-72 lg:flex-row  lg:items-stretch">
      <InfoBox
        header="Compare personal poll results"
        link="Personal compare"
        text="You can see how poll answers differ between genders or schizophrenia and schizoaffective"
        route={route("/compare/:pOrT/:fOrT/compare", {
          fOrT: "real",
          pOrT: "Personal_questions",
        })}
      />
      <div class="flex items-center justify-center">
        <h2 class="rounded-full border-2 border-fuchsia-500 p-12 text-4xl">
          OR
        </h2>
      </div>
      <InfoBox
        header="Compare relatives polls results"
        link="Relative compare"
        text="Compare how poll answers differ between genders or schizophrenia and schizoaffective"
        route={route("/compare/:pOrT/:fOrT/compare", {
          fOrT: "real",
          pOrT: "Their_questions",
        })}
      />
    </div>
  </div>
);

export default Compare;
