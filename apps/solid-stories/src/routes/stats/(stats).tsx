import {
  createContext,
  createEffect,
  createSignal,
  Index,
  Suspense,
  useContext,
} from "solid-js";
import type { ParentComponent, Component } from "solid-js";
import { ErrorBoundary, Show } from "solid-js";
import { A, useRouteData } from "solid-start";
import PieChartCustom from "~/components/PieChartCustom";
import type { ChartistData } from "~/types/types";
import type { PersonalQuestions } from "zod-types";
import BarChartCustom from "~/components/BarChartCustom";
import CustomButton from "~/components/CustomButton";
import { Motion, Presence } from "@motionone/solid";
import { createServerData$ } from "solid-start/server";
import { personalStatsGet } from "~/server/server";
import type { AxisOptions, BarChartOptions } from "chartist";
import CreateUser from "~/components/CreateUser";

type PersonalStats = Awaited<ReturnType<typeof personalStatsGet>>;

export const routeData = () => {
  return createServerData$(() => personalStatsGet());
};
const DataContext = createContext<ReturnType<typeof routeData>>();
const useData = () => {
  return useContext(DataContext);
};

const Item: Component<{ name: string; value: string | number }> = (props) => {
  return (
    <div class="my-3 flex flex-col items-center justify-center">
      <p class="mb-8 text-center text-xl underline underline-offset-8">
        {props.name}
      </p>
      <p class=" mb-4 rounded-full border-2 border-slate-400 p-2 text-center font-semibold">
        {props.value}
      </p>
    </div>
  );
};
const weightBrackets = (data) => {
  const brackets = [
    "0-5kg",
    "6-10kg",
    "11-20kg",
    "21-30kg",
    "31-40kg",
    "41-50kg",
    "51-80kg",
    "81-200kg",
  ];

  return {
    labels: brackets,
    series: (Object.keys(data) as Array<keyof typeof data>).map((e) => data[e]),
  };
};

