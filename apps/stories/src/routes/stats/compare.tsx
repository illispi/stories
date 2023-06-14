import { Motion, Presence } from "@motionone/solid";
import { Rerun } from "@solid-primitives/keyed";
import { log } from "console";
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
import ModalPopUp from "~/components/ModalPopUp";
import {
  BarCounterProvider,
  PieCounterProvider,
} from "~/components/globalSignals";
import { allStats } from "~/server/queries";
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
              <div class="flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 md:max-w-xl lg:max-w-3xl">
                <div class="flex h-16 items-center justify-center bg-blue-300 p-4">
                  <h1 class="text-center font-semibold">
                    Statistics Comparision
                  </h1>
                </div>
                <div class="flex flex-col items-center justify-center">
                  <div class="z-[5] flex w-full flex-col items-center justify-center bg-white md:grid md:grid-cols-2">
                    <Item
                      name={"Total responses:"}
                      value={`${statsA.data?.total}`}
                    />

                    <Item
                      name={"Total responses:"}
                      value={`${statsB.data?.total}`}
                    />

                    <DoughnutComponent
                      header="Share of diagnosis"
                      data={dataSelection(statsA.data?.diagnosis)}
                    />

                    <DoughnutComponent
                      header="Share of diagnosis"
                      data={dataSelection(statsB.data?.diagnosis)}
                    />
                  </div>
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
