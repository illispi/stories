import { dir } from "console";
import { AnimatePresence, motion } from "framer-motion";
import React, { useContext, useEffect, useState } from "react";
import CustomButton from "../components/CustomButton";
import QuestionTransition from "../components/QuestionTransition";
// import { personalQuestionsSchema, PersonalQuestions } from "zod-types";
import { UnitQuestion } from "../components/UnitQuestion";
import { PersonalQuestions } from "zod-types";

//TODO indiviual things are saved to local storage and then you combine them and send to server

//TODO for selections find a way to remove duplicates and somehow get types to js.

//NOTE is this the best way to center absolute children on fixed parent

//TODO find a way to reduce repetition with animatePrescence

export interface QuestionPersonal {
  question: string;
  questionType: "selection" | "integer" | "text" | "yesOrNo";
  questionDB: keyof PersonalQuestions;
  selections?: string[];
}

const questions: QuestionPersonal[] = [
  {
    question: "What is your gender?",
    questionType: "selection",
    questionDB: "gender",
    selections: ["female", "male", "other"],
  },
  {
    question: "How old are you?",
    questionType: "integer",
    questionDB: "current_age",
  },
  {
    question: "What age were you on first psychosis?",
    questionType: "integer",
    questionDB: "age_of_onset",
  },
  {
    question: "How long did the first psychosis last",
    questionType: "selection",
    questionDB: "length_of_psychosis",
    selections: ["few weeks", "few months", "more than 6 months"],
  },
  {
    question: "What medication do you use?",
    questionType: "selection",
    questionDB: "current_med",
    selections: [
      "risperidone (Risperdal)",
      "quetiapine (Seroquel)",
      "olanzapine (Zyprexa)",
      "ziprasidone (Zeldox)",
      "paliperidone (Invega)",
      "aripiprazole (Abilify)",
      "clozapine (Clozaril)",
      "other",
    ],
  },
];

//NOTE just copy selections from migrations, unless it becomes too long for box

const Questions: React.FC<{}> = ({}) => {
  const { direction, page, paginate } = useContext(paginationContext);

  return (
    <>
      {page < 0 ? (
        <h2>loading...</h2>
      ) : (
        <div className="fixed left-1/2 top-1/2 flex translate-x-1/2 translate-y-1/2 flex-row items-center justify-center">
          <AnimatePresence custom={direction}>
            <QuestionTransition key={page} direction={direction}>
              <UnitQuestion key={page} content={questions[page]}></UnitQuestion>
            </QuestionTransition>
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export const paginationContext = React.createContext({
  page: -1,
  direction: 0,
  paginate: (newDirection: number): void => void 0,
});

const PersonalQuestions = () => {
  const [[page, direction], setPage] = useState([-1, 1]);
  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    const pageNav = parseInt(localStorage.getItem("page") ?? "0");
    if (page < 0) {
      setPage([pageNav === 0 ? 0 : pageNav, 1]);
    } else {
      localStorage.setItem("page", page.toString());
    }
  }, [page]);

  return (
    <paginationContext.Provider value={{ page, direction, paginate }}>
      <div className="flex h-screen flex-col items-center justify-center">
        <Questions></Questions>
        <div className="fixed bottom-0">
          <CustomButton
            type="button"
            onClick={() => {
              if (page >= 0) {
                paginate(-1);
              }
            }}
          >
            Previous
          </CustomButton>
          <div className="mb-6"></div>
        </div>
      </div>
    </paginationContext.Provider>
  );
};

export default PersonalQuestions;
