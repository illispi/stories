import React, { useState } from "react";
// import { personalQuestionsSchema, PersonalQuestions } from "zod-types";
import { UnitQuestion } from "../components/UnitQuestion";

//TODO indiviual things are saved to local storage and then you combine them and send to server

//TODO for selections find a way to remove duplicates ans somehow get types to js.

const PersonalQuestions = () => {
  return (
    <div>
      <UnitQuestion
        question="What is your gender"
        questionType="selection"
        question_db="gender"
        selGender={["female", "male", "other"]}
      ></UnitQuestion>
      <UnitQuestion
        question="How old are you"
        questionType="integer"
        question_db="current_age"
      ></UnitQuestion>
    </div>
  );
};

export default PersonalQuestions;
