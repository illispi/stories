import React, { useEffect, useState } from "react";
import { personalQuestionsSchema, PersonalQuestions } from "zod-types";

//NOTE might need yes or no selection

type QuestionType = "selection" | "integer" | "text" | "yesOrNo";

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
      <div>
        <label>{props.question}</label>
        {selection.map((v) => (
          <button
            key={`key${props.question_db}${v}`}
            onClick={() => handleSubmit(v)}
          >
            {v}
          </button>
        ))}
      </div>
    );
  }
  if (props.questionType === "integer") {
    return (
      <div>
        <form onSubmit={handleNumber}>
          <label htmlFor="int">{props.question}</label>
          <input
            id="int"
            type="tel"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          ></input>
          <button type="submit">Next</button>
        </form>
        {error && <p>{error}</p>}
      </div>
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
