import React, { useContext, useState } from "react";
import { paginationContext } from "../pages/personalQuestions";
import CustomButton from "./CustomButton";
import { QuestionPersonal, questions } from "../utils/personalQuestionsArr";
import Error from "./Error";

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

interface KeysValues {
  key: QuestionPersonal["questionDB"];
  value: string;
}

export const UnitQuestion: React.FC<{
  content: QuestionPersonal;
}> = ({ content }) => {
  //NOTE Do i need to validate?s
  //NOTE localstorage can only store strings, so numbers etc. have to be converted.

  const { question, questionDB, questionType, selections, multiSelect, skip } =
    content;
  const { paginate } = useContext(paginationContext);
  //BUG does this need to be inside useEffect?
  const allLsKeyValues: KeysValues[] = questions.map((e) =>
    Object.create({
      key: e.questionDB,
      value: JSON.parse(localStorage.getItem(e.questionDB) ?? '""'),
    })
  );

  const valueOfLS =
    allLsKeyValues.find((e) => e.key === questionDB)?.value ?? "";

  const [number, setNumber] = useState(() =>
    valueOfLS !== "" ? valueOfLS : ""
  );
  const [text, setText] = useState(() => (valueOfLS !== "" ? valueOfLS : ""));
  const [error, setError] = useState<string | null>(null);
  const [multiSelections, setMultiSelections] = useState<string[] | null>(
    () =>
      multiSelect
        ?.filter((e) => localStorage.getItem(e[0]) === "true")
        .map((e) => e[0]) ?? null
  );

  const [yesOrNO, setYesOrNO] = useState(() =>
    valueOfLS !== "" ? valueOfLS : ""
  );
  const [selection, setSelection] = useState(() =>
    valueOfLS !== "" ? valueOfLS : ""
  );

  //BUG in the above maybe you should parse before compare?

  const handleMultiSubmit = (values: string[] | null) => {
    if (values?.length === 0) {
      setError("Please select at least one option");
    } else {
      setError(null);
      try {
        //TODO clear all values on previous gesture
        multiSelect?.forEach((e) => localStorage.removeItem(e[0]));
        values?.forEach((e) => localStorage.setItem(e, "true"));

        paginate(1);
      } catch (err) {
        console.log(err);
        return undefined;
      }
    }
  };

  const handleSubmit = (
    value: string | null | number | boolean,
    skipAmount?: number
  ) => {
    try {
      setSelection(value);
      setYesOrNO(value);
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(questionDB, serializedValue);
      if (skipAmount !== 0) {
        localStorage.setItem(`from_${skip}`, `${skipAmount}`);
      } else {
        localStorage.removeItem(`from_${skip}`);
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
      handleSubmit(number);
      setError(null);
    } else {
      setError("Please provide whole numbers only");
    }
  };

  const handleText = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.length < 1000 && text.length !== 0) {
      handleSubmit(text);
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
                onClick={() => handleSubmit(v)}
                className={
                  v === selection
                    ? `bg-green-500 hover:bg-green-600 active:bg-green-600`
                    : ""
                }
              >
                {v}
              </CustomButton>
            </div>
          ))}
        </div>
      </Box>
    );
  }
  if (questionType === "integer") {
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
            onClick={() => handleSubmit(true, 0)}
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
                false,
                skip
                  ? questions.findIndex((e) => e.questionDB === skip) -
                      questions.findIndex((e) => e.questionDB === questionDB) -
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
                multiSelections?.find((e) => e === v[0])
                  ? "bg-green-500 hover:bg-green-600 active:bg-green-600"
                  : ""
              }
              onClick={() => {
                setMultiSelections(() =>
                  multiSelections?.find((e) => e === v[0])
                    ? multiSelections.filter((e) => e !== v[0])
                    : multiSelections!.concat(v[0])
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
