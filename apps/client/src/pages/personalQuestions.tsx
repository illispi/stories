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
  selections: string[];
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
    selections: ["female", "male", "other"],
  },
];

//NOTE just copy selections from migrations, unless it becomes too long for box

const Questions: React.FC<{}> = ({}) => {
  const { direction, page, paginate } = useContext(paginationContext);

  console.log(page);

  return (
    <>
      {page < 0 ? (
        <h2>loading...</h2>
      ) : (
        <AnimatePresence initial={false} custom={direction}>
          <QuestionTransition key={page} direction={direction}>
            <UnitQuestion key={page} content={questions[page]}></UnitQuestion>
          </QuestionTransition>
        </AnimatePresence>
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
      <div className=" relative flex h-screen w-screen flex-col items-center justify-center">
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
