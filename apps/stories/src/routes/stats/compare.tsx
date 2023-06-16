import { Motion, Presence } from "@motionone/solid";
import { Rerun } from "@solid-primitives/keyed";
import { log } from "console";
import {
  Accessor,
  batch,
  Component,
  For,
  Index,
  JSX,
  onMount,
  Setter,
  splitProps,
} from "solid-js";
import {
  createEffect,
  createSignal,
  ErrorBoundary,
  Match,
  Show,
  Suspense,
  Switch,
} from "solid-js";
import { BarComponent } from "~/components/Bar";
import CustomButton from "~/components/CustomButton";
import { DoughnutComponent } from "~/components/Doughnut";
import { Item } from "~/components/Item";
import ModalPopUp from "~/components/ModalPopUp";
import { TextComponent } from "~/components/Text";
import { YesOrNoComponent } from "~/components/YesOrNo";
import {
  BarCounterProvider,
  DataProvider,
  PieCounterProvider,
  useData,
} from "~/components/globalSignals";
import { allStats } from "~/server/queries";
import type {
  Bar,
  Doughnut,
  Stat,
  YesOrNo,
  Text,
  CompType,
} from "~/types/types";
import { dataSelection } from "~/utils/functions";

interface Props extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  toggled?: boolean;
}

const ToggleButton: Component<Props> = (props) => {
  return (
    <button onClick={(e) => props.onClick(e)}>
      <CustomButton
        classChange={
          props.toggled
            ? `bg-blue-800 hover:bg-blue-900 active:bg-blue-900`
            : null
        }
      >
        {props.children}
      </CustomButton>
    </button>
  );
};

const Compared: Component<{
  A: Accessor<
    "all" | "schizophrenia" | "schizoaffective" | "female" | "other" | "male"
  >;
  B: Accessor<
    "all" | "schizophrenia" | "schizoaffective" | "female" | "other" | "male"
  >;
  setB: Setter<
    "all" | "schizophrenia" | "schizoaffective" | "female" | "other" | "male"
  >;
  setA: Setter<
    "all" | "schizophrenia" | "schizoaffective" | "female" | "other" | "male"
  >;
}> = (props) => {
  const [selection, setSelection] = createSignal<"diagnosis" | "gender">(
    "diagnosis"
  );

  const [male, setMale] = createSignal(true);
  const [female, setFemale] = createSignal(true);
  const [other, setOther] = createSignal(false);
  const [message, setMessage] = createSignal(null);

  //BUG this can sometimes get out of sync
  // createEffect(() => {
  //   console.log("male", male(), "female", female(), "other", other());
  // });

  const logic = () => {
    const arr = [
      [male(), "male"],
      [female(), "female"],
      [other(), "other"],
    ];

    if (arr.filter((e) => e[0] === true).length > 2) {
      setMessage("Please select only two genders");
    } else if (arr.filter((e) => e[0] === true).length < 2) {
      setMessage("Please select two genders");
    } else {
      const filtered = arr.filter((e) => e[0] === true);

      props.setA(filtered[0][1]);
      props.setB(filtered[1][1]);

      setMessage(null);
    }
  };

  return (
    <div class="flex flex-col items-center justify-center">
      <ModalPopUp
        setMessage={setMessage}
        message={message()}
        customClasses="top-16"
      />
      <CustomButton onClick={() => setSelection("gender")}>
        By Gender
      </CustomButton>
      <CustomButton
        onClick={() => {
          setSelection("diagnosis");

          props.setA("schizophrenia");
          props.setB("schizoaffective");
        }}
      >
        By Diagnosis
      </CustomButton>
      <Switch>
        <Match when={selection() === "diagnosis"}>Placeholder</Match>
        <Match when={selection() === "gender"}>
          <ToggleButton onClick={() => setMale(!male())} toggled={male()}>
            Male
          </ToggleButton>
          <ToggleButton onClick={() => setFemale(!female())} toggled={female()}>
            Female
          </ToggleButton>
          <ToggleButton onClick={() => setOther(!other())} toggled={other()}>
            Other
          </ToggleButton>
          <CustomButton
            onClick={logic}
            classChange={"bg-green-500 hover:bg-green-600 active:bg-green-600"}
          >
            Compare
          </CustomButton>
        </Match>
      </Switch>
    </div>
  );
};

const showGender = (data) => {
  console.log(data, "gender");

  const keys = Object.keys(data);
  const gender = keys.find((n) => data[n] > 0);
  return gender;
};

const CompSelector = (props) => {
  return (
    <Switch>
      <Match when={props.type === "stat"}>
        <Item {...props} />
      </Match>
      <Match when={props.type === "doughnut"}>
        <DoughnutComponent {...props} />
      </Match>
      <Match when={props.type === "bar"}>
        <BarComponent {...props} />
      </Match>
      <Match when={props.type === "text"}>
        <TextComponent {...props} />
      </Match>
      <Match when={props.type === "yesOrNo"}>
        <YesOrNoComponent {...props} />
      </Match>
    </Switch>
  );
};

