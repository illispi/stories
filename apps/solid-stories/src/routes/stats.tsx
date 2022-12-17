import type { Component, ParentComponent } from "solid-js";
import { ErrorBoundary, Show } from "solid-js";
import { createRouteData, useRouteData } from "solid-start";

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/src/router";
import type { Db } from "../../../server/src/index";

import PieChartCustom from "~/components/PieChartCustom";
import type { ChartistData } from "~/types/types";
import type { PersonalQuestions } from "zod-types";

type PreventDbTypeAutoDelete = Db; //NOTE this is here because trpc needs type Db from backend for some reason

type RouterInput = inferRouterInputs<AppRouter>;
type RouterOutput = inferRouterOutputs<AppRouter>;

export const routeData = () => {
  return createRouteData(async () => {
    const response = await fetch(
      "http://192.168.50.55:4000/trpc/personalStats"
    );
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
  let genders = { male: 0, female: 0, other: 0, total: 0 };

  data?.forEach((e) => {
    if (e.gender === "male") {
      genders.male++;
      genders.total++;
    } else if (e.gender === "female") {
      genders.female++;
      genders.total++;
    } else if (e.gender === "other") {
      genders.other++;
      genders.total++;
    }
  });
  return genders;
};

const dataGender = (data: RouterOutput["personalStats"]["arrayOfData"]) => {
  const gender = calcGenderShares(data);

  return {
    labels: [
      `Male ${Math.floor((gender.male / gender.total) * 100)}%`,
      `Female ${Math.floor((gender.female / gender.total) * 100)}%`,
      `Other ${Math.floor((gender.other / gender.total) * 100)}%`,
    ],
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

const YesOrNoComponent: Component<{
  data: RouterOutput["personalStats"]["arrayOfData"];
  stat: keyof PersonalQuestions;
  header: string;
}> = (props) => {
  return (
    <>
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="z-10 mb-8 flex max-w-xs items-center justify-center bg-white">
        <PieChartCustom
          data={{
            labels: [
              `Yes ${Math.floor(
                (props.data?.filter((e) => e[props.stat] === true).length /
                  props.data?.filter((e) => e[props.stat]).length) *
                  100
              )}%`,
              `No ${Math.floor(
                (props.data?.filter((e) => e[props.stat] === false).length /
                  props.data?.filter((e) => e[props.stat]).length) *
                  100
              )}%`,
            ],
            series: [
              props.data?.filter((e) => e[props.stat] === true).length,
              props.data?.filter((e) => e[props.stat] === false).length,
            ],
          }}
        />
      </div>
    </>
  );
};

const Stats: ParentComponent = () => {
  const personalStats = useRouteData<typeof routeData>();

  return (
    <ErrorBoundary fallback={(err) => err}>
      <Show
        when={!personalStats.loading || personalStats.error}
        fallback={<div>loading</div>}
      >
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
                <YesOrNoComponent
                  data={personalStats()?.arrayOfData}
                  header="Hospitalized on first psychosis"
                  stat={"hospitalized_on_first"}
                />
                <YesOrNoComponent
                  data={personalStats()?.arrayOfData}
                  header="Were satisfied with hospital care"
                  stat={"hospital_satisfaction"}
                />
                <YesOrNoComponent
                  data={personalStats()?.arrayOfData}
                  header="Recieved care after hospitalization"
                  stat={"care_after_hospital"}
                />
                <YesOrNoComponent
                  data={personalStats()?.arrayOfData}
                  header="Were satisifed with after hospitalization care"
                  stat={"after_hospital_satisfaction"}
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

//TODO consider grid for bigger screens
