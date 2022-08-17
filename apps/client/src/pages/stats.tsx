import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import React, { useState } from "react";
import { PersonalQuestions } from "zod-types";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const Item = ({ name, item }: { name: string; item: string | number }) => {
  return (
    <div className="my-3 flex flex-col items-center justify-center">
      <p className="mb-2 text-center text-lg">{name} </p>
      <p className="rounded-full  border-2 border-slate-400 p-4 text-center font-semibold">
        {item}
      </p>
    </div>
  );
};

const calcAverage = (arr: any, key: keyof PersonalQuestions) => {
  return arr.data.reduce((a, b) => a + b[key], 0) / arr.data.length;
};

const calcGenderProportions = (data) => {
  console.log(data, "here");

  let genders = { male: 0, female: 0, other: 0 };
  data?.forEach((e) => {
    if (e.gender === "male") {
      genders.male++;
    }
    if (e.gender === "female") {
      genders.female++;
    }
    if (e.gender === "other") {
      genders.other++;
    }
  });
  return genders;
};

const Stats: NextPage = () => {
  const personalStats = trpc.useQuery(["personalStats"]);

  const [gender, setGender] = useState(
    () => calcGenderProportions(personalStats.data) //TODO how do i import this type
  );

  console.log(gender);

  const dataGender = {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        label: "Gender proportions",
        data: [gender.male, gender.female, gender.other],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  if (!personalStats.data) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="mt-8 flex w-screen flex-col items-center justify-center">
      <div className="flex w-11/12  max-w-xs flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-500">
        <div className="flex h-16 items-center justify-center bg-blue-300 p-4">
          <h1 className="text-center font-semibold">Personal Stats</h1>
        </div>
        <div>
          <Item
            name={"Total responses:"}
            item={`${personalStats.data.length}`}
          ></Item>
          <Item
            name={"Average age of responses:"}
            item={`${calcAverage(personalStats, "current_age")} years old`}
          />
          <h4 className="mb-2 text-center text-lg">Genders proportions:</h4>
          <Doughnut data={dataGender} />
        </div>
      </div>
    </div>
  );
};

export default Stats;