const CompareStats = () => {
  const [A, setA] = createSignal<
    "all" | "schizophrenia" | "schizoaffective" | "female" | "other" | "male"
  >("schizophrenia");
  const [B, setB] = createSignal<
    "all" | "schizophrenia" | "schizoaffective" | "female" | "other" | "male"
  >("schizoaffective");

  const { setDataA, setDataB } = useData();

  const [compOrder, setCompOrder] = createSignal<
    (Stat | YesOrNo | Doughnut | Bar | Text)[]
  >([
    { type: "stat", stat: "total", name: "Total Responses" },
    {
      type: "doughnut",
      stat: "diagnosis",
      header: "Share of diagnosis",
      function: "dataSelection",
    },
    {
      type: "doughnut",
      stat: "gender",
      header: "Share of genders",
      function: "dataGender",
    },
    {
      type: "bar",
      stat: "current_age",
      header: "Age of responses",
      function: "dataAgeOfRes",
      options: { distributeSeries: true },
    },
    {
      type: "bar",
      stat: "ageOfOnsetByGender",
      header: "Age of onset",
      function: "dataOnset",
    },
    {
      type: "doughnut",
      stat: "length_of_psychosis",
      header: "Length of first psychosis",
      function: "dataSelection",
    },
    {
      type: "yesOrNo",
      stat: "hospitalized_on_first",
      header: "Hospitalized on first psychosis",
    },
    {
      type: "yesOrNo",
      stat: "hospital_satisfaction",
      header: "Were satisfied with hospital care",
    },
    {
      type: "text",
      stat: "describe_hospital",
      header: "Hospital care opinions",
    },
    {
      type: "yesOrNo",
      stat: "care_after_hospital",
      header: "Recieved care after hospitalization",
    },
    {
      type: "text",
      stat: "what_kind_of_care_after",
      header: "Care after opinions",
    },
    {
      type: "yesOrNo",
      stat: "after_hospital_satisfaction",
      header: "Were satisifed with after hospitalization care",
    },
    {
      type: "bar",
      stat: "psychosis_how_many",
      header: "How many psychosis",
      function: "dataSelection",
      options: {
        distributeSeries: true,
        horizontalBars: true,
        axisY: { offset: 80 },
      },
    },

    {
      type: "yesOrNo",
      stat: "prodromal_symptoms",
      header: "Had prodromal symptoms",
    },
    {
      type: "bar",
      stat: "prodromal_anxiety",
      header: "Prodromal symptoms",
      function: "dataMultiSelect",
      options: {
        distributeSeries: true,
        horizontalBars: true,
        axisY: { offset: 80 },
      },
    },
    {
      type: "bar",
      stat: "symptoms_hallucinations",
      header: "First psychosis symptoms",
      function: "dataMultiSelect",
      options: {
        distributeSeries: true,
        horizontalBars: true,
        axisY: { offset: 80 },
      },
    },
    {
      type: "bar",
      stat: "current_med",
      header: "Primary anti-psychotic",
      function: "dataSelection",
      options: {
        distributeSeries: true,
        horizontalBars: true,
        axisY: { offset: 70 },
        reverseData: true,
        height: "500",
      },
    },
    {
      type: "yesOrNo",
      stat: "efficacy_of_med",
      header: "Medications helped to psychosis symptoms",
    },
    {
      type: "bar",
      stat: "side_effs_dizziness",
      header: "Side effects from medication",
      function: "dataMultiSelect",
      options: {
        distributeSeries: true,
        horizontalBars: true,
        axisY: { offset: 70 },
      },
    },

    {
      type: "yesOrNo",
      stat: "quitting",
      header: "Have quit medication",
    },
    {
      type: "doughnut",
      stat: "quitting_why",
      header: "Reasons for quitting medication",
      function: "dataSelection",
    },
    {
      type: "text",
      stat: "quitting_what_happened",
      header: "Happened after quitting medication",
    },
    {
      type: "yesOrNo",
      stat: "quitting_regret",
      header: "Regreted quitting medication",
    },
    {
      type: "yesOrNo",
      stat: "gained_weight",
      header: "Have gained weight after medication",
    },
    {
      type: "bar",
      stat: "weight_amount",
      header: "Weight gained",
      function: "weightBrackets",
      options: {
        distributeSeries: true,
      },
    },
    {
      type: "yesOrNo",
      stat: "smoking",
      header: "Smoking",
    },
    {
      type: "doughnut",
      stat: "smoking_amount",
      header: "Smoking tobacco amount",
      function: "dataSelection",
    },
    {
      type: "yesOrNo",
      stat: "cannabis",
      header: "Has used cannabis",
    },
    {
      type: "yesOrNo",
      stat: "suicidal_thoughts",
      header: "Has had suicidal thoughts",
    },
    {
      type: "yesOrNo",
      stat: "suicide_attempts",
      header: "Has attempted suicide",
    },
    {
      type: "yesOrNo",
      stat: "negative_symptoms",
      header: "Has negative symptoms",
    },
    {
      type: "bar",
      stat: "flat_expressions",
      header: "Negative symptoms",
      function: "dataMultiSelect",
      options: {
        distributeSeries: true,
        horizontalBars: true,
        axisY: { offset: 80 },
      },
    },
    {
      type: "yesOrNo",
      stat: "cognitive_symptoms",
      header: "Has cognitive symptoms",
    },
    {
      type: "bar",
      stat: "disorganized_thinking",
      header: "Cognitive symptoms",
      function: "dataMultiSelect",
      options: {
        distributeSeries: true,
        horizontalBars: true,
        axisY: { offset: 80 },
      },
    },
    {
      type: "text",
      stat: "personality_before",
      header: "Personality before illness",
    },
    {
      type: "yesOrNo",
      stat: "personality_changed",
      header: "Personality changed",
    },
    {
      type: "text",
      stat: "personality_after",
      header: "Personality after illness",
    },
    {
      type: "text",
      stat: "other_help",
      header: "Things that have helped apart from medication",
    },
    {
      type: "doughnut",
      stat: "worst_symptom",
      header: "Worst base symptom",
      function: "dataSelection",
    },
    {
      type: "bar",
      stat: "life_situation",
      header: "Occupancy",
      function: "dataSelection",
      options: {
        distributeSeries: true,
        horizontalBars: true,
        axisY: { offset: 80 },
      },
    },
    {
      type: "yesOrNo",
      stat: "partner",
      header: "Has partner",
    },
    {
      type: "yesOrNo",
      stat: "friends",
      header: "Has friends",
    },
    {
      type: "yesOrNo",
      stat: "children",
      header: "Has children",
    },
    {
      type: "yesOrNo",
      stat: "goals_changed",
      header: "Life goals changed",
    },
    {
      type: "text",
      stat: "goals_after",
      header: "How life goals changed",
    },
    {
      type: "bar",
      stat: "told_family",
      header: "Has told about illness",
      function: "dataMultiSelect",
      options: {
        distributeSeries: true,
        horizontalBars: true,
        axisY: { offset: 80 },
      },
    },
    {
      type: "text",
      stat: "responded_to_telling",
      header: "How people responded",
    },

    {
      type: "yesOrNo",
      stat: "life_satisfaction",
      header: "Were satisfied with life",
    },
    {
      type: "text",
      stat: "life_satisfaction_description",
      header: "Life satisfaction",
    },
    {
      type: "text",
      stat: "what_others_should_know",
      header: "Wish people knew about schizphrenia",
    },
    {
      type: "yesOrNo",
      stat: "not_have_schizophrenia",
      header: "Would have chosen not to have schizphrenia",
    },
    {
      type: "text",
      stat: "not_have_schizophrenia_description",
      header: "Reasoning for wanting (or not) having schizphrenia",
    },
  ]);

  const statsA = allStats(
    () => ({
      value: A(),
    }),
    () => ({
      placeholderData: (prev) => prev, //NOTE why is this necessary, log something in effect
    })
  );
  const statsB = allStats(
    () => ({
      value: B(),
    }),
    () => ({
      placeholderData: (prev) => prev,
    })
  );

  createEffect(() => {
    console.log(statsA.data);

    setDataA(statsA.data);
    setDataB(statsB.data);
  });

  return (
    <Suspense fallback={<div>wtf</div>}>
      <ErrorBoundary
        fallback={(err) => {
          console.log(err);
          return <div>err</div>;
        }}
      >
        <BarCounterProvider count={0}>
          <PieCounterProvider count={0}>
            <Compared A={A} B={B} setA={setA} setB={setB} />
            <div class="mt-8 flex w-screen flex-col items-center justify-center">
              <div class="flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 md:max-w-xl lg:max-w-5xl">
                <div class="flex h-16 items-center justify-center bg-blue-300 p-4">
                  <h1 class="text-center font-semibold">
                    Statistics Comparision
                  </h1>
                </div>
                <div class="flex flex-col items-center justify-center">
                  <Index each={compOrder()}>
                    {(comp, i) => (
                      <>
                        <Show
                          when={comp().type !== "bar"}
                          fallback={
                            <>
                              <div class="z-[5] flex w-full flex-col items-center justify-center bg-white xl:grid xl:grid-cols-2">
                                <h5 class="xl:hidden">{A()}:</h5>
                                <CompSelector {...comp} data={"A"} />

                                <h5 class="xl:hidden">{B()}:</h5>
                                <CompSelector {...comp} data={"B"} />
                              </div>
                            </>
                          }
                        >
                          <div class="z-[5] flex w-full flex-col items-center justify-center bg-white sm:grid sm:grid-cols-2">
                            <h5 class="sm:hidden">{A()}:</h5>
                            <CompSelector {...comp} data={"A"} />
                            <h5 class="sm:hidden">{B()}:</h5>
                            <CompSelector {...comp} data={"B"} />
                          </div>
                        </Show>
                      </>
                    )}
                  </Index>
                </div>
              </div>
            </div>
          </PieCounterProvider>
        </BarCounterProvider>
      </ErrorBoundary>
    </Suspense>
  );
};

export default CompareStats;
