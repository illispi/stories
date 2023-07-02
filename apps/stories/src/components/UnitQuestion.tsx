import { createEffect, ParentComponent } from "solid-js";
import { createSignal, For, Match, Switch } from "solid-js";
import type { QuestionPersonal } from "~/data/personalQuestionsArr";
import { questions } from "~/data/personalQuestionsArr";
import { postPersonalStats } from "~/server/mutations";
import type { PersonalQuestions } from "~/types/zodFromTypes";
import CustomButton from "./CustomButton";
import ModalPopUp from "./ModalPopUp";

const Box: ParentComponent<{ question: string }> = (props) => {
  return (
    <div class="flex grow flex-col">
      <div class="flex h-24 w-80 items-center justify-center bg-blue-300 p-8">
        <label class=" text-center font-semibold">{props.question}</label>
      </div>
      <div class="relative flex grow flex-col items-center justify-start overflow-hidden overflow-y-auto">
        <div class="absolute my-2 flex w-72 flex-col items-center justify-end ">
          {props.children}
        </div>
      </div>
    </div>
  );
};

const firstLetterUpperCase = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const LsName = "personalQuestions";

export const UnitQuestion: ParentComponent<{
  content: QuestionPersonal;
  paginate: (newDirection: number) => void;
}> = (props) => {
  const sendStatsPersonal = postPersonalStats();

  const {
    question,
    questionDB,
    questionType,
    selections,
    multiSelect,
    skip,
  } = props.content;

  const questionsLs: PersonalQuestions = JSON.parse(
    localStorage.getItem(LsName) ?? "{}"
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

    sendStatsPersonal.mutateAsync(questionsLs);
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
          LsName,
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
        LsName,
        JSON.stringify({ ...questionsLs, ...value })
      );
      const LsExistsJunctions = localStorage.getItem("junctions");
      let junctions: Record<keyof PersonalQuestions, number> = LsExistsJunctions
        ? JSON.parse(LsExistsJunctions)
        : null;

      if (questionType === "yesOrNo") {
        if (
          value[questionDB] === true &&
          typeof value[questionDB] === "boolean" &&
          skip
        ) {
          junctions = {
            ...junctions,
            [questionDB]:
              questions.findIndex((e) => e.questionDB === skip) -
              questions.findIndex((e) => e.questionDB === questionDB),
          };
          localStorage.setItem("junctions", JSON.stringify(junctions));
        } else {
          if (junctions && junctions[questionDB]) {
            const LsTotal = localStorage.getItem(LsName);
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

            localStorage.setItem(LsName, JSON.stringify(curQuestionsObject));
            delete junctions[questionDB];
            localStorage.setItem("junctions", JSON.stringify(junctions));
          }
        }

        if (skipAmount) {
          localStorage.setItem(`to_${skip}`, JSON.stringify(skipAmount));
        } else {
          localStorage.removeItem(`to_${skip}`);
        }
      }

      props.paginate(1 + (skipAmount ? skipAmount : 0));
    } catch (err) {
      console.log(err);
      return undefined;
    }
  };

  const validateInt = (value: string) => {
    return /^(0|[1-9]\d*)$/.test(value);
  };

  const handleNumber = (e) => {
    e.preventDefault();
    //TODO cant be too old validation

    if (validateInt(number())) {
      handleSubmit({ [questionDB]: number() });
      setError(null);
    } else {
      setError("Please provide whole numbers only");
    }
  };

  const handleText = (e) => {
    e.preventDefault();
    if (text().length < 1000 && text().length !== 0) {
      handleSubmit({ [questionDB]: text() });
      setError(null);
    } else {
      if (text().length >= 1000) {
        setError("Maximum allowed character amount is 1000");
      } else {
        setError("Please provide some text");
      }
    }
  };

  return (
    <Switch fallback={<div>Error</div>}>
      <Match when={questionType === "selection"}>
        <Box question={question}>
          <div class="flex flex-col items-center justify-end ">
            <For each={selections} fallback={<div>No selection found</div>}>
              {(v) => (
                <div class="m-2">
                  <CustomButton
                    onClick={() => handleSubmit({ [questionDB]: v })}
                    class={
                      v === selection()
                        ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
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
                id="int"
                type="tel"
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
                    ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                    : ""
                }
              >
                Imperial (lbs)
              </CustomButton>
              <CustomButton
                onClick={() => setMetric(true)}
                class={
                  metric()
                    ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                    : ""
                }
              >
                Metric (kg)
              </CustomButton>
              <CustomButton type="submit">Next</CustomButton>
              <ModalPopUp message={error()} setMessage={setError} />
            </div>
          </form>
        </Box>
      </Match>

      <Match when={questionType === "integer"}>
        <Box question={question}>
          <form onSubmit={handleNumber}>
            <div class="flex flex-col items-center justify-end">
              <input
                id="int"
                type="tel"
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
              <input
                id="int"
                type="text"
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
        {" "}
        <Box question={question}>
          <div class="flex items-center justify-end ">
            <CustomButton
              // TODO might better to use state of yesOrNO instead of valueOfLS
              class={
                yesOrNO() === true
                  ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                  : ""
              }
              onClick={() => handleSubmit({ [questionDB]: true })}
            >
              Yes
            </CustomButton>
            <CustomButton
              class={
                yesOrNO() === false
                  ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                  : ""
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
                        ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
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
            <CustomButton onClick={() => handleMultiSubmit(multiSelections())}>
              Next
            </CustomButton>
          </div>
        </Box>
      </Match>
      <Match when={questionType === "submit"}>
        <Box question={question}>
          <CustomButton onClick={submitResults}>Submit</CustomButton>
        </Box>
      </Match>
    </Switch>
  );
};
