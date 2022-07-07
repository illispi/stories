import { dir } from "console";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
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
        <div className="relative z-0 flex h-[29rem] max-w-xs flex-col items-center justify-center">
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
    <div>
      <Head>
        <title>Questionare</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <paginationContext.Provider value={{ page, direction, paginate }}>
        <div className="flex flex-col items-center justify-center">
          <div className="my-4">
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
          </div>
          <Questions></Questions>
        </div>
      </paginationContext.Provider>
    </div>
  );
};

export default PersonalQuestions;
