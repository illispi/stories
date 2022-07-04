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
      opacity: 0,
      x: direction < 0 ? 300 : -300,
    };
  },
};

const QuestionTransition: React.FC<{
  direction: number;
  nav:number;
  children: React.ReactNode;
}> = ({ children, direction,nav }) => {
  return (
    <motion.div
    className="absolute w-72"
    key={nav}
    custom={direction}
    variants={variants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 1.2 }}
     
    >
      {children}
    </motion.div>
  );
};

export default QuestionTransition;
