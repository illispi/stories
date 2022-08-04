import { dir } from "console";
import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { parse } from "path";
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

const Counter = () => {
  const { page } = useContext(paginationContext);

  return (
    <div className="my-4 flex max-h-12 items-center justify-center rounded-lg bg-blue-300 shadow-md">
      <h3 className="p-6 text-lg font-semibold">{`${Math.floor(
        ((page + 1) / questions.length) * 100
      )}%`}</h3>
    </div>
  );
};

const Questions: React.FC<{}> = ({}) => {
  const { direction, page, paginate } = useContext(paginationContext);

  if (page < 0) {
    return <h2>loading...</h2>;
  }

  if (page === questions.length) {
    return <h2>done</h2>;
  }

  return (
    <>
      {page < 0 ? (
        <h2>loading...</h2>
      ) : (
        <div className="relative z-0 flex h-4/6 max-h-[600px] w-11/12 max-w-xs flex-col items-center justify-center">
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
      localStorage.setItem("page", JSON.stringify(page));
    }
  }, [page]);

  return (
    <div>
      <Head>
        <title>Questionare</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <paginationContext.Provider value={{ page, direction, paginate }}>
        <div className="flex h-screen flex-col items-center justify-start">
          {/* BUG cant have hard coded widths */}
          <div className="flex h-1/6 w-[320px] items-end justify-between p-2">
            <Counter />
            <CustomButton
              type="button"
              className="my-4 max-h-12"
              onClick={() => {
                if (page >= 0) {
                  const skipAmount = localStorage.getItem(
                    `to_${questions[page].questionDB}`
                  );

                  paginate(skipAmount ? -1 - JSON.parse(skipAmount) : -1);
                }
              }}
            >
              Previous
            </CustomButton>
          </div>

          <Questions></Questions>
          <div className="mb-10"></div>
        </div>
      </paginationContext.Provider>
    </div>
  );
};

export default PersonalQuestions;

//BUG initially mobile site is too long and for example navbar is scrollable
