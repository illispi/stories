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

const Box: React.FC<{
  children: React.ReactNode;
  question: string;
}> = ({ children, question }) => {
  return (
    <div>
      <div className="relative flex h-16 w-80 items-center justify-center bg-blue-300 ">
        <label className="text-xl">{question}</label>
      </div>
      <div className="flex flex-grow items-center justify-center">
        {children}
      </div>
    </div>
  );
};

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

const questions = [
  {
    question: "What is your gender?",
    questionType: "selection",
    question_db: "gender",
    selections: ["female", "male", "other"],
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
}> = ({ nav, setNav }) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [[page, direction], setPage] = useState([0, 0]);
  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleSubmit = (value: string | null | number) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(questions[page].question_db, serializedValue);
      setNav(() => nav + 1);
      paginate(1);
    } catch (err) {
      console.log(err);
      return undefined;
    }
  };

  const validateInt = (value: string) => {
    return /^(0|[1-9]\d*)$/.test(value);
  };

  const handleNumber = (e) => {
    e.preventDefault();
    //TODO cant be too old validation
    if (validateInt(value)) {
      handleSubmit(value);
      setError(null);
    } else {
      setError("Please provide whole numbers only");
    }
  };

  return (
    <>
      {nav === 0 ? <h2>loading...</h2> : null}

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          className="absolute left-0 right-0"
          variants={variants}
          custom={direction}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1.2 }}
        >
          {questions[page].questionType === "selection" && (
            <Box question={`${page + 1}. ${questions[page].question}`}>
              <div className="flex flex-col items-center justify-center">
                {questions[page].selections?.map((v) => (
                  <div
                    key={`keyDiv${questions[page].question_db}${v}`}
                    className="m-2"
                  >
                    <CustomButton
                      key={`key${questions[page].question_db}${v}`}
                      onClick={() => handleSubmit(v)}
                    >
                      {v}
                    </CustomButton>
                  </div>
                ))}
              </div>
            </Box>
          )}

          {questions[page].questionType === "integer" && (
            <Box question={questions[page].question}>
              <form onSubmit={handleNumber}>
                <div className="flex flex-col items-center justify-start">
                  <input
                    id="int"
                    type="tel"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  ></input>
                  <CustomButton type="submit">Next</CustomButton>
                  {error && <p>{error}</p>}
                </div>
              </form>
            </Box>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="fixed bottom-0">
        <CustomButton
          type="button"
          onClick={() => {
            setNav(() => (nav === 1 ? 1 : nav - 1));
            paginate(-1);
          }}
        >
          Previous
        </CustomButton>
        <div className="mb-6"></div>
      </div>
    </>
  );
};

const PersonalQuestions = () => {
  const [nav, setNav] = useState<number>(0);

  useEffect(() => {
    const pageNav = parseInt(localStorage.getItem("nav") ?? "1");
    if (nav <= 0) {
      setNav(pageNav === 0 ? 1 : pageNav);
    } else {
      localStorage.setItem("nav", nav.toString());
    }
  }, [nav]);

  return <Questions nav={nav} setNav={setNav}></Questions>;
};

export default PersonalQuestions;
