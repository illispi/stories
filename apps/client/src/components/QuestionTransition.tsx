import React, { Children, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PersonalQuestions } from "zod-types";

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    };
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    };
  },
};

const QuestionTransition: React.FC<{
  isVisible: boolean;
  questionId: keyof PersonalQuestions;
  direction: number;
  children: React.ReactNode;
}> = ({ children, isVisible, questionId, direction }) => {
  return (
    <>
      {isVisible && (
        <motion.div
          variants={variants}
          key={`motion.nav${questionId}`}
          custom={direction}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {children}
        </motion.div>
      )}
    </>
  );
};

export default QuestionTransition;