const dataGender = (data) => {
  const gender = data;
  const total = gender.male + gender.female + gender.other;

  return {
    labels: [
      `Male ${Math.floor((gender.male / total) * 100)}%`,
      `Female ${Math.floor((gender.female / total) * 100)}%`,
      `Other ${Math.floor((gender.other / total) * 100)}%`,
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
      <div class="mb-4 flex w-11/12 items-center justify-center lg:max-w-xs">
        <PieChartCustom data={props.data} />
      </div>
    </>
  );
};

const YesOrNoComponent: Component<{
  stat: keyof PersonalQuestions;
  header: string;
}> = (props) => {
  const personalStats = useData();

  const total =
    personalStats()[props.stat].yes + personalStats()[props.stat].no;

  return (
    <Show when={!personalStats?.loading}>
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="z-10 mb-8 flex max-w-xs items-center justify-center bg-white">
        <PieChartCustom
          data={{
            labels: [
              `Yes ${Math.floor(
                personalStats()[props.stat].yes / (total * 100)
              )}%`,
              `No ${Math.floor(
                personalStats()[props.stat].no / (total * 100)
              )}%`,
            ],
            series: [
              personalStats()[props.stat].yes,
              personalStats()[props.stat].no,
            ],
          }}
        />
      </div>
    </Show>
  );
};

const dataAgeOfRes = (data) => {
  const labelsAgeGroup = [
    "0-9",
    "10-15",
    "16-20",
    "21-25",
    "26-30",
    "31-35",
    "36-80",
  ];

  return {
    labels: labelsAgeGroup,
    series: (Object.keys(data) as Array<keyof typeof data>).map((e) => data[e]),
  };
};
const dataMultiSelect = (data) => {
  const labelsMultiSelect = Object.keys(data);

  const seriesMultiSelect = [];
  for (let i = 0; i < labelsMultiSelect.length; i++) {
    seriesMultiSelect.push(data[labelsMultiSelect[i]]);
  }

  return {
    labels: labelsMultiSelect,
    series: seriesMultiSelect,
  };
};

const dataSelection = (data) => {
  const keys = Object.keys(data);

  let total = 0;

  for (let index = 0; index < keys.length; index++) {
    total += data[keys[index]];
  }

  const series = keys.map((e) => data[e]);

  const labelsPercentage = keys.map(
    (f, i) => `${f} ${Math.floor((series[i] / total) * 100)}%`
  );

  return {
    labels: labelsPercentage,
    series: series,
  };
};

const dataOnset = (data) => {
  const onset = data;
  return {
    labels: ["Male", "Female", "Other"],
    series: [
      [onset.maleAverage, onset.femaleAverage, onset.otherAverage],
      [onset.maleMedian, onset.femaleMedian, onset.otherMedian],
    ],
  };
};

const psyLengthByGender = (data) => {
  const dataPsyLength = {
    labels: ["few days", "few weeks", "few months", "more than 6 months"],
    series: [
      data["few days"],
      data["few weeks"],
      data["few months"],
      data["more than 6 months"],
    ],
  };
  return dataPsyLength;
};
const dataPsyLength = (data) => {
  return {
    labels: ["few days", "few weeks", "few months", "more than 6 months"],
    series: [
      data["few days"],
      data["few weeks"],
      data["few months"],
      data["more than 6 months"],
    ],
  };
};

const CustomBarComponent: Component<{
  data: ChartistData;
  header: string;
  options?: BarChartOptions<AxisOptions, AxisOptions>;
}> = (props) => {
  return (
    <>
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="mb-4 w-11/12">
        <BarChartCustom data={props.data} options={props.options} />
      </div>
    </>
  );
};

const TextComponent: Component<{
  header: string;
  stat: keyof PersonalQuestions;
}> = (props) => {
  const personalStats = useData();

  return (
    <div class="flex w-11/12 max-w-xs flex-col items-center justify-center">
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <Index each={personalStats()[props.stat]}>
        {(stat, i) => (
          <div class="flex w-full max-w-xs flex-col items-center justify-center">
            <h5 class="m-2 font-bold">{i + 1}.</h5>
            <p class="w-full">{stat()}</p>
          </div>
        )}
      </Index>

      <A href={`${props.stat}`}>
        <div
          class="m-2 my-8 rounded-full bg-blue-500 p-3 font-semibold
      text-white transition-all hover:scale-110 hover:bg-blue-600 active:scale-110 active:bg-blue-600"
        >
          Show more
        </div>
      </A>
    </div>
  );
};

const Stats: ParentComponent = () => {
  const personalStats = useRouteData<typeof routeData>();

  //BUG this might need effect in SSR mode, SSR true doesnt seem to work on dev mode, see below console.log(personalStats())

  console.log(personalStats());

  const [byGenderPsyLength, setByGenderPsyLength] = createSignal(false);

  return (
    <DataContext.Provider value={personalStats}>
      <ErrorBoundary fallback={(err) => err}>
        <Suspense fallback={<div>Loading</div>}>
          <Show
            when={
              !personalStats.loading && !personalStats.error && personalStats()
            }
            fallback={<div>loading</div>}
            keyed
          >
            <div class="mt-8 flex w-screen flex-col items-center justify-center">
              <div class="flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 lg:max-w-xl">
                <div class="flex h-16 items-center justify-center bg-blue-300 p-4">
                  <h1 class="text-center font-semibold">Personal Stats</h1>
                </div>
                <div class="flex flex-col items-center justify-center">
                  <div class="z-[5] flex w-full flex-col items-center justify-center bg-white">
                    {
                      <Item
                        name={"Total responses:"}
                        value={`${personalStats()?.total}`}
                      />
                    }
                    <DoughnutComponent
                      header="Share of genders"
                      data={dataGender(personalStats()?.gender)}
                    />
                    <CustomBarComponent
                      header="Age of responses"
                      data={dataAgeOfRes(personalStats()?.current_age)}
                      options={{ distributeSeries: true }}
                    />
                    <CustomBarComponent
                      header="Age of Onset"
                      data={dataOnset(personalStats()?.ageOfOnsetByGender)}
                    />

                    <DoughnutComponent
                      data={dataPsyLength(personalStats()?.length_of_psychosis)}
                      header={"Length of first psychosis"}
                    />

                    <CustomButton
                      onClick={() => {
                        setByGenderPsyLength(!byGenderPsyLength());
                      }}
                    >
                      {`${
                        !byGenderPsyLength()
                          ? "Show by gender"
                          : "Close by gender"
                      }`}
                    </CustomButton>
                  </div>
                  <Presence>
                    <Show when={byGenderPsyLength()}>
                      <Motion.div
                        initial={{ opacity: 0, y: -1200, height: "0px" }}
                        animate={{
                          opacity: 1,
                          height: "1200px",
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          height: "0px",
                          y: -1200,
                        }}
                        transition={{ duration: 1.5 }}
                        class="z-[2] my-4 flex w-full flex-col items-center justify-center rounded-3xl border-2 border-gray-900 bg-gray-100"
                      >
                        <div class=" flex w-full flex-col items-center justify-center lg:max-w-xs">
                          <DoughnutComponent
                            data={psyLengthByGender(
                              personalStats()?.lengthByGender.maleSplit
                            )}
                            header={"First psychosis male"}
                          />

                          <DoughnutComponent
                            data={psyLengthByGender(
                              personalStats()?.lengthByGender.femaleSplit
                            )}
                            header={"First psychosis female"}
                          />

                          <DoughnutComponent
                            data={psyLengthByGender(
                              personalStats()?.lengthByGender.otherSplit
                            )}
                            header={"First psychosis other"}
                          />
                        </div>
                      </Motion.div>
                    </Show>
                  </Presence>
                  <YesOrNoComponent
                    header="Hospitalized on first psychosis"
                    stat={"hospitalized_on_first"}
                  />
                  <YesOrNoComponent
                    header="Were satisfied with hospital care"
                    stat={"hospital_satisfaction"}
                  />
                  <TextComponent
                    stat={"describe_hospital"}
                    header={"Hospital care opinions"}
                  />
                  <YesOrNoComponent
                    header="Recieved care after hospitalization"
                    stat={"care_after_hospital"}
                  />
                  <TextComponent
                    stat={"what_kind_of_care_after"}
                    header={"Care after opinions"}
                  />
                  <YesOrNoComponent
                    header="Were satisifed with after hospitalization care"
                    stat={"after_hospital_satisfaction"}
                  />

                  {/* TODO add psychosis how many, but make it a selection instead of integer in database */}

                  <YesOrNoComponent
                    header="Had prodromal symptoms"
                    stat={"prodromal_symptoms"}
                  />
                  <TextComponent
                    stat={"describe_prodromal_symptoms"}
                    header={"Had these kinds of prodromal symptoms"}
                  />
                  <CustomBarComponent
                    header="First psychosis symptoms"
                    data={dataMultiSelect(
                      personalStats()?.symptoms_hallucinations
                    )}
                    options={{ distributeSeries: true }}
                  />
                  {/* TODO add question to database about describing first psychosis and to here and questionsArray */}
                  <CustomBarComponent
                    header="Primary anti-psychotic"
                    data={dataSelection(personalStats()?.current_med)}
                    options={{
                      distributeSeries: true,
                      horizontalBars: true,
                      axisY: { offset: 70 },
                      reverseData: true,
                      height: "500",
                    }}
                  />
                  <YesOrNoComponent
                    header="Medications helped to psychosis symptoms"
                    stat="efficacy_of_med"
                  />
                  <CustomBarComponent
                    header="Side effects from medication"
                    data={dataMultiSelect(personalStats()?.side_effs_dizziness)}
                    options={{
                      distributeSeries: true,
                      horizontalBars: true,
                      axisY: { offset: 70 },
                    }}
                  />
                  <YesOrNoComponent
                    header="Have quit medication"
                    stat="quitting"
                  />
                  <DoughnutComponent
                    header="Reasons on quitting medication"
                    data={dataSelection(personalStats()?.quitting_why)}
                  />
                  <TextComponent
                    header="Happened after quitting medication"
                    stat="quitting_what_happened"
                  />
                  <YesOrNoComponent
                    header="Regreted quitting medication"
                    stat="quitting_regret"
                  />
                  <YesOrNoComponent
                    header="Have gained weight after medications"
                    stat="gained_weight"
                  />
                  <CustomBarComponent
                    header="Weight gained"
                    data={weightBrackets(personalStats()?.weight_amount)}
                  />
                  <YesOrNoComponent header="Smoking" stat="smoking" />
                  <DoughnutComponent
                    header="Smoking tobacco amount"
                    data={dataSelection(personalStats()?.smoking_amount)}
                  />
                  <YesOrNoComponent
                    header="Has used cannabis"
                    stat="cannabis"
                  />
                  <YesOrNoComponent
                    header="Has had suicidal thoughts"
                    stat="suicidal_thoughts"
                  />
                  <YesOrNoComponent
                    header="Has attempted suicide"
                    stat="suicide_attempts"
                  />
                </div>
              </div>
            </div>
          </Show>
        </Suspense>
      </ErrorBoundary>
    </DataContext.Provider>
  );
};

export default Stats;

//TODO consider grid for bigger screens

//TODO maybe some kind of array could reduce boilerplate in this

//TODO few fields should be multiselect like prodromal and cognitive
