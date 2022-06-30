import React from "react";
import { personalQuestionsSchema, PersonalQuestions } from "zod-types";

//NOTE might need yes or no selection

type QuestionType = "selection" | "integer" | "text";

export const UnitQuestion: React.FC<{
  question: string;
  question_db: keyof PersonalQuestions;
  questionType: QuestionType;
  selections?: string[];
}> = (props) => {
  //NOTE Do i need to validate?

  type QuestionPick = Pick<
    PersonalQuestions,
    typeof props.question_db
  >[typeof props.question_db];

  const handleSubmit = (value: QuestionPick) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(props.question_db, serializedValue);
    } catch (err) {
      console.log(err);
      return undefined;
    }
  };

  if (props.questionType === "selection") {
    return (
      <div>
        <h3>{props.question}</h3>
        {props.selections?.map((v) => (
          <button
            key={`key${props.question_db}${v}`}
            onClick={() => handleSubmit(v.toLowerCase())}
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

  return null;
};
