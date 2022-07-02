import React, { useEffect, useState } from "react";
// import { personalQuestionsSchema, PersonalQuestions } from "zod-types";
import { UnitQuestion } from "../components/UnitQuestion";

//TODO indiviual things are saved to local storage and then you combine them and send to server

//TODO for selections find a way to remove duplicates and somehow get types to js.

const Questions: React.FC<{
  nav: number;
  setNav: React.Dispatch<React.SetStateAction<number>>;
}> = ({ nav, setNav }) => {
  if (nav === 0) {
    return <h2>loading...</h2>;
  }

  if (nav === 1) {
    return (
      <UnitQuestion
        setNav={setNav}
        nav={nav}
        question="What is your gender"
        questionType="selection"
        question_db="gender"
        selGender={["female", "male", "other"]}
      ></UnitQuestion>
    );
  }
  if (nav === 2) {
    return (
      <UnitQuestion
        setNav={setNav}
        nav={nav}
        question="How old are you"
        questionType="integer"
        question_db="current_age"
      ></UnitQuestion>
    );
  }
  return null;
};

const PersonalQuestions = () => {
  const [nav, setNav] = useState<number>(0);

  useEffect(() => {
    const pageNav = localStorage.getItem("nav");
    if (pageNav) {
      if (parseInt(pageNav) > nav) {
        setNav(parseInt(pageNav));
      } else {
        localStorage.setItem("nav", nav.toString());
      }
    } else {
      localStorage.setItem("nav", nav.toString());
    }
  }, [nav]);

  return (
    <div>
      <Questions nav={nav} setNav={setNav}></Questions>
    </div>
  );
};

export default PersonalQuestions;
