import { Motion, Presence } from "@motionone/solid";
import type { Component, JSX, Setter } from "solid-js";
import {
  ErrorBoundary,
  For,
  Show,
  Suspense,
  batch,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import { CompSelector } from "~/components/CompSelector";
import CustomButton from "~/components/CustomButton";
import ModalPopUp from "~/components/ModalPopUp";
import { byDiagnosis, byGender } from "~/data/statsArrays";
import { allStats } from "~/server/queries";
import type { Bar, Doughnut, Stat, Text, YesOrNo } from "~/types/types";

interface Props extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  toggled?: boolean;
}

type CompareOptions =
  | "all"
  | "schizophrenia"
  | "schizoaffective"
  | "female"
  | "other"
  | "male";

const ToggleButton: Component<Props> = (props) => {
  return (
    <CustomButton
      onClick={(e) => props.onClick(e)}
      class={
        props.toggled ? `bg-blue-800 hover:bg-blue-900 active:bg-blue-900` : ""
      }
    >
      {props.children}
    </CustomButton>
  );
};

const Compared: Component<{
  setB: Setter<CompareOptions>;
  setA: Setter<CompareOptions>;
  setCompOrder: Setter<(Stat | YesOrNo | Doughnut | Bar | Text)[]>;
}> = (props) => {
  const [selection, setSelection] = createSignal<"diagnosis" | "gender">(
    "diagnosis"
  );

  const [male, setMale] = createSignal(true);
  const [female, setFemale] = createSignal(true);
  const [other, setOther] = createSignal(false);
  const [message, setMessage] = createSignal<string | null>(null);
  const [genderModalVisible, setGenderModalVisible] = createSignal(false);

  const logic = () => {
    const arr: [boolean, CompareOptions][] = [
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

      batch(() => {
        props.setCompOrder(byGender);
        props.setA(filtered[0][1]);
        props.setB(filtered[1][1]);
      });

      setMessage(null);
      setGenderModalVisible(false);
      document.body.style.overflow = "auto";
    }
  };

  return (
    <div class="my-6 flex flex-col items-center justify-between">
      <ModalPopUp setMessage={setMessage} message={message()} />
      <div class="flex items-center justify-center">
        <CustomButton
          class={
            selection() === "diagnosis"
              ? `w-32 bg-blue-800 hover:bg-blue-900 active:bg-blue-900`
              : "w-32"
          }
          onClick={() => {
            setSelection("diagnosis");

            batch(() => {
              props.setCompOrder(byDiagnosis);
              props.setA("schizophrenia");
              props.setB("schizoaffective");
            });
          }}
        >
          By Diagnosis
        </CustomButton>
        <CustomButton
          class={
            selection() !== "diagnosis"
              ? `w-32 bg-blue-800 hover:bg-blue-900 active:bg-blue-900`
              : "w-32"
          }
          onClick={() => {
            setSelection("gender");

            setMale(true);
            setFemale(true);
            setOther(false);
            props.setCompOrder(byGender);
            props.setA("male");
            props.setB("female");
          }}
        >
          By Gender
        </CustomButton>
      </div>

      <Show when={selection() === "gender"}>
        <CustomButton
          class="mt-4"
          onclick={() => {
            setGenderModalVisible(true);
            document.body.style.overflow = "hidden";
          }}
        >
          Change Genders
        </CustomButton>
      </Show>

      <Presence>
        <Show when={genderModalVisible()}>
          <Motion.div
            class="relative z-40"
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 0.5, easing: "ease-in-out" }}
            exit={{ opacity: [1, 0] }}
          >
            <div
              onClick={() => {
                setGenderModalVisible(false);
                document.body.style.overflow = "auto";
              }}
              class="fixed left-0 top-0 flex h-screen w-screen items-center justify-center bg-black opacity-40"
            />
            <div class="absolute flex -translate-x-1/2 flex-col items-center justify-center rounded-3xl border-2 bg-blue-50 p-3 opacity-100">
              <div class="flex">
                <ToggleButton onClick={() => setMale(!male())} toggled={male()}>
                  Male
                </ToggleButton>
                <ToggleButton
                  onClick={() => setFemale(!female())}
                  toggled={female()}
                >
                  Female
                </ToggleButton>
                <ToggleButton
                  onClick={() => setOther(!other())}
                  toggled={other()}
                >
                  Other
                </ToggleButton>
              </div>
              <CustomButton
                onClick={() => {
                  logic();
                }}
                class={"bg-green-500 hover:bg-green-600 active:bg-green-600"}
              >
                Compare
              </CustomButton>
            </div>
          </Motion.div>
        </Show>
      </Presence>
    </div>
  );
};

