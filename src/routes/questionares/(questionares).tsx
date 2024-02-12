import { route } from "routes-gen";
import type { Component } from "solid-js";
import InfoBox from "~/components/InfoBox";

const Polls: Component = () => (
  <div class="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 lg:shadow-[inset_0px_0px_200px_rgba(0,0,0,0.9)] lg:shadow-blue-300">
    <h1 class="my-16 text-5xl font-bold lg:mt-48 lg:text-6xl">Polls</h1>
    <div class="mb-16 flex h-full w-11/12 max-w-screen-2xl flex-col items-center justify-center gap-8 lg:mb-72 lg:flex-row  lg:items-stretch">
      <InfoBox
        header="Poll for people with schizophrenia"
        link="Personal poll"
        text="Answer various questions about your experience about schizophrenia. Estimated completion time is 12 minutes"
        route={route("/questionares/:personalQuestions", {
          personalQuestions: "personalQuestions",
        })}
      />
      <div class="flex items-center justify-center">
        <h2 class="rounded-full border-2 border-fuchsia-500 p-12 text-4xl">
          OR
        </h2>
      </div>
      <InfoBox
        header="Poll for relatives or someone familiar with people with schizophrenia"
        link="Relative poll"
        text="Answer questions about schizophrenics relatives perspective. Estimated completion time is 7 minutes"
        route={route("/questionares/:personalQuestions", {
          personalQuestions: "theirQuestions",
        })}
      />
    </div>
  </div>
);

export default Polls;
