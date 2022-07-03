import React, { useEffect, useState } from "react";
import { personalQuestionsSchema, PersonalQuestions } from "zod-types";

//NOTE might need yes or no selection

type QuestionType = "selection" | "integer" | "text" | "yesOrNo";

const Absolute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <div className="absolute flex w-80 translate-x-[-50%] translate-y-[-50%] flex-col items-center justify-center">
      {children}
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
      <Absolute>
        <label className="mb-8">{props.question}</label>
        {selection.map((v) => (
          <button
            key={`key${props.question_db}${v}`}
            onClick={() => handleSubmit(v)}
          >
            {v}
          </button>
        ))}
      </Absolute>
    );
  }
  if (props.questionType === "integer") {
    return (
      <Absolute>
        <form onSubmit={handleNumber}>
          <div className="flex flex-col items-center justify-center">
            <label className="mb-8" htmlFor="int">
              {props.question}
            </label>
            <input
              id="int"
              type="tel"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            ></input>
            <button type="submit">Next</button>
            {error && <p>{error}</p>}
          </div>
        </form>
      </Absolute>
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
