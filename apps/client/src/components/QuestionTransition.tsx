import React from "react";
import { motion } from "framer-motion";

const QuestionTransition = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 200 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    ></motion.div>
  );
};

export default QuestionTransition;
