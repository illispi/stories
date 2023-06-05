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
import { allStats } from "~/server/queries";
import { dataSelection } from "~/utils/functions";

interface Props extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  toggled?: boolean;
}

const ToggleButton: Component<Props> = (props) => {
  const [toggle, setToggle] = createSignal(props.toggled);

  return (
    <button onClick={props.onClick}>
      <CustomButton
        classChange={
          toggle() ? `bg-blue-800 hover:bg-blue-900 active:bg-blue-900` : null
        }
        onClick={() => {
          setToggle(!toggle());
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
  setLoadAnim: Setter<boolean>;
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
      props.setLoadAnim(true);
      const filtered = arr.filter((e) => e[0] === true);
      props.setA(filtered[0][1]);
      props.setB(filtered[1][1]);
      setMessage(null);
      setTimeout(() => props.setLoadAnim(false), 5000);
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
          props.setLoadAnim(true);
          setSelection("diagnosis");
          props.setA("schizophrenia");
          props.setB("schizoaffective");
          setTimeout(() => props.setLoadAnim(false), 5000);
        }}
      >
        By Diagnosis
      </CustomButton>
      <Switch>
        <Match when={selection() === "diagnosis"}>Placeholder</Match>
        <Match when={selection() === "gender"}>
          <ToggleButton onClick={(e) => setMale(!male())} toggled={male()}>
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

const CompareStats = () => {
  const [A, setA] = createSignal<
    "all" | "schizophrenia" | "schizoaffective" | "female" | "other" | "male"
  >("schizophrenia");
  const [B, setB] = createSignal<
    "all" | "schizophrenia" | "schizoaffective" | "female" | "other" | "male"
  >("schizoaffective");

  const [loadAnim, setLoadAnim] = createSignal(false);

  createEffect(() => {
    console.log(loadAnim());
  });

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
      <Suspense>
        <Compared
          A={A}
          B={B}
          setA={setA}
          setB={setB}
          setLoadAnim={setLoadAnim}
        />
        <div class="mt-8 flex w-screen flex-col items-center justify-center">
          <div class="flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 md:max-w-xl">
            <div class="flex h-16 items-center justify-center bg-blue-300 p-4">
              <h1 class="text-center font-semibold">Statistics Comparision</h1>
            </div>
            <div class="flex flex-col items-center justify-center">
              <div class="z-[5] flex w-full flex-col items-center justify-center bg-white">
                <Show when={loadAnim()}>
                  <div class="animate-loading h-[600px] w-full bg-blue-400" />
                </Show>

                <Show when={!loadAnim()}>
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
                </Show>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default CompareStats;
