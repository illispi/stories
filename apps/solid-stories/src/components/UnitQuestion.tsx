import type { ParentComponent } from "solid-js";
import { createSignal, For, Match, Switch } from "solid-js";
import { createServerAction$ } from "solid-start/server";
import type { PersonalQuestions } from "zod-types";
import type { QuestionPersonal } from "~/data/personalQuestionsArr";
import { questions } from "~/data/personalQuestionsArr";
import { personalStatsPost } from "~/routes/api/server";
import CustomButton from "./CustomButton";
import ErrorCustom from "./ErrorCustom";

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
  const [sendingData, sendData] = createServerAction$(
    async (data: PersonalQuestions) => {
      await personalStatsPost(data);
    }
  );

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

    sendData(questionsLs);
  };

  const handleMultiSubmit = (values: Record<"children" | "after_hospital_satisfaction" | "age_of_onset" | "anhedonia" | "apathy" | "cannabis" | "care_after_hospital" | "cognitive_symptoms" | "cognitive_symptoms_description" | "current_age" | "current_med" | "describe_hospital" | "describe_prodromal_symptoms" | "efficacy_of_med" | "flat_expressions" | "friends" | "gained_weight" | "gender" | "goals_after" | "goals_changed" | "hospital_satisfaction" | "hospitalized_on_first" | "hospitalized_voluntarily" | "lack_of_motivation" | "length_of_psychosis" | "life_satisfaction" | "life_satisfaction_description" | "life_situation" | "negative_symptoms" | "no_interest_socially" | "not_have_schizophrenia" | "not_have_schizophrenia_description" | "other_help" | "partner" | "personality_after" | "personality_before" | "personality_changed" | "poverty_of_speech" | "prodromal_symptoms" | "psychosis_how_many" | "quitting" | "quitting_regret" | "quitting_what_happened" | "quitting_why" | "responded_to_telling" | "side_effs_dizziness" | "side_effs_movement_effects" | "side_effs_sedation" | "side_effs_sexual" | "side_effs_tardive" | "side_effs_weight_gain" | "smoking" | "smoking_amount" | "suicidal_thoughts" | "suicide_attempts" | "symptoms_delusions" | "symptoms_disorganized" | "symptoms_hallucinations" | "symptoms_paranoia" | "told_employer" | "told_family" | "told_friends" | "told_if_asked" | "told_nobody" | "weight_amount" | "what_kind_of_care_after" | "what_others_should_know" | "worst_symptom", boolean> | undefined) => {
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
          console.log(junctions, skipAmount, value, "here");

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
                    classChange={
                      v === selection()
                        ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                        : null
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
                /* type="tel"
                value={number()} */
                onInput={(e) => {
                  setNumber(e.target.value);
                  setError(null);
                }}
              />
              <CustomButton
                onClick={() => setMetric(false)}
                classChange={
                  !metric()
                    ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                    : null
                }
              >
                Imperial (lbs)
              </CustomButton>
              <CustomButton
                onClick={() => setMetric(true)}
                classChange={
                  metric()
                    ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                    : null
                }
              >
                Metric (kg)
              </CustomButton>
              <CustomButton type="submit">Next</CustomButton>
              <ErrorCustom setError={setError} message={error()} />
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
                /*  type="tel"
              value={number} */
                onInput={(e) => {
                  setNumber(e.target.value);
                  setError(null);
                }}
              />
              <CustomButton type="submit">Next</CustomButton>
              <ErrorCustom setError={setError} message={error()} />
            </div>
          </form>
        </Box>
      </Match>

      <Match when={questionType === "text"}>
        <Box question={question}>
          <ErrorCustom setError={setError} message={error()} />
          <form onSubmit={handleText}>
            <div class="flex flex-col items-center justify-end">
              <input
                id="int"
                type="text"
                /*  value={text} */
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
              classChange={
                yesOrNO() === true
                  ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                  : null
              }
              onClick={() => handleSubmit({ [questionDB]: true })}
            >
              Yes
            </CustomButton>
            <CustomButton
              classChange={
                yesOrNO() === false
                  ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                  : null
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
            <ErrorCustom setError={setError} message={error()} />
            <For fallback={<div>Multiselect error</div>} each={multiSelect}>
              {(v) => (
                <>
                  <CustomButton
                    classChange={
                      multiSelections()[v[0]] === true
                        ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                        : null
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
