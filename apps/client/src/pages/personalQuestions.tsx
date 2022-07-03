import { dir } from "console";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import QuestionTransition from "../components/QuestionTransition";
// import { personalQuestionsSchema, PersonalQuestions } from "zod-types";
import { UnitQuestion } from "../components/UnitQuestion";

//TODO indiviual things are saved to local storage and then you combine them and send to server

//TODO for selections find a way to remove duplicates and somehow get types to js.

const Questions: React.FC<{
  nav: number;
  setNav: React.Dispatch<React.SetStateAction<number>>;
  setDirection: React.Dispatch<React.SetStateAction<number>>;
  direction: number;
}> = ({ nav, setNav, setDirection, direction }) => {
  return (
    <div>
      {nav === 0 ? <h2>loading...</h2> : null}
      <motion.div className="fixed left-1/2 flex h-36 translate-x-2/4 flex-row">
        <AnimatePresence
          exitBeforeEnter={true}
          initial={false}
          custom={direction}
        >
          {nav === 1 ? (
            <QuestionTransition direction={direction} questionKey="gender">
              <UnitQuestion
                setNav={setNav}
                nav={nav}
                setDirection={setDirection}
                question="What is your gender?"
                questionType="selection"
                question_db="gender"
                selGender={["female", "male", "other"]}
              ></UnitQuestion>
            </QuestionTransition>
          ) : null}
        </AnimatePresence>

        {/* <QuestionTransition
            direction={direction}
            questionId="current_age"
            isVisible={nav === 2 ? true : false}
          >
            <UnitQuestion
              setNav={setNav}
              nav={nav}
              setDirection={setDirection}
              question="How old are you"
              questionType="integer"
              question_db="current_age"
            ></UnitQuestion>
          </QuestionTransition> */}
        <AnimatePresence
          exitBeforeEnter={true}
          initial={false}
          custom={direction}
        >
          {nav === 2 ? (
            <QuestionTransition
              direction={direction}
              questionKey="after_hospital_satisfaction"
            >
              <UnitQuestion
                setNav={setNav}
                nav={nav}
                setDirection={setDirection}
                question="What is your gender?"
                questionType="selection"
                question_db="gender"
                selGender={["female", "male", "other"]}
              ></UnitQuestion>
            </QuestionTransition>
          ) : null}
        </AnimatePresence>

        <AnimatePresence
          exitBeforeEnter={true}
          initial={false}
          custom={direction}
        >
          {nav === 3 ? (
            <QuestionTransition
              direction={direction}
              questionKey="describe_prodromal_symptoms"
            >
              <UnitQuestion
                setNav={setNav}
                nav={nav}
                setDirection={setDirection}
                question="What is your gender?"
                questionType="selection"
                question_db="gender"
                selGender={["female", "male", "other"]}
              ></UnitQuestion>
            </QuestionTransition>
          ) : null}
        </AnimatePresence>
      </motion.div>
      <button
        className="fixed bottom-0"
        type="button"
        onClick={() => {
          setNav(() => (nav === 1 ? 1 : nav - 1));
          setDirection(-1);
        }}
      >
        back
      </button>
    </div>
  );
};

const PersonalQuestions = () => {
  const [nav, setNav] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);

  useEffect(() => {
    const pageNav = parseInt(localStorage.getItem("nav") ?? "1");
    if (nav <= 0) {
      setNav(pageNav === 0 ? 1 : pageNav);
    } else {
      localStorage.setItem("nav", nav.toString());
    }
  }, [nav]);

  return (
    <div className="flex items-center justify-center">
      <Questions
        nav={nav}
        setNav={setNav}
        setDirection={setDirection}
        direction={direction}
      ></Questions>
    </div>
  );
};

export default PersonalQuestions;