const CompareStats = () => {
  const [A, setA] = createSignal<CompareOptions>("schizophrenia");
  const [B, setB] = createSignal<CompareOptions>("schizoaffective");

  const [compOrder, setCompOrder] = createSignal(byDiagnosis); //BUG this needs to change to byGender also

  const [shown, setShown] = createSignal<Element[]>([]);
  const [targets, setTargets] = createSignal<Element[]>([]);

  const removeShown = (el: Element) => {
    const index = shown().indexOf(el);
    if (index > -1) {
      setShown(() => shown().splice(index, 1));
    }
  };

  let observer: IntersectionObserver;

  createEffect(() => {
    const options = {
      root: document.querySelector("#scrollArea"),
      rootMargin: "0px",
      threshold: 0.01,
    };

    observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setShown((els) => [...els, entry.target]);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    targets()?.forEach((el) => {
      observer.observe(el);
    });
  });
  onCleanup(() => {
    setTargets([]);
    observer.disconnect();
  });

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
    <div>
      <Compared setA={setA} setB={setB} setCompOrder={setCompOrder} />
      <div class="flex flex-col items-center justify-center">
        <div class="flex w-11/12 max-w-md flex-col rounded-3xl bg-white shadow-sm shadow-slate-500 lg:max-w-5xl">
          <div class="flex h-16 items-center justify-center rounded-t-3xl bg-blue-300 p-4">
            <h1 class="text-center font-semibold">Statistics Comparision</h1>
          </div>
          <div class="flex flex-col items-center justify-center">
            <div class="z-[5] flex w-full flex-col items-center justify-center lg:grid lg:grid-cols-2">
              <div class="sticky top-12 z-10 hidden items-center justify-center lg:flex">
                <h3 class="m-3 w-96 rounded-full border-4 border-blue-800 bg-white p-3 text-center text-2xl">
                  {A()}
                </h3>
              </div>
              <div class="sticky top-12 z-10 hidden items-center justify-center  lg:flex">
                <h3 class="m-3 w-96 rounded-full border-4 border-blue-800 bg-white p-3 text-center text-2xl">
                  {B()}
                </h3>
              </div>
              <Suspense fallback={<div>Loading...</div>}>
                <ErrorBoundary
                  fallback={(err) => {
                    console.log(err);
                    return <div>err</div>;
                  }}
                >
                  <For each={compOrder()}>
                    {(comp) => (
                      <>
                        <Show
                          when={comp.type !== "bar"}
                          fallback={
                            <>
                              <h5 class="text-xl lg:hidden">{A()}:</h5>
                              <CompSelector
                                {...comp}
                                data={statsA.data}
                                ref={(el: Element) => {
                                  setTargets((p) => [...p, el]);
                                }}
                                shown={shown()}
                                removeShown={removeShown}
                              />

                              <h5 class="text-xl lg:hidden">{B()}:</h5>
                              <CompSelector
                                {...comp}
                                data={statsB.data}
                                ref={(el: Element) => {
                                  setTargets((p) => [...p, el]);
                                }}
                                shown={shown()}
                                removeShown={removeShown}
                              />
                              <div class="my-12" />
                            </>
                          }
                        >
                          <h5 class="text-xl lg:hidden">{A()}:</h5>
                          <CompSelector
                            {...comp}
                            data={statsA.data}
                            ref={(el: Element) => {
                              {
                                setTargets((p) => [...p, el]);
                              }
                            }}
                            shown={shown()}
                            removeShown={removeShown}
                          />
                          <h5 class="text-xl lg:hidden">{B()}:</h5>
                          <CompSelector
                            {...comp}
                            data={statsB.data}
                            ref={(el: Element) => {
                              setTargets((p) => [...p, el]);
                            }}
                            shown={shown()}
                            removeShown={removeShown}
                          />
                          <div class="my-12" />
                        </Show>
                      </>
                    )}
                  </For>
                </ErrorBoundary>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareStats;

//TODO A and B for text routes need to work as well
