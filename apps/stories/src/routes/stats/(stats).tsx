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
import { A } from "solid-start";
import PieChartCustom from "~/components/PieChartCustom";
import type { ChartistData, MainReturn } from "~/types/types";
import type { PersonalQuestions } from "zod-types";
import BarChartCustom from "~/components/BarChartCustom";
import CustomButton from "~/components/CustomButton";
import { Motion, Presence } from "@motionone/solid";
import type { AxisOptions, BarChartOptions } from "chartist";
import { allStats } from "~/server/queries";
import type { CreateQueryResult } from "@tanstack/solid-query";

const DataContext = createContext<CreateQueryResult<MainReturn, Error>>();
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
const weightBrackets = (data: MainReturn["weight_amount"]) => {
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

const dataGender = (data: MainReturn["gender"]) => {
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
    personalStats?.data[props.stat].yes + personalStats?.data[props.stat].no;

  return (
    <>
      <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
      <div class="z-10 flex max-w-xs items-center justify-center bg-white">
        <PieChartCustom
          data={{
            labels: [
              `Yes ${Math.floor(
                (personalStats.data[props.stat].yes / total) * 100
              )}%`,
              `No ${Math.floor(
                (personalStats.data[props.stat].no / total) * 100
              )}%`,
            ],
            series: [
              personalStats.data[props.stat].yes,
              personalStats.data[props.stat].no,
            ],
          }}
        />
      </div>
    </>
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
  const keysBeforePruning = Object.keys(data);

  const keys = keysBeforePruning.filter((e) => data[e] !== 0);

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

const dataOnset = (data: MainReturn["ageOfOnsetByGender"]) => {
  const onset = data;
  return {
    labels: ["Male", "Female", "Other"],
    series: [
      [onset.maleAverage, onset.femaleAverage, onset.otherAverage],
      [onset.maleMedian, onset.femaleMedian, onset.otherMedian],
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
    <Show
      when={personalStats?.data[props.stat].length > 0}
      fallback={<div>failure</div>}
    >
      <div class="flex w-11/12 max-w-xs flex-col items-center justify-center">
        <h4 class="m-2 text-center text-xl underline underline-offset-8">{`${props.header}:`}</h4>
        <Index each={personalStats?.data[props.stat]}>
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
    </Show>
  );
};

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

  const [byGenderPsyLength, setByGenderPsyLength] = createSignal(false);

  return (
    <DataContext.Provider value={allStatsPersonal}>
      <ErrorBoundary fallback={(err) => err}>
        <Suspense fallback={<div>Loading</div>}>
          <Show
            when={allStatsPersonal.data?.total}
            fallback={<div>loading</div>}
            keyed
          >
            <div class="mt-8 flex w-screen flex-col items-center justify-center">
              <div class="flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 md:max-w-xl">
                <div class="flex h-16 items-center justify-center bg-blue-300 p-4">
                  <h1 class="text-center font-semibold">Statistics personal</h1>
                </div>
                <div class="flex flex-col items-center justify-center">
                  <div class="z-[5] flex w-full flex-col items-center justify-center bg-white">
                    <CompareButton />
                    {
                      <Item
                        name={"Total responses:"}
                        value={`${allStatsPersonal.data?.total}`}
                      />
                    }

                    <DoughnutComponent
                      header="Share of diagnosis"
                      data={dataSelection(allStatsPersonal.data?.diagnosis)}
                    />
                    <DoughnutComponent
                      header="Share of genders"
                      data={dataGender(allStatsPersonal.data?.gender)}
                    />
                    <CustomBarComponent
                      header="Age of responses"
                      data={dataAgeOfRes(allStatsPersonal.data?.current_age)}
                      options={{ distributeSeries: true }}
                    />
                    <CustomBarComponent
                      header="Age of Onset"
                      data={dataOnset(
                        allStatsPersonal.data?.ageOfOnsetByGender
                      )}
                    />

                    <DoughnutComponent
                      data={dataSelection(
                        allStatsPersonal.data?.length_of_psychosis
                      )}
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
                            data={dataSelection(
                              allStatsPersonal.data?.lengthByGender.maleSplit
                            )}
                            header={"First psychosis male"}
                          />

                          <DoughnutComponent
                            data={dataSelection(
                              allStatsPersonal.data?.lengthByGender.femaleSplit
                            )}
                            header={"First psychosis female"}
                          />

                          <DoughnutComponent
                            data={dataSelection(
                              allStatsPersonal.data?.lengthByGender.otherSplit
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
                  <CustomBarComponent
                    header="How many psychosis"
                    data={dataSelection(
                      allStatsPersonal.data?.psychosis_how_many
                    )}
                    options={{
                      distributeSeries: true,
                      horizontalBars: true,
                      axisY: { offset: 80 },
                    }}
                  />
                  <YesOrNoComponent
                    header="Had prodromal symptoms"
                    stat={"prodromal_symptoms"}
                  />
                  <CustomBarComponent
                    header="Prodromal symptoms"
                    data={dataMultiSelect(
                      allStatsPersonal.data?.prodromal_anxiety
                    )}
                    options={{
                      distributeSeries: true,
                      horizontalBars: true,
                      axisY: { offset: 80 },
                    }}
                  />
                  <CustomBarComponent
                    header="First psychosis symptoms"
                    data={dataMultiSelect(
                      allStatsPersonal.data?.symptoms_hallucinations
                    )}
                    options={{
                      distributeSeries: true,
                      horizontalBars: true,
                      axisY: { offset: 80 },
                    }}
                  />

                  <CustomBarComponent
                    header="Primary anti-psychotic"
                    data={dataSelection(allStatsPersonal.data?.current_med)}
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
                    data={dataMultiSelect(
                      allStatsPersonal.data?.side_effs_dizziness
                    )}
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
                    data={dataSelection(allStatsPersonal.data?.quitting_why)}
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
                    data={weightBrackets(allStatsPersonal.data?.weight_amount)}
                    options={{ distributeSeries: true }}
                  />
                  <YesOrNoComponent header="Smoking" stat="smoking" />
                  <DoughnutComponent
                    header="Smoking tobacco amount"
                    data={dataSelection(allStatsPersonal.data?.smoking_amount)}
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
                  <YesOrNoComponent
                    header="Has negative symptoms"
                    stat="negative_symptoms"
                  />
                  <CustomBarComponent
                    header="Negative symptoms"
                    data={dataMultiSelect(
                      allStatsPersonal.data?.flat_expressions
                    )}
                    options={{
                      distributeSeries: true,
                      horizontalBars: true,
                      axisY: { offset: 80 },
                    }}
                  />
                  <YesOrNoComponent
                    header="Has cognitive symptoms"
                    stat="cognitive_symptoms"
                  />
                  <CustomBarComponent
                    header="Cognitive symptoms"
                    data={dataMultiSelect(
                      allStatsPersonal.data?.disorganized_thinking
                    )}
                    options={{
                      distributeSeries: true,
                      horizontalBars: true,
                      axisY: { offset: 80 },
                    }}
                  />
                  <TextComponent
                    header="Personality before illness"
                    stat="personality_before"
                  />
                  <YesOrNoComponent
                    header="Personality changed"
                    stat="personality_changed"
                  />
                  <TextComponent
                    header="Personality after illness"
                    stat="personality_after"
                  />
                  <TextComponent
                    header="Things that have helped apart from medication"
                    stat="other_help"
                  />
                  <DoughnutComponent
                    header="Worst base symptom"
                    data={dataSelection(allStatsPersonal.data?.worst_symptom)}
                  />
                  <CustomBarComponent
                    header="Occupancy"
                    data={dataSelection(allStatsPersonal.data?.life_situation)}
                    options={{
                      distributeSeries: true,
                      horizontalBars: true,
                      axisY: { offset: 80 },
                    }}
                  />
                  <YesOrNoComponent header="Has partner" stat="partner" />
                  <YesOrNoComponent header="Has friends" stat="friends" />
                  <YesOrNoComponent header="Has children" stat="children" />
                  <YesOrNoComponent
                    header="Life goals changed"
                    stat="goals_changed"
                  />
                  <TextComponent
                    header="How life goals changed"
                    stat="goals_after"
                  />
                  <CustomBarComponent
                    header="Has told about illness"
                    data={dataMultiSelect(allStatsPersonal.data?.told_family)}
                    options={{
                      distributeSeries: true,
                      horizontalBars: true,
                      axisY: { offset: 80 },
                    }}
                  />
                  <TextComponent
                    header="How people respnded"
                    stat="responded_to_telling"
                  />
                  <YesOrNoComponent
                    header="Were satisfied with life"
                    stat="life_satisfaction"
                  />
                  <TextComponent
                    header="Life satisfaction descrition"
                    stat="life_satisfaction_description"
                  />
                  <TextComponent
                    header="Wish people knew about schizphrenia"
                    stat="what_others_should_know"
                  />
                  <YesOrNoComponent
                    header="Would have chosen not to have schizphrenia"
                    stat="not_have_schizophrenia"
                  />
                  <TextComponent
                    header="Reasoning for wanting (or not) having schizphrenia"
                    stat="not_have_schizophrenia_description"
                  />
                  <CompareButton />
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

//TODO might want to change ask first if you have told anybody and then who
