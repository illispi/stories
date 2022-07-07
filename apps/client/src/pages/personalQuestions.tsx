import { dir } from "console";
import { AnimatePresence, motion } from "framer-motion";
import React, { useContext, useEffect, useState } from "react";
import CustomButton from "../components/CustomButton";
import QuestionTransition from "../components/QuestionTransition";
// import { personalQuestionsSchema, PersonalQuestions } from "zod-types";
import { UnitQuestion } from "../components/UnitQuestion";

import { questions } from "../utils/personalQuestionsArr";

//TODO indiviual things are saved to local storage and then you combine them and send to server

//TODO for selections find a way to remove duplicates and somehow get types to js.

//NOTE is this the best way to center absolute children on fixed parent

//TODO find a way to reduce repetition with animatePrescence

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
        <div className="fixed top-0 mt-4">
          {/* TODO you have have skip multiple back as well */}
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
