import { dir } from "console";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import CustomButton from "../components/CustomButton";
import QuestionTransition from "../components/QuestionTransition";
// import { personalQuestionsSchema, PersonalQuestions } from "zod-types";
import { UnitQuestion } from "../components/UnitQuestion";

//TODO indiviual things are saved to local storage and then you combine them and send to server

//TODO for selections find a way to remove duplicates and somehow get types to js.

//NOTE is this the best way to center absolute children on fixed parent

//TODO find a way to reduce repetition with animatePrescence

const Questions: React.FC<{
  nav: number;
  setNav: React.Dispatch<React.SetStateAction<number>>;
  setDirection: React.Dispatch<React.SetStateAction<number>>;
  direction: number;
}> = ({ nav, setNav, setDirection, direction }) => {
  return (
    <>
      {nav === 0 ? <h2>loading...</h2> : null}
      {/* <motion.div className="relative flex h-screen flex-row items-center justify-center"> */}
      <AnimatePresence initial={false} custom={direction}>
        {nav === 1 ? (
          <QuestionTransition key="1" direction={direction}>
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

        {nav === 2 ? (
          <QuestionTransition key="2" direction={direction}>
            <UnitQuestion
              setNav={setNav}
              nav={nav}
              setDirection={setDirection}
              question="How old are you?"
              questionType="integer"
              question_db="current_age"
            ></UnitQuestion>
          </QuestionTransition>
        ) : null}
      </AnimatePresence>
      {/* </motion.div> */}
    </>
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
    <div className=" relative flex h-screen w-screen flex-col items-center justify-center">
      <Questions
        nav={nav}
        setNav={setNav}
        setDirection={setDirection}
        direction={direction}
      ></Questions>
      <div className="fixed bottom-0">
        <CustomButton
          type="button"
          onClick={() => {
            setNav(() => (nav === 1 ? 1 : nav - 1));
            setDirection(-1);
          }}
        >
          Previous
        </CustomButton>
        <div className="mb-6"></div>
      </div>
    </div>
  );
};

export default PersonalQuestions;
