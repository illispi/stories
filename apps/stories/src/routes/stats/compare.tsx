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
import { allStats } from "~/server/queries";

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

  createEffect(() => {
    if (selection() === "gender") {
      props.setA("male");
      props.setB("female");
    }

    if (selection() === "diagnosis") {
      props.setA("schizophrenia");
      props.setB("schizoaffective");
    }
  });

  const logic = () => { 
      if()
   }

  

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
              props.A() === "male" || props.B() === "male"
                ? "bg-blue-800 hover:bg-blue-900 active:bg-blue-700"
                : null
            }
            onClick={() => setMale(male() ? false : true)}
          >
            Male
          </CustomButton>{" "}
          <CustomButton
            classChange={
              props.A() === "female" || props.B() === "female"
                ? "bg-blue-800 hover:bg-blue-900 active:bg-blue-700"
                : null
            }
            onClick={() => setFemale(female() ? false : true)}
          >
            Female
          </CustomButton>{" "}
          <CustomButton
            classChange={
              props.A() === "other" || props.B() === "other"
                ? "bg-blue-800 hover:bg-blue-900 active:bg-blue-700"
                : null
            }
            onClick={() => setOther(other() ? false : true)}
          >
            Other
          </CustomButton>
          <CustomButton  onClick={logic()}>Compare</CustomButton>
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
          <div>test</div>
        </Show>
      </Suspense>
    </ErrorBoundary>
  );
};

export default CompareStats;
