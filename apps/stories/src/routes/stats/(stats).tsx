import { Motion, Presence } from "@motionone/solid";
import type { Component, ParentComponent } from "solid-js";
import { createSignal, ErrorBoundary, Show, Suspense } from "solid-js";
import { A } from "solid-start";
import { CustomBarComponent } from "~/components/CustomBar";
import CustomButton from "~/components/CustomButton";
import { DoughnutComponent } from "~/components/Doughnut";
import { Item } from "~/components/Item";
import { TextComponent } from "~/components/Text";
import { YesOrNoComponent } from "~/components/YesOrNo";
import {
  BarCounterProvider,
  PieCounterProvider,
} from "~/components/globalSignals";
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

  const [byGenderPsyLength, setByGenderPsyLength] = createSignal(false);

  return (
    <Suspense fallback={<div>Loading</div>}>
      <ErrorBoundary fallback={(err) => err}>
  
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

                    <Item
                      name={"Total responses:"}
                      value={`${allStatsPersonal.data?.total}`}
                    />
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
                    data={allStatsPersonal.data}
                    header="Hospitalized on first psychosis"
                    stat={"hospitalized_on_first"}
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Were satisfied with hospital care"
                    stat={"hospital_satisfaction"}
                  />
                  <TextComponent
                    data={allStatsPersonal.data}
                    stat={"describe_hospital"}
                    header={"Hospital care opinions"}
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Recieved care after hospitalization"
                    stat={"care_after_hospital"}
                  />
                  <TextComponent
                    data={allStatsPersonal.data}
                    stat={"what_kind_of_care_after"}
                    header={"Care after opinions"}
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
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
                    data={allStatsPersonal.data}
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
                    data={allStatsPersonal.data}
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
                    data={allStatsPersonal.data}
                    header="Have quit medication"
                    stat="quitting"
                  />
                  <DoughnutComponent
                    header="Reasons on quitting medication"
                    data={dataSelection(allStatsPersonal.data?.quitting_why)}
                  />
                  <TextComponent
                    data={allStatsPersonal.data}
                    header="Happened after quitting medication"
                    stat="quitting_what_happened"
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Regreted quitting medication"
                    stat="quitting_regret"
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Have gained weight after medications"
                    stat="gained_weight"
                  />
                  <CustomBarComponent
                    header="Weight gained"
                    data={weightBrackets(allStatsPersonal.data?.weight_amount)}
                    options={{ distributeSeries: true }}
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Smoking"
                    stat="smoking"
                  />
                  <DoughnutComponent
                    header="Smoking tobacco amount"
                    data={dataSelection(allStatsPersonal.data?.smoking_amount)}
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Has used cannabis"
                    stat="cannabis"
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Has had suicidal thoughts"
                    stat="suicidal_thoughts"
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Has attempted suicide"
                    stat="suicide_attempts"
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
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
                    data={allStatsPersonal.data}
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
                    data={allStatsPersonal.data}
                    header="Personality before illness"
                    stat="personality_before"
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Personality changed"
                    stat="personality_changed"
                  />
                  <TextComponent
                    data={allStatsPersonal.data}
                    header="Personality after illness"
                    stat="personality_after"
                  />
                  <TextComponent
                    data={allStatsPersonal.data}
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
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Has partner"
                    stat="partner"
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Has friends"
                    stat="friends"
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Has children"
                    stat="children"
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Life goals changed"
                    stat="goals_changed"
                  />
                  <TextComponent
                    data={allStatsPersonal.data}
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
                    data={allStatsPersonal.data}
                    header="How people respnded"
                    stat="responded_to_telling"
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Were satisfied with life"
                    stat="life_satisfaction"
                  />
                  <TextComponent
                    data={allStatsPersonal.data}
                    header="Life satisfaction descrition"
                    stat="life_satisfaction_description"
                  />
                  <TextComponent
                    data={allStatsPersonal.data}
                    header="Wish people knew about schizphrenia"
                    stat="what_others_should_know"
                  />
                  <YesOrNoComponent
                    data={allStatsPersonal.data}
                    header="Would have chosen not to have schizphrenia"
                    stat="not_have_schizophrenia"
                  />
                  <TextComponent
                    data={allStatsPersonal.data}
                    header="Reasoning for wanting (or not) having schizphrenia"
                    stat="not_have_schizophrenia_description"
                  />
                  <CompareButton />
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
