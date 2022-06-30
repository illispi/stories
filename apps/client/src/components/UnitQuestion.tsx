import React from "react";
import { personalQuestionsSchema, PersonalQuestions } from "zod-types";

//NOTE might need yes or no selection

type QuestionType = "selection" | "integer" | "text" | "yesOrNo";

export const UnitQuestion: React.FC<{
  question: string;
  question_db: keyof PersonalQuestions;
  questionType: QuestionType;
  selGender?: PersonalQuestions["gender"][];
  selCurrentMed?: PersonalQuestions["current_med"][];
  selPsychoLenght?: PersonalQuestions["length_of_psychosis"][];
  selQuitWhy?: PersonalQuestions["quitting_why"][];
  selSmokeAmount?: PersonalQuestions["smoking_amount"][];
  selWorstSymp?: PersonalQuestions["worst_symptom"][];
}> = (props) => {
  //NOTE Do i need to validate?

  const handleSubmit = (value: string | null) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(props.question_db, serializedValue);
    } catch (err) {
      console.log(err);
      return undefined;
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
        <h3>{props.question}</h3>
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
    return <h2>wip</h2>;
  }
  if (props.questionType === "text") {
    return <h2>wip</h2>;
  }
  if (props.questionType === "yesOrNo") {
    return <h2>wip</h2>;
  }

  return null;
};
