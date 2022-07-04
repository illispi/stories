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
  direction: number;
  children: React.ReactNode;
}> = ({ children, direction }) => {
  return (
    <motion.div
      className="mw-8 absolute left-0 right-0 flex h-80 w-72 flex-col items-center justify-start
         overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-500"
      variants={variants}
      custom={direction}
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
