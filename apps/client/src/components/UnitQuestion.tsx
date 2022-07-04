import React, { useEffect, useState } from "react";
import { personalQuestionsSchema, PersonalQuestions } from "zod-types";
import CustomButton from "./CustomButton";

//NOTE might need yes or no selection

export type QuestionType = "selection" | "integer" | "text" | "yesOrNo";

const Box: React.FC<{
  children: React.ReactNode;
  question: string;
}> = ({ children, question }) => {
  return (
    <div className="flex h-80  w-full flex-col items-center justify-start
    rounded-3xl bg-white shadow-xl shadow-slate-500 ">
      <div className="relative flex h-16 w-full items-center justify-center bg-blue-300 ">
        <label className="text-xl">{question}</label>
      </div>
      <div className="flex flex-grow items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export const UnitQuestion: React.FC<{
  setNav: React.Dispatch<React.SetStateAction<number>>;
  nav: number;
  question: string;
  question_db: keyof PersonalQuestions;
  questionType: QuestionType;
  selGender?: PersonalQuestions["gender"][];
  selCurrentMed?: PersonalQuestions["current_med"][];
  selPsychoLenght?: PersonalQuestions["length_of_psychosis"][];
  selQuitWhy?: PersonalQuestions["quitting_why"][];
  selSmokeAmount?: PersonalQuestions["smoking_amount"][];
  selWorstSymp?: PersonalQuestions["worst_symptom"][];
  setDirection: React.Dispatch<React.SetStateAction<number>>;
}> = ({ nav, setNav, setDirection, ...props }) => {
  //NOTE Do i need to validate?s
  //NOTE localstorage can only store strings, so numbers etc. have to be converted.

  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (value: string | null | number) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(props.question_db, serializedValue);
      setNav(() => nav + 1);
      setDirection(1);
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

  if (props.questionType === "selection") {
    const arr = [
      props.selCurrentMed,
      props.selGender,
      props.selPsychoLenght,
      props.selQuitWhy,
      props.selSmokeAmount,
      props.selWorstSymp,
    ];

    const selection = arr.find((v) => v !== undefined);

    if (!selection) {
      return null;
    }

    return (
      <Box question={props.question}>
        <div className="flex flex-col items-center justify-center">
          {selection.map((v) => (
            <div key={`keyDiv${props.question_db}${v}`} className="m-2">
              <CustomButton
                key={`key${props.question_db}${v}`}
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
  if (props.questionType === "integer") {
    return (
      <Box question={props.question}>
        <form onSubmit={handleNumber}>
          <div className="flex flex-col items-center justify-start">
            <input
              id="int"
              type="tel"
              value={value}
              className="border"
              onChange={(e) => setValue(e.target.value)}
            ></input>
            <CustomButton type="submit">Next</CustomButton>
            {error && <p>{error}</p>}
          </div>
        </form>
      </Box>
    );
  }
  if (props.questionType === "text") {
    return <h2>wip</h2>;
  }
  if (props.questionType === "yesOrNo") {
    return <h2>wip</h2>;
  }

  return null;
};
