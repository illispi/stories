import React, { useContext, useState } from "react";
import { paginationContext } from "../pages/personalQuestions";
import CustomButton from "./CustomButton";
import {
  QuestionPersonal,
  questions,
  questions as questionsArr,
} from "../utils/personalQuestionsArr";
import Error from "./Error";
import { PersonalQuestions } from "zod-types";

//NOTE might need yes or no selection

const Box: React.FC<{
  children: React.ReactNode;
  question: string;
}> = ({ children, question }) => {
  return (
    <div className="flex flex-grow flex-col">
      <div className="flex h-24 w-80 items-center justify-center bg-blue-300 p-8">
        <label className=" text-center font-semibold">{question}</label>
      </div>
      <div className="relative flex flex-grow flex-col items-center justify-start overflow-hidden overflow-y-auto">
        <div className="absolute my-2 flex w-72 flex-col items-center justify-end ">
          {children}
        </div>
      </div>
    </div>
  );
};

const firstLetterUpperCase = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const LsName = "personalQuestions";

export const UnitQuestion: React.FC<{
  content: QuestionPersonal;
}> = ({ content }) => {
  //NOTE Do i need to validate?s
  //NOTE localstorage can only store strings, so numbers etc. have to be converted.

  const { question, questionDB, questionType, selections, multiSelect, skip } =
    content;
  const { paginate } = useContext(paginationContext);
  //BUG does this need to be inside useEffect?

  const questionsLs: PersonalQuestions = JSON.parse(
    localStorage.getItem(LsName) ?? "{}"
  );

  const valueOfLS = questionsLs[questionDB] ?? "";

  const multiSelInit: () => {} = () => {
    const selectionsObj = multiSelect
      ?.map((e) => e[0])
      .reduce(
        (acc, curr) => (
          curr in questionsLs && (acc[curr] = questionsLs[curr]), acc
        ),
        {}
      );

    if (Object.keys(selectionsObj ? selectionsObj : {}).length === 0) {
      return multiSelect?.reduce(
        (acc, curr) => ((acc[curr[0]] = false), acc),
        {}
      );
    }
    return selectionsObj;
  };

  const [number, setNumber] = useState(() => valueOfLS);
  const [text, setText] = useState(() => valueOfLS);
  const [error, setError] = useState<string | null>(null);

  const [multiSelections, setMultiSelections] = useState(() => multiSelInit());

  const [yesOrNO, setYesOrNO] = useState(() => valueOfLS);
  const [selection, setSelection] = useState(() => valueOfLS);

  const [metric, setMetric] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem("system") ?? '"true"')
  );

  //BUG in the above maybe you should parse before compare?

  const handleMultiSubmit = (values: {}) => {
    if (
      Object.keys(values).filter((e) => values[e] === false).length ===
      multiSelect?.map((e) => e[0]).length
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

        paginate(1);
      } catch (err) {
        console.log(err);
        return undefined;
      }
    }
  };

  const handleSubmit = (value: {}, skipAmount?: number) => {
    try {
      if (questionDB === "weight_amount") {
        localStorage.setItem("system", JSON.stringify(metric));
      }
      if (
        questionDB === "weight_amount" &&
        !metric &&
        typeof value === "string"
      ) {
        value = { [questionDB]: Math.floor(parseInt(value) * 0.45359237) };
      }
      setSelection(value[questionDB]);
      setYesOrNO(value[questionDB]);
      localStorage.setItem(
        LsName,
        JSON.stringify({ ...questionsLs, ...value })
      );
      let currentSkips = JSON.parse(
        localStorage.getItem("skipIncrement") ?? "{}"
      );

      if (questionType === "yesOrNo") {
        if (
          value[questionDB] === true &&
          typeof value[questionDB] === "boolean" &&
          skip
        ) {
          currentSkips = { ...currentSkips, [questionDB]: -1 };
        } else {
          const itemsToRemove = localStorage.getItem(`skipIncrement`)
            ? JSON.parse(localStorage.getItem(`skipIncrement`))
            : null;

          if (itemsToRemove[questionDB]) {
            let curQuestionsObject = localStorage.getItem(LsName)
              ? JSON.parse(localStorage.getItem(LsName))
              : null;
            const indexOfItem = questions.findIndex(
              (e) => e.questionDB === questionDB
            );
            curQuestionsObject = curQuestionsObject
              ? questions
                  .slice(indexOfItem, indexOfItem + itemsToRemove)
                  .forEach((e) => delete curQuestionsObject[e.questionDB])
              : curQuestionsObject;

            localStorage.setItem(LsName, JSON.stringify(curQuestionsObject));
            delete currentSkips[questionDB];
            localStorage.setItem("skipIncrement", { ...currentSkips });
          }
        }

        if (skipAmount !== 0) {
          localStorage.setItem(`to_${skip}`, JSON.stringify(skipAmount));
        } else {
          localStorage.removeItem(`to_${skip}`);
        }
      }

      if (currentSkips && Object.keys(currentSkips).length !== 0) {
        Object.keys(currentSkips).forEach((key) => {
          currentSkips[key] <=
          questions.findIndex(
            (e) =>
              e.questionDB ===
              questions[questions.findIndex((e) => e.questionDB === key)].skip
          ) -
            questions.findIndex((e) => e.questionDB === key)
            ? (currentSkips[key] += 1)
            : currentSkips[key];
        });

        localStorage.setItem(
          "skipIncrement",
          JSON.stringify({ ...currentSkips })
        );
      }

      paginate(1 + (skipAmount ? skipAmount : 0));
    } catch (err) {
      console.log(err);
      return undefined;
    }
  };

  const validateInt = (value: string) => {
    return /^(0|[1-9]\d*)$/.test(value);
  };

  const handleNumber = (e: React.FormEvent) => {
    e.preventDefault();
    //TODO cant be too old validation

    if (validateInt(number)) {
      handleSubmit({ [questionDB]: number });
      setError(null);
    } else {
      setError("Please provide whole numbers only");
    }
  };

  const handleText = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.length < 1000 && text.length !== 0) {
      handleSubmit({ [questionDB]: text });
      setError(null);
    } else {
      if (text.length >= 1000) {
        setError("Maximum allowed character amount is 1000");
      } else {
        setError("Please provide some text");
      }
    }
  };

  if (questionType === "selection") {
    return (
      <Box question={question}>
        <div className="flex flex-col items-center justify-end ">
          {selections!.map((v) => (
            <div key={`keyDiv${questionDB}${v}`} className="m-2">
              <CustomButton
                key={`key${questionDB}${v}`}
                onClick={() => handleSubmit({ [questionDB]: v })}
                className={
                  v === selection
                    ? `bg-green-500 hover:bg-green-600 active:bg-green-600`
                    : ""
                }
              >
                {firstLetterUpperCase(v)}
              </CustomButton>
            </div>
          ))}
        </div>
      </Box>
    );
  }
  if (questionType === "integer") {
    if (questionDB === "weight_amount") {
      return (
        <Box question={question}>
          <form onSubmit={handleNumber}>
            <div className="flex flex-col items-center justify-end">
              <input
                id="int"
                type="tel"
                value={number}
                onChange={(e) => {
                  setNumber(e.target.value);
                  setError(null);
                }}
              ></input>
              <CustomButton
                onClick={() => setMetric(false)}
                className={
                  !metric
                    ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                    : ""
                }
              >
                Imperial (lbs)
              </CustomButton>
              <CustomButton
                onClick={() => setMetric(true)}
                className={
                  metric
                    ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                    : ""
                }
              >
                Metric (kg)
              </CustomButton>
              <CustomButton type="submit">Next</CustomButton>
              <Error setError={setError} message={error} />
            </div>
          </form>
        </Box>
      );
    }
    return (
      <Box question={question}>
        <form onSubmit={handleNumber}>
          <div className="flex flex-col items-center justify-end">
            <input
              id="int"
              type="tel"
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
                setError(null);
              }}
            ></input>
            <CustomButton type="submit">Next</CustomButton>
            <Error setError={setError} message={error} />
          </div>
        </form>
      </Box>
    );
  }
  if (questionType === "text") {
    return (
      <Box question={question}>
        <Error setError={setError} message={error} />
        <form onSubmit={handleText}>
          <div className="flex flex-col items-center justify-end">
            <input
              id="int"
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
              }}
            ></input>
            <CustomButton type="submit">Next</CustomButton>
          </div>
        </form>
      </Box>
    );
  }
  if (questionType === "yesOrNo") {
    return (
      <Box question={question}>
        <div className="flex items-center justify-end ">
          <CustomButton
            // TODO might better to use state of yesOrNO instead of valueOfLS
            className={
              yesOrNO === true
                ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                : ""
            }
            onClick={() => handleSubmit({ [questionDB]: true })}
          >
            Yes
          </CustomButton>
          <CustomButton
            className={
              yesOrNO === false
                ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                : ""
            }
            onClick={() =>
              handleSubmit(
                { [questionDB]: false },
                skip
                  ? questionsArr.findIndex((e) => e.questionDB === skip) -
                      questionsArr.findIndex(
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
    );
  }

  if (questionType === "multiSelect") {
    return (
      <Box question={question}>
        <div className="flex flex-col items-center justify-end ">
          <Error setError={setError} message={error} />
          {multiSelect!.map((v) => (
            <CustomButton
              key={`key${questionDB}${v}`}
              className={
                multiSelections[v[0]] === true
                  ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                  : ""
              }
              onClick={() => {
                setMultiSelections(() =>
                  multiSelections[v[0]] === true
                    ? { ...multiSelections, [v[0]]: false }
                    : { ...multiSelections, [v[0]]: true }
                );
                setError(null);
              }}
            >
              {v[1]}
            </CustomButton>
          ))}
          <CustomButton onClick={() => handleMultiSubmit(multiSelections)}>
            Next
          </CustomButton>
        </div>
      </Box>
    );
  }

  return null;
};

//NOTE consider adding all keys to question: {object} instead of individually to localstorage
//BUG You have to clear if you go back and skip some question for example smoking amount
//NOTE see if you can fix these TS errors with utility types?
//TODO clear all answers
