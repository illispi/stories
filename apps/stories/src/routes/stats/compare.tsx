import {
  Accessor,
  batch,
  Component,
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
import CustomButton from "~/components/CustomButton";
import { DoughnutComponent } from "~/components/Doughnut";
import { Item } from "~/components/Item";
import { allStats } from "~/server/queries";
import { dataSelection } from "~/utils/functions";

interface Props extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  toggled?: boolean;
}

const ToggleButton: Component<Props> = (props) => {
  const [local, others] = splitProps(props, ["toggled"]);
  const [toggle, setToggle] = createSignal(local.toggled);

  return (
    <button onClick={props.onClick}>
      <CustomButton
        classChange={
          toggle() ? `bg-blue-800 hover:bg-blue-900 active:bg-blue-900` : null
        }
        onClick={() => {
          setToggle(toggle() ? setToggle(false) : setToggle(true));
        }}
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
  const [state, setState] = createSignal("noErrors");

  const logic = () => {
    const arr = [
      [male(), "male"],
      [female(), "female"],
      [other(), "other"],
    ];

    if (arr.filter((e) => e[0] === true).length > 2) {
      setState("tooManySelected");
    } else if (arr.filter((e) => e[0] === true).length < 2) {
      setState("tooFewSelected");
    } else {
      const filtered = arr.filter((e) => e[0] === true);
      props.setA(filtered[0][1]);
      props.setB(filtered[1][1]);
      setState("compare");
    }
  };

  return (
    <div class="flex flex-col items-center justify-center">
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
          <ToggleButton
            onClick={(e) => setMale(male() ? false : true)}
            toggled={male()}
          >
            Male
          </ToggleButton>
          <ToggleButton
            onClick={() => setFemale(female() ? false : true)}
            toggled={female()}
          >
            Female
          </ToggleButton>
          <ToggleButton
            onClick={() => setOther(other() ? false : true)}
            toggled={other()}
          >
            Other
          </ToggleButton>
          <CustomButton
            onClick={logic}
            classChange={"bg-green-500 hover:bg-green-600 active:bg-green-600"}
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

  const statsA = allStats(
    () => ({
      value: A(),
    }),
    () => ({
      placeholderData: (prev) => prev,
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

  return (
    <ErrorBoundary fallback={(err) => err}>
      <Compared A={A} B={B} setA={setA} setB={setB} />
      <div class="mt-8 flex w-screen flex-col items-center justify-center">
        <div class="flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 md:max-w-xl">
          <div class="flex h-16 items-center justify-center bg-blue-300 p-4">
            <h1 class="text-center font-semibold">Statistics Comparision</h1>
          </div>
          <div class="flex flex-col items-center justify-center">
            <div class="z-[5] flex w-full flex-col items-center justify-center bg-white">
              <Item name={"Total responses:"} value={`${statsA.data?.total}`} />

              <DoughnutComponent
                header="Share of diagnosis"
                data={dataSelection(statsA.data?.diagnosis)}
              />
              <Item name={"Total responses:"} value={`${statsB.data?.total}`} />

              <DoughnutComponent
                header="Share of diagnosis"
                data={dataSelection(statsB.data?.diagnosis)}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CompareStats;
