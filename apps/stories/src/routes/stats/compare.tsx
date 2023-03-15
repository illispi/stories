import type {
  Accessor,
  Component,
  Setter} from "solid-js";
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

  const [value, setValue] = createSignal("male");

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

  createEffect(() => {
    if (value() === "female" && props.A() !== "female") {
      props.setA("female");
    } else if (value() === "other" && props.A() !== "other") {
      props.setA("other");
    } else if (value() === "male" && props.A() !== "male") {
      props.setA("male");
    } else {
      props.setB(value());
    }
  });

  return (
    <>
      <CustomButton onClick={() => setSelection("gender")}>
        By Gender
      </CustomButton>
      <CustomButton onClick={() => setSelection("diagnosis")}>
        By Diagnosis
      </CustomButton>
      <Switch>
        <Match when={selection() === "diagnosis"}>placeholder</Match>
        <Match when={selection() === "gender"}>
          <CustomButton onClick={() => setValue("male")}>Male</CustomButton>{" "}
          <CustomButton onClick={() => setValue("female")}>Female</CustomButton>{" "}
          <CustomButton onClick={() => setValue("other")}>Other</CustomButton>
        </Match>
      </Switch>
    </>
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
