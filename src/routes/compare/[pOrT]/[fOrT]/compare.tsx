import { route } from "routes-gen";
import type { Component, Setter } from "solid-js";
import {
  For,
  Show,
  Suspense,
  batch,
  createEffect,
  createSignal,
  onCleanup,
} from "solid-js";
import { useParams, A as Alink } from "solid-start";
import { Transition } from "solid-transition-group";
import { CompSelector } from "~/components/CompSelector";
import CustomButton from "~/components/CustomButton";
import ModalPopUp from "~/components/ModalPopUp";
import ToggleButton from "~/components/ToggleButton";
import { byDiagnosisPersonal } from "~/data/stats/comparePersonal/byDiagnosisPersonal";
import { byGenderPersonal } from "~/data/stats/comparePersonal/byGenderPersonal";
import { byDiagnosisTheir } from "~/data/stats/compareTheir/byDiagnosisTheir";
import { byGenderTheir } from "~/data/stats/compareTheir/byGenderTheir";
import type { Bar, Doughnut, Stat, Text, YesOrNo } from "~/types/types";
import { trpc } from "~/utils/trpc";

type CompareOptions =
  | "all"
  | "schizophrenia"
  | "schizoaffective"
  | "female"
  | "other"
  | "male";

const Compared: Component<{
  setB: Setter<CompareOptions>;
  setA: Setter<CompareOptions>;
  setCompOrder: Setter<(Stat | YesOrNo | Doughnut | Bar | Text)[]>;
}> = (props) => {
  const [selection, setSelection] = createSignal<"diagnosis" | "gender">(
    "diagnosis"
  );

  const params = useParams<{
    pOrT: "Personal_questions" | "Their_questions";
  }>();

  const byGender =
    params.pOrT === "Personal_questions" ? byGenderPersonal : byGenderTheir;
  const byDiagnosis =
    params.pOrT === "Personal_questions"
      ? byDiagnosisPersonal
      : byDiagnosisTheir;

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
            batch(() => {
              setSelection("diagnosis");
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
      {/* NOTE how to animate invisible */}
      <CustomButton
        class={`mt-4 ${selection() !== "gender" ? "invisible" : "block"}`}
        onclick={() => {
          setGenderModalVisible(true);
          document.body.style.overflow = "hidden";
        }}
      >
        Change Genders
      </CustomButton>

      <Transition
        onEnter={(el, done) => {
          const a = el.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 500,
            easing: "ease-in-out",
          });
          a.finished.then(done);
        }}
        onExit={(el, done) => {
          const a = el.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 500,
            easing: "ease-in-out",
          });
          a.finished.then(done);
        }}
      >
        <Show when={genderModalVisible()}>
          <div class="relative z-40">
            <div
              onClick={() => {
                setGenderModalVisible(false);
                document.body.style.overflow = "auto";
              }}
              class="fixed left-0 top-0 flex h-screen w-screen items-center justify-center bg-black opacity-40"
            />

            <div class="absolute flex -translate-x-1/2 flex-col items-center justify-center rounded-3xl border-2 bg-blue-50 p-5 pt-8 opacity-100">
              <div class="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2">
                <CustomButton
                  class="bg-red-600 p-2 text-center hover:bg-red-900 active:bg-red-900"
                  onClick={() => {
                    setGenderModalVisible(false);
                    document.body.style.overflow = "auto";
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-8 w-8"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </CustomButton>
              </div>
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
          </div>
        </Show>
      </Transition>
    </div>
  );
};

const CompareStats = () => {
  const params = useParams<{
    pOrT: "Personal_questions" | "Their_questions";
    fOrT: "real" | "fake";
  }>();
  const byDiagnosis =
    params.pOrT === "Personal_questions"
      ? byDiagnosisPersonal
      : byDiagnosisTheir;

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

  createEffect(() => {
    const options = {
      root: document.querySelector("#scrollArea"),
      rootMargin: "0px",
      threshold: 0.01,
    };

    const observer = new IntersectionObserver((entries, observer) => {
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

    onCleanup(() => {
      observer.disconnect();
    });
  });

  const statsA = trpc.allStats.useQuery(() => ({
    value: A(),
    pOrT: params.pOrT,
    fake: params.fOrT,
  }));
  const statsB = trpc.allStats.useQuery(() => ({
    value: B(),
    pOrT: params.pOrT,
    fake: params.fOrT,
  }));

  return (
    <Show
      when={
        (statsA.data?.total &&
          statsB.data?.total &&
          statsA.data?.total >= 5 &&
          statsB.data?.total >= 5) ||
        params.fOrT === "fake"
      }
      fallback={
        <div class="flex min-h-screen w-full items-center justify-center">
          <div class="my-32 flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:my-64 lg:p-16">
            <div class="flex flex-col items-center justify-center gap-2">
              <h2 class="text-center text-2xl font-bold lg:text-3xl">
                {`${statsA.data?.total ?? 0}/5 ${A()}`}
              </h2>
              <h2 class="text-center text-2xl font-bold lg:text-3xl">{`${
                statsA.data?.total ?? 0
              }/5 ${B()}`}</h2>
            </div>
            <p class="text-center text-lg">
              Poll needs to be done by at least 5 people on both comparisons
            </p>
            <Alink
              class="rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
              href={route("/questionares/:personalQuestions", {
                personalQuestions:
                  params.pOrT === "Personal_questions"
                    ? "personalQuestions"
                    : "theirQuestions",
              })}
            >
              Do the poll now
            </Alink>
            <Alink
              class="rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
              href={route("/compare/:pOrT/:fOrT/compare", {
                fOrT: "fake",
                pOrT: params.pOrT,
              })}
            >
              View results with fake data
            </Alink>
          </div>
        </div>
      }
    >
      <div class="flex-1">
        <Compared setA={setA} setB={setB} setCompOrder={setCompOrder} />
        <div class="flex flex-col items-center justify-center">
          <div class="flex w-11/12 max-w-md flex-col rounded-3xl bg-white shadow-sm shadow-slate-500 lg:max-w-5xl">
            <div class="flex h-16 items-center justify-center rounded-t-3xl bg-blue-300 p-4">
              <h1 class="text-center font-semibold">Statistics Comparison</h1>
            </div>
            <div class="flex flex-col items-center justify-center">
              <div class="z-[5] flex w-full flex-col items-center justify-center lg:grid  lg:grid-cols-2 lg:items-start">
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
                <Show when={statsA.data && statsB.data}>
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
                                pOrT={params.pOrT}
                                fOrT={params.fOrT}
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
                                pOrT={params.pOrT}
                                fOrT={params.fOrT}
                              />
                              <div class="my-12 w-full border-2 border-b-black lg:hidden " />
                            </>
                          }
                        >
                          <>
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
                              pOrT={params.pOrT}
                              fOrT={params.fOrT}
                            />
                            <h5 class="text-xl lg:hidden">{B()}:</h5>
                            <CompSelector
                              {...comp}
                              data={statsB.data}
                              ref={(el: Element) => {
                                setTargets((p) => [...p, el]);
                                onCleanup(() => {
                                  if (targets().length >= 0) {
                                    setTargets([]);
                                  }
                                });
                              }}
                              shown={shown()}
                              removeShown={removeShown}
                              pOrT={params.pOrT}
                              fOrT={params.fOrT}
                            />
                            <div class="my-12 w-full border-2 border-b-black lg:hidden" />
                          </>
                        </Show>
                      </>
                    )}
                  </For>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default CompareStats;

//TODO A and B for text routes need to work as well
