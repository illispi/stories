import React from "react";
import { personalQuestionsSchema, PersonalQuestions } from "zod-types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

//TODO indiviual things are saved to local storage and then you combine them and send to server

const PersonalQuestions = () => {
  //NOTE How to do this inside useForm<>?

  type returnType = Pick<PersonalQuestions, "gender">;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<returnType>({
    resolver: zodResolver(
      personalQuestionsSchema.pick({ gender: true }).required()
    ),
  });
  const onSubmit = (data: returnType) => console.log(data.gender);

  return (
    <div>
      <h3>What is your gender?</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <button {...register("gender")}>Male</button>
        <button {...register("gender")} value="female">
          Female
        </button>

        <button {...register("gender")}>Other</button>
      </form>
    </div>
  );
};

export default PersonalQuestions;
