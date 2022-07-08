import React, { useContext, useState } from "react";
import { paginationContext } from "../pages/personalQuestions";
import CustomButton from "./CustomButton";
import { QuestionPersonal, questions } from "../utils/personalQuestionsArr";

//NOTE might need yes or no selection

const Box: React.FC<{
  children: React.ReactNode;
  question: string;
}> = ({ children, question }) => {
  return (
    <div className="flex flex-grow flex-col">
      <div className="flex h-24 w-80 items-center justify-center bg-blue-300 p-8 ">
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

export const UnitQuestion: React.FC<{
  content: QuestionPersonal;
}> = ({ content }) => {
  //NOTE Do i need to validate?s
  //NOTE localstorage can only store strings, so numbers etc. have to be converted.

  const { question, questionDB, questionType, selections, multiSelect, skip } =
    content;
  const { paginate } = useContext(paginationContext);
  //BUG does this need to be inside useEffect?
  const allLsKeyValues = questions.map((e) => [
    e.questionDB,
    localStorage.getItem(e.questionDB),
  ]);

  const keyValueExists = allLsKeyValues.find((e) => e[0] === questionDB);
  let valueOfLS: string;
  if (keyValueExists) {
    if (keyValueExists[1]) {
      valueOfLS = keyValueExists[1].replace(/['"]+/g, "");
    } else {
      valueOfLS = "";
    }
  } else {
    //NOTE maybe should also accept null, see number useState
    valueOfLS = "";
  }

  const [number, setNumber] = useState(valueOfLS !== "" ? valueOfLS : "");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [multiSelections, setMultiSelections] = useState<string[]>([]);

  const handleMultiSubmit = (values: string[] | null) => {
    if (values?.length === 0) {
      setError("Please select at least one option");
    } else {
      setError(null);
      try {
        //TODO clear all values on previous gesture
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

  const handleNumber = (e) => {
    e.preventDefault();
    //TODO cant be too old validation
    if (validateInt(number)) {
      handleSubmit(number);
      setError(null);
    } else {
      setError("Please provide whole numbers only");
    }
  };

  const handleText = (e) => {
    e.preventDefault();
    if (text.length < 1000) {
      handleSubmit(text);
      setError(null);
    }
    if (text.length >= 1000) {
      setError("Maximum allowed character amount is 1000");
    } else {
      setError("Please provide some text");
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
                className={v === valueOfLS ? `bg-green-500` : ""}
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
              onChange={(e) => setNumber(e.target.value)}
            ></input>
            <CustomButton type="submit">Next</CustomButton>
            {error && <p>{error}</p>}
          </div>
        </form>
      </Box>
    );
  }
  if (questionType === "text") {
    return (
      <Box question={question}>
        <form onSubmit={handleText}>
          <div className="flex flex-col items-center justify-end">
            <input
              id="int"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></input>
            <CustomButton type="submit">Next</CustomButton>
            {error && <p>{error}</p>}
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
            className={valueOfLS === "true" ? "bg-red-500" : ""}
            onClick={() => handleSubmit(true, 0)}
          >
            Yes
          </CustomButton>
          <CustomButton
            className={valueOfLS === "false" ? "bg-red-500" : ""}
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
          {error ?? <p>{error}</p>}
          {multiSelect!.map((v) => (
            <CustomButton
              key={`key${questionDB}${v}`}
              className="m-2"
              onClick={() => setMultiSelections(multiSelections!.concat(v[0]))}
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
