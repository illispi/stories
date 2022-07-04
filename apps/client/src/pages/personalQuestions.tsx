import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import CustomButton from "../components/CustomButton";
import QuestionTransition from "../components/QuestionTransition";
// import { personalQuestionsSchema, PersonalQuestions } from "zod-types";
import { QuestionType, UnitQuestion } from "../components/UnitQuestion";

//TODO indiviual things are saved to local storage and then you combine them and send to server

//TODO for selections find a way to remove duplicates and somehow get types to js.

//NOTE is this the best way to center absolute children on fixed parent

//TODO find a way to reduce repetition with animatePrescence
const q = [
  {}, // have to have blank here obj, since you force 'nav' to be 1, instead of 0
  {
    question: "What is your gender?",
    questionType: "selection",
    question_db: "gender",
    selGender: ["female", "male", "other"],
  },

  {
    question: "How old are you?",
    questionType: "integer",
    question_db: "current_age",
  },
];

const Questions: React.FC<{
  nav: number;
  setNav: React.Dispatch<React.SetStateAction<number>>;
  setDirection: React.Dispatch<React.SetStateAction<number>>;
  direction: number;
}> = ({ nav, setNav, setDirection, direction }) => {

  return (
    <>
      {nav === 0 ? (
        <h2>loading...</h2>
      ) : (
        <AnimatePresence initial={false} custom={direction}>
          <QuestionTransition nav={nav} direction={direction}>
            <UnitQuestion
              setNav={setNav}
              nav={nav}
              setDirection={setDirection}
              question={q[nav].question}
              questionType={q[nav].questionType as QuestionType}
              question_db={q[nav].question_db}
              selGender={q[nav].selGender}
            />
          </QuestionTransition>
        </AnimatePresence>
      )}
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
    <div className="relative flex h-screen w-screen flex-col items-center justify-center">
      <Questions
        nav={nav}
        setNav={setNav}
        setDirection={setDirection}
        direction={direction}
      />
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
