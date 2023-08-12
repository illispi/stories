import type { ParentComponent } from "solid-js";
import { createSignal, For, Match, Switch } from "solid-js";
import type { QuestionPersonal } from "~/data/personalQuestionsArr";
import { questions as questionsP } from "~/data/personalQuestionsArr";
import { questions as questionsT } from "~/data/theirQuestionsArr";
import { postPersonalStats, postTheirStats } from "~/server/mutations";
import type { PersonalQuestions, TheirQuestions } from "~/types/zodFromTypes";
import CustomButton from "./CustomButton";
import ModalPopUp from "./ModalPopUp";
import { z } from "zod";
import type { QuestionTheir } from "~/data/theirQuestionsArr";

const Box: ParentComponent<{ question: string }> = (props) => {
  return (
    <>
      <div class="flex h-24 w-80 items-center justify-center rounded-t-3xl bg-blue-300 p-8">
        <label class="text-center font-semibold">{props.question}</label>
      </div>
      <div class="flex h-full flex-col items-center justify-center overflow-hidden overflow-y-auto">
        {props.children}
      </div>
    </>
  );
};

const firstLetterUpperCase = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const UnitQuestion: ParentComponent<{
  content: QuestionPersonal | QuestionTheir;
  LsName: "personalQuestions" | "theirQuestions";
  paginate: (newDirection: number) => void;
}> = (props) => {
  const sendStats =
    props.LsName === "personalQuestions"
      ? postPersonalStats()
      : postTheirStats();

  const questions =
    props.LsName === "personalQuestions" ? questionsP : questionsT;

  const {
    question,
    questionDB,
    questionType,
    selections,
    multiSelect,
    skip,
  } = props.content;

  const questionsLs: PersonalQuestions | TheirQuestions = JSON.parse(
    localStorage.getItem(props.LsName) ?? "{}"
  );

  const valueOfLS = questionsLs[questionDB] ?? "";

  const multiSelInit = () => {
    const selectionsObj = multiSelect
      ?.map((e) => e[0])
      .reduce(
        (acc, curr) => (
          curr in questionsLs && (acc[curr] = questionsLs[curr] as boolean), acc
        ),
        {} as Record<keyof PersonalQuestions, boolean>
      );

    if (Object.keys(selectionsObj ? selectionsObj : {}).length === 0) {
      const allFalse = multiSelect?.reduce(
        (acc, curr) => ((acc[curr[0]] = false), acc),
        {} as Record<keyof PersonalQuestions, boolean>
      );

      return allFalse;
    }
    return selectionsObj;
  };

  //NOTE removed lazy inits in solid see old react code

  const [number, setNumber] = createSignal(valueOfLS as string);
  const [text, setText] = createSignal(valueOfLS as string);
  const [error, setError] = createSignal<string | null>(null);
  const [multiSelections, setMultiSelections] = createSignal(multiSelInit());
  const [yesOrNO, setYesOrNO] = createSignal(valueOfLS as boolean);
  const [selection, setSelection] = createSignal(valueOfLS as string);
  const [metric, setMetric] = createSignal<boolean>(
    JSON.parse(localStorage.getItem("system") ?? '"true"')
  );

  const submitResults = () => {
    (Object.keys(questionsLs) as Array<keyof PersonalQuestions>).forEach(
      (e) => {
        if (
          questions.find((el) => el.questionDB === e)?.questionType ===
          "integer"
        ) {
          ((questionsLs as unknown) as Record<keyof PersonalQuestions, number>)[ //TODO this as unknown has to have something better
            e
          ] = Number(questionsLs[e]); //NOTE is this as number really good practice?
        }
      }
    );

    const array2 = Object.keys(questionsLs);
    questions
      .map((k) => k.questionDB)
      .filter((j) => !array2?.includes(j))
      .forEach((s) => {
        (questionsLs[s] as null) = null;
      });

    questions
      .filter((e) => e.multiSelect)
      .map((e) => e.multiSelect?.map((el) => el[0]))
      .flat()
      .filter((j) => !array2?.includes(j ? j : "")) //BUG there might be a bug here
      .forEach((e) => (e ? ((questionsLs[e] as boolean) = false) : null));

    sendStats.mutateAsync(questionsLs);
  };

  const handleMultiSubmit = (
    values: Record<keyof PersonalQuestions, boolean>
  ) => {
    if (!values) {
      return undefined; //TODO might need something better, this a null check
    }
    if (
      (Object.keys(values) as Array<keyof PersonalQuestions>).filter(
        (e) => values[e] === false
      ).length === multiSelect?.map((e) => e[0]).length
    ) {
      setError("Please select at least one option");
    } else {
      setError(null);
      try {
        //TODO clear all values on previous gesture, if skipping
        //TODO remeber to refactor this as well to delete on skip no

        localStorage.setItem(
          props.LsName,
          JSON.stringify({ ...questionsLs, ...values })
        );

        props.paginate(1);
      } catch (err) {
        console.log(err);
        return undefined;
      }
    }
  };

  const handleSubmit = (
    value: {
      [Property in keyof PersonalQuestions]?: boolean | number | string;
    },
    skipAmount?: number
  ) => {
    try {
      if (questionDB === "weight_amount") {
        localStorage.setItem("system", JSON.stringify(metric()));
      }
      if (
        questionDB === "weight_amount" &&
        !metric() &&
        typeof value === "string"
      ) {
        value = { [questionDB]: Math.floor(parseInt(value) * 0.45359237) };
      }
      setSelection(value[questionDB] as string);
      setYesOrNO(value[questionDB] as boolean);
      localStorage.setItem(
        props.LsName,
        JSON.stringify({ ...questionsLs, ...value })
      );
      const LsExistsJunctions = localStorage.getItem(
        `junctions_${props.LsName}`
      );
      let junctions: Record<keyof PersonalQuestions, number> = LsExistsJunctions
        ? JSON.parse(LsExistsJunctions)
        : null;

      if (questionType === "yesOrNo" || questionType === "unknown") {
        if (
          (value[questionDB] === true ||
            value[questionDB] === "yes" ||
            value[questionDB] === "unknown") &&
          skip
        ) {
          junctions = {
            ...junctions,
            [questionDB]:
              questions.findIndex((e) => e.questionDB === skip) -
              questions.findIndex((e) => e.questionDB === questionDB),
          };
          localStorage.setItem(
            `junctions_${props.LsName}`,
            JSON.stringify(junctions)
          );
        } else {
          if (junctions && junctions[questionDB]) {
            const LsTotal = localStorage.getItem(props.LsName);
            const curQuestionsObject = LsTotal ? JSON.parse(LsTotal) : null;

            const indexOfItem = questions.findIndex(
              (e) => e.questionDB === questionDB
            );

            const plusIndexes = junctions[questionDB];
            questions
              .slice(indexOfItem, indexOfItem + plusIndexes)
              .forEach((e) => {
                if (e.multiSelect && e.multiSelect?.length > 0) {
                  e.multiSelect?.forEach((el) => {
                    delete curQuestionsObject[el[0]];
                  });
                }
                e.questionDB !== questionDB
                  ? delete curQuestionsObject[e.questionDB]
                  : curQuestionsObject;
                if (junctions[e.questionDB]) {
                  delete junctions[e.questionDB];
                }
              });

            localStorage.setItem(
              props.LsName,
              JSON.stringify(curQuestionsObject)
            );
            delete junctions[questionDB];
            localStorage.setItem(
              `junctions_${props.LsName}`,
              JSON.stringify(junctions)
            );
          }
        }

        if (skipAmount) {
          localStorage.setItem(
            `to_${skip}_${props.LsName}`,
            JSON.stringify(skipAmount)
          );
        } else {
          localStorage.removeItem(`to_${skip}_${props.LsName}`);
        }
      }

      props.paginate(1 + (skipAmount ? skipAmount : 0));
    } catch (err) {
      console.log(err);
      return undefined;
    }
  };

  const handleNumber = (
    e: Event & { submitter: HTMLElement } & {
      currentTarget: HTMLFormElement;
      target: Element;
    }
  ) => {
    e.preventDefault();

    let numberSchema;

    if (questionDB === "weight_amount") {
      if (metric()) {
        numberSchema = z
          .number({
            required_error: "Weight is required, 1-300 kilograms",
            invalid_type_error: "Weight must be a number only",
          })
          .max(300, "Maximum weight increase is 300 kilos")
          .min(1, "Minimum weight increase is 1 kilos")
          .int("Please provide whole number only (e.g 15, not 15.6)");
      } else {
        numberSchema = z
          .number({
            required_error: "Weight is required, 1-650 pounds",
            invalid_type_error: "Weight must be a number only",
          })
          .max(650, "Maximum weight increase is 650 pounds")
          .min(1, "Minimum weight increase is 1 pounds")
          .int("Please provide whole number only (e.g 15, not 15.6)");
      }
    } else {
      //TODO Maybe handle if age is smaller than onset
      numberSchema = z
        .number({
          required_error: "Age is required, 5-120",
          invalid_type_error: "Age must be a number only",
        })
        .max(110, "Maximum age is 110")
        .min(5, "Minimum age is 5")
        .int("Please provide whole number only (e.g 15, not 15.6)");
    }

    const result = numberSchema.safeParse(Number(number()));

    if (!result.success) {
      const formatted = result.error.format();
      setError(formatted._errors[0]);
    } else {
      handleSubmit({ [questionDB]: result.data });
      setError(null);
    }
  };

  const handleText = (
    e: Event & { submitter: HTMLElement } & {
      currentTarget: HTMLFormElement;
      target: Element;
    }
  ) => {
    e.preventDefault();

    const textFieldSchema = z
      .string()
      .trim()
      .max(600, "Your text is too long! (Max. 600 characters)")
      .min(4, 'Your text is too short, even "okay" is enough');

    const result = textFieldSchema.safeParse(text());

    if (!result.success) {
      const formatted = result.error.format();
      setError(formatted._errors[0]);
    } else {
      handleSubmit({ [questionDB]: result.data });
      setError(null);
    }
  };

  return (
    <Switch fallback={<div>Error</div>}>
      <Match when={questionType === "selection"}>
        <Box question={question}>
          <div class="flex flex-col items-center justify-end">
            <For each={selections} fallback={<div>No selection found</div>}>
              {(v) => (
                <div class="m-2">
                  <CustomButton
                    onClick={() => handleSubmit({ [questionDB]: v })}
                    class={
                      v === selection()
                        ? "bg-green-500 hover:bg-green-600 focus:bg-green-500 active:bg-green-600"
                        : ""
                    }
                  >
                    {firstLetterUpperCase(v)}
                  </CustomButton>
                </div>
              )}
            </For>
          </div>
        </Box>
      </Match>
      <Match when={questionType === "unknown"}>
        <Box question={question}>
          <div class="flex flex-col items-center justify-end">
            <For
              each={["yes", "no", "unknown"]}
              fallback={<div>No selection found</div>}
            >
              {(v) => (
                <div class="m-2">
                  <CustomButton
                    onClick={() => {
                      if (v === "no") {
                        handleSubmit(
                          { [questionDB]: v },
                          skip
                            ? questions.findIndex(
                                (e) => e.questionDB === skip
                              ) -
                                questions.findIndex(
                                  (e) => e.questionDB === questionDB
                                ) -
                                1
                            : undefined
                        );
                      } else {
                        handleSubmit({ [questionDB]: v });
                      }
                    }}
                    class={
                      v === selection()
                        ? "bg-green-500 hover:bg-green-600 focus:bg-green-500 active:bg-green-600"
                        : ""
                    }
                  >
                    {firstLetterUpperCase(v)}
                  </CustomButton>
                </div>
              )}
            </For>
          </div>
        </Box>
      </Match>
      <Match
        when={questionType === "integer" && questionDB === "weight_amount"}
      >
        <Box question={question}>
          <form onSubmit={handleNumber}>
            <div class="flex flex-col items-center justify-end">
              <input
                class="m-4 box-border p-4 focus-visible:outline-none"
                autocomplete="off"
                placeholder={`${
                  metric()
                    ? "Weight gain in kilograms"
                    : "Weight gain in pounds"
                }`}
                id="int"
                type="number"
                value={number()}
                onInput={(e) => {
                  setNumber(e.target.value);
                  setError(null);
                }}
              />
              <CustomButton
                onClick={() => setMetric(false)}
                class={
                  !metric()
                    ? "bg-green-500 hover:bg-green-600 focus:bg-green-500 active:bg-green-600"
                    : ""
                }
              >
                Imperial (lbs)
              </CustomButton>
              <CustomButton
                onClick={() => setMetric(true)}
                class={
                  metric()
                    ? "bg-green-500 hover:bg-green-600 focus:bg-green-500 active:bg-green-600"
                    : ""
                }
              >
                Metric (kg)
              </CustomButton>
              <CustomButton class="mt-12" type="submit">
                Next
              </CustomButton>
              <ModalPopUp message={error()} setMessage={setError} />
            </div>
          </form>
        </Box>
      </Match>

      <Match when={questionType === "integer"}>
        <Box question={question}>
          <form onSubmit={handleNumber}>
            <div class="flex flex-col items-center justify-end">
              {/*NOTE might want to do controlled inputs and not type="number"
               <input
                autocomplete="off"
                id="int"
                type="number"
                value={number()}
                onInput={(e) => {
                  e.currentTarget.value.match("^[0-9]*$")
                    ? setNumber(e.currentTarget.value)
                    : (e.currentTarget.value = number());
                  setError(null);
                }}
              /> */}
              <input
                class="m-4 box-border p-4 focus-visible:outline-none"
                placeholder="Age"
                autocomplete="off"
                id="int"
                type="number"
                value={number()}
                onInput={(e) => {
                  setNumber(e.target.value);
                  setError(null);
                }}
              />
              <CustomButton type="submit">Next</CustomButton>
              <ModalPopUp message={error()} setMessage={setError} />
            </div>
          </form>
        </Box>
      </Match>

      <Match when={questionType === "text"}>
        <Box question={question}>
          <ModalPopUp message={error()} setMessage={setError} />

          <form onSubmit={handleText}>
            <div class="flex flex-col items-center justify-end">
              <textarea
                rows={14}
                cols={30}
                class="m-4 box-border resize-none p-4 focus-visible:outline-none"
                placeholder="Text"
                autocomplete="off"
                id="int"
                value={text()}
                onInput={(e) => {
                  setText(e.target.value);
                  setError(null);
                }}
              />
              <CustomButton type="submit">Next</CustomButton>
            </div>
          </form>
        </Box>
      </Match>
      <Match when={questionType === "yesOrNo"}>
        <Box question={question}>
          <div class="flex items-center justify-end ">
            <CustomButton
              // TODO might better to use state of yesOrNO instead of valueOfLS
              class={
                yesOrNO() === true
                  ? "bg-green-500 p-5 hover:bg-green-600 focus:bg-green-500 active:bg-green-600"
                  : " p-5"
              }
              onClick={() => handleSubmit({ [questionDB]: true })}
            >
              Yes
            </CustomButton>
            <CustomButton
              class={
                yesOrNO() === false
                  ? "bg-green-500 p-5 hover:bg-green-600 focus:bg-green-500 active:bg-green-600"
                  : " p-5"
              }
              onClick={() =>
                handleSubmit(
                  { [questionDB]: false },
                  skip
                    ? questions.findIndex((e) => e.questionDB === skip) -
                        questions.findIndex(
                          (e) => e.questionDB === questionDB
                        ) -
                        1
                    : undefined
                )
              }
            >
              No
            </CustomButton>
          </div>
        </Box>
      </Match>
      <Match when={questionType === "multiSelect"}>
        <Box question={question}>
          <div class="flex flex-col items-center justify-end ">
            <ModalPopUp message={error()} setMessage={setError} />
            <For fallback={<div>Multiselect error</div>} each={multiSelect}>
              {(v) => (
                <>
                  <CustomButton
                    class={
                      multiSelections()[v[0]] === true
                        ? "bg-green-500 hover:bg-green-600 focus:bg-green-500 active:bg-green-600"
                        : ""
                    }
                    onClick={() => {
                      setMultiSelections(
                        multiSelections()[v[0]] === true
                          ? { ...multiSelections(), [v[0]]: false }
                          : { ...multiSelections(), [v[0]]: true }
                      );
                      setError(null);
                    }}
                  >
                    {v[1]}
                  </CustomButton>
                </>
              )}
            </For>
            <CustomButton
              class="mt-12"
              onClick={() => handleMultiSubmit(multiSelections())}
            >
              Next
            </CustomButton>
          </div>
        </Box>
      </Match>

      {/* TODO When you press submit something should happen */}
      <Match when={questionType === "submit"}>
        <Box question={question}>
          <CustomButton onClick={submitResults}>Submit</CustomButton>
        </Box>
      </Match>
    </Switch>
  );
};