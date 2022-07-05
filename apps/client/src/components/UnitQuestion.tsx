import React, { useContext, useState } from "react";
import { PersonalQuestions } from "zod-types";
import { paginationContext, QuestionPersonal } from "../pages/personalQuestions";
import CustomButton from "./CustomButton";

//NOTE might need yes or no selection

const Box: React.FC<{
  children: React.ReactNode;
  question: string;
}> = ({ children, question }) => {
  return (
    <div>
      <div className="relative flex h-16 w-80 items-center justify-center bg-blue-300 ">
        <label className="text-xl">{question}</label>
      </div>
      <div className="flex flex-grow items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export const UnitQuestion: React.FC<{
  content: QuestionPersonal;
}> = ({ content }) => {
  //NOTE Do i need to validate?s
  //NOTE localstorage can only store strings, so numbers etc. have to be converted.

  const { question, questionDB, questionType, selections } = content;
  const {paginate} = useContext(paginationContext)

  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (value: string | null | number) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(questionDB, serializedValue);
      paginate(1);
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
    if (validateInt(value)) {
      handleSubmit(value);
      setError(null);
    } else {
      setError("Please provide whole numbers only");
    }
  };

  if (questionType === "selection") {
    return (
      <Box question={question}>
        <div className="flex flex-col items-center justify-center">
          {selections.map((v) => (
            <div key={`keyDiv${questionDB}${v}`} className="m-2">
              <CustomButton
                key={`key${questionDB}${v}`}
                onClick={() => handleSubmit(v)}
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
          <div className="flex flex-col items-center justify-start">
            <input
              id="int"
              type="tel"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            ></input>
            <CustomButton type="submit">Next</CustomButton>
            {error && <p>{error}</p>}
          </div>
        </form>
      </Box>
    );
  }
  if (questionType === "text") {
    return <h2>wip</h2>;
  }
  if (questionType === "yesOrNo") {
    return <h2>wip</h2>;
  }

  return null;
};
