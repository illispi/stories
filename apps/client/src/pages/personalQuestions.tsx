import React, { useState } from "react";
// import { personalQuestionsSchema, PersonalQuestions } from "zod-types";
import { UnitQuestion } from "../components/UnitQuestion";

//TODO indiviual things are saved to local storage and then you combine them and send to server

const PersonalQuestions = () => {
  return (
    <UnitQuestion
      question="What is your gender"
      questionType="selection"
      question_db="gender"
      selections={["Male", "Female", "Other"]}
    ></UnitQuestion>
  );
};

export default PersonalQuestions;
