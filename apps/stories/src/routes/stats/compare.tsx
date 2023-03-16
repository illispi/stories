import type { Accessor, Component, Setter } from "solid-js";
import {
  createEffect,
  createSignal,
  ErrorBoundary,
  Match,
  Show,
  Suspense,
  Switch,
} from "solid-js";
import CustomButton from "~/components/CustomButton";
import { DoughnutComponent } from "~/components/Doughnut";
import { Item } from "~/components/Item";
import { allStats } from "~/server/queries";
import { dataSelection } from "~/utils/functions";

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
  const [state, setState] = createSignal("noErrors");

  createEffect(() => {
    if (selection() === "gender") {
      props.setA("male");
      props.setB("female");
    } else if (selection() === "diagnosis") {
      props.setA("schizophrenia");
      props.setB("schizoaffective");
    }
  });

  const logic = () => {
    const arr = [male(), female(), other()];
    const arr2 = ["male", "female", "other"];

    if (arr.filter((e) => e === true).length > 2) {
      setState("tooManySelected");
    } else if (arr.filter((e) => e === true).length < 2) {
      setState("tooFewSelected");
    } else {
      const aEl = arr.findIndex((e) => e === true);
      arr.splice(aEl, 1);
      const bEl = arr.findIndex((e) => e === true);
      props.setA(arr2[aEl]);
      props.setB(arr2[bEl]);
      setState("compare");
    }
  };

  return (
    <div class="flex flex-col items-center justify-center">
      <CustomButton onClick={() => setSelection("gender")}>
        By Gender
      </CustomButton>
      <CustomButton onClick={() => setSelection("diagnosis")}>
        By Diagnosis
      </CustomButton>
      <Switch>
        <Match when={selection() === "diagnosis"}>placeholder</Match>
        <Match when={selection() === "gender"}>
          <CustomButton
            classChange={
              male() ? "bg-blue-800 hover:bg-blue-900 active:bg-blue-700" : null
            }
            onClick={() => setMale(male() ? false : true)}
          >
            Male
          </CustomButton>
          <CustomButton
            classChange={
              female()
                ? "bg-blue-800 hover:bg-blue-900 active:bg-blue-700"
                : null
            }
            onClick={() => setFemale(female() ? false : true)}
          >
            Female
          </CustomButton>
          <CustomButton
            classChange={
              other()
                ? "bg-blue-800 hover:bg-blue-900 active:bg-blue-700"
                : null
            }
            onClick={() => setOther(other() ? false : true)}
          >
            Other
          </CustomButton>
          <CustomButton
            classChange={"bg-green-500 hover:bg-green-700 active:bg-green-800"}
            onClick={logic}
          >
            Compare
          </CustomButton>
          <Switch>
            <Match when={state() === "tooManySelected"}>
              <div>Please select only two genders</div>
            </Match>
            <Match when={state() === "tooFewSelected"}>
              <div>Please select two genders</div>
            </Match>
          </Switch>
        </Match>
      </Switch>
    </div>
  );
};

const CompareStats = () => {
  const [A, setA] = createSignal<
    "all" | "schizophrenia" | "schizoaffective" | "female" | "other" | "male"
  >("schizophrenia");
  const [B, setB] = createSignal<
    "all" | "schizophrenia" | "schizoaffective" | "female" | "other" | "male"
  >("schizoaffective");

  const statsA = allStats(() => ({
    value: A(),
  }));
  const statsB = allStats(() => ({
    value: B(),
  }));

  return (
    <ErrorBoundary fallback={(err) => err}>
      <Suspense fallback={<div>Loading</div>}>
        <Show when={statsA.data && statsB.data}>
          <Compared A={A} B={B} setA={setA} setB={setB} />
          <div class="mt-8 flex w-screen flex-col items-center justify-center">
            <div class="flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 md:max-w-xl">
              <div class="flex h-16 items-center justify-center bg-blue-300 p-4">
                <h1 class="text-center font-semibold">
                  Statistics Comparision
                </h1>
              </div>
              <div class="flex flex-col items-center justify-center">
                <div class="z-[5] flex w-full flex-col items-center justify-center bg-white">
                  <Item
                    name={"Total responses:"}
                    value={`${statsA.data?.total}`}
                  />

                  <DoughnutComponent
                    header="Share of diagnosis"
                    data={dataSelection(statsA.data?.diagnosis)}
                  />
                  <Item
                    name={"Total responses:"}
                    value={`${statsB.data?.total}`}
                  />

                  <DoughnutComponent
                    header="Share of diagnosis"
                    data={dataSelection(statsB.data?.diagnosis)}
                  />
                </div>
              </div>
            </div>
          </div>
        </Show>
      </Suspense>
    </ErrorBoundary>
  );
};

export default CompareStats;
