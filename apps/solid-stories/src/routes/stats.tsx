import { Component, createEffect, ErrorBoundary, For, ParentComponent, Show } from "solid-js";
import { createRouteData, useRouteData } from "solid-start";

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/src/router";
import type { Db } from "../../../server/src/index";

import "chartist/dist/index.css";
import { PieChart } from "chartist";
import PieChartCustom from "~/components/PieChartCustom";
import { ChartistData } from "~/types/types";

type PreventDbTypeAutoDelete = Db; //NOTE this is here because trpc needs type Db from backend for some reason

type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export const routeData = () => {
  return createRouteData(async () => {
    const response = await fetch("http://127.0.0.1:4000/trpc/personalStats");
    const allData = await response.json();
    const queryData = allData.result.data as RouterOutput["personalStats"];
    return queryData;
  });
};

const Item: Component<{ name: string; value: string | number }> = (props) => {
  return (
    <div class="my-3 flex flex-col items-center justify-center">
      <p class="mb-2 text-center text-xl underline underline-offset-8">
        {props.name}{" "}
      </p>
      <p class="rounded-full border-2 border-slate-400 p-2 text-center font-semibold">
        {props.value}
      </p>
    </div>
  );
};

const calcGenderShares = (
  data: RouterOutput["personalStats"]["arrayOfData"] | undefined
) => {
  let genders = { male: 0, female: 0, other: 0 };

  data?.forEach((e) => {
    if (e.gender === "male") {
      genders.male++;
    } else if (e.gender === "female") {
      genders.female++;
    } else if (e.gender === "other") {
      genders.other++;
    }
  });
  return genders;
};

const dataGender = (data: RouterOutput["personalStats"]["arrayOfData"]) => {
  const gender = calcGenderShares(data);

  return {
    labels: ["Male", "Female", "Other"],
    series: [gender.male, gender.female, gender.other],
  };
};

const DoughnutComponent: Component<{
  data: ChartistData;
  header: string;
}> = (props) => {
  return (
    <>
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="mb-8 flex w-11/12 items-center justify-center lg:max-w-xs">
        <PieChartCustom data={props.data} />
      </div>
    </>
  );
};

const Stats: ParentComponent = () => {
  const personalStats = useRouteData<typeof routeData>();

  return (
    <ErrorBoundary fallback={err => err}>
    <Show when={!personalStats.loading || personalStats.error} fallback={<div>loading</div>}>
      <div class="mt-8 flex w-screen flex-col items-center justify-center">
        <div class="flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 lg:max-w-xl">
          <div class="flex h-16 items-center justify-center bg-blue-300 p-4">
            <h1 class="text-center font-semibold">Personal Stats</h1>
          </div>
          <div class="flex flex-col items-center justify-center">
            <div class="z-[5] flex w-full flex-col items-center justify-center bg-white">
              <Item
                name={"Total responses:"}
                value={`${personalStats()?.arrayOfData.length}`}
              />
              <DoughnutComponent
                header="Share of genders"
                data={dataGender(personalStats()?.arrayOfData)}
              />
            </div>
          </div>
        </div>
      </div>
    </Show>
    </ErrorBoundary>
  );
};

export default Stats;
