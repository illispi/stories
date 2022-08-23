import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import React, { useState } from "react";
import { PersonalQuestions } from "zod-types";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  BarElement,
  Title,
  CategoryScale,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

//TODO show on press vertical bar chart for age of onset by gender?

const Item = ({ name, item }: { name: string; item: string | number }) => {
  return (
    <div className="my-3 flex flex-col items-center justify-center">
      <p className="mb-2 text-center text-lg">{name} </p>
      <p className="rounded-full  border-2 border-slate-400 p-2 text-center font-semibold">
        {item}
      </p>
    </div>
  );
};

const calcAverage = (arr: any, key: keyof PersonalQuestions) => {
  return arr.data.reduce((a, b) => a + b[key], 0) / arr.data.length;
};

const calcGenderShares = (data) => {
  let genders = { male: 0, female: 0, other: 0 };
  data?.forEach((e) => {
    if (e.gender === "male") {
      genders.male++;
    } else if (e.gender === "female") {
      genders.female++;
    } else if (e.gender === "other") {
      genders.other++;
    }
  });
  return genders;
};

const calcAgeOfResBrackets = (data) => {
  let resBrackets = {
    b09: 0,
    b1015: 0,
    b1620: 0,
    b2125: 0,
    b2630: 0,
    b3135: 0,
    b3680: 0,
  };
  data?.forEach((e) => {
    if (e.current_age <= 10) {
      resBrackets.b09++;
    } else if (e.current_age >= 10 && e.current_age <= 15) {
      resBrackets.b1015++;
    } else if (e.current_age >= 16 && e.current_age <= 20) {
      resBrackets.b1620++;
    } else if (e.current_age >= 21 && e.current_age <= 25) {
      resBrackets.b2125++;
    } else if (e.current_age >= 26 && e.current_age <= 30) {
      resBrackets.b2630++;
    } else if (e.current_age >= 31 && e.current_age <= 35) {
      resBrackets.b3135++;
    } else if (e.current_age >= 36 && e.current_age <= 80) {
      resBrackets.b3680++;
    }
  });
  return resBrackets;
};

const Stats: NextPage = () => {
  const personalStats = trpc.useQuery(["personalStats"]);
  const ageOfOnset = trpc.useQuery(["ageOfOnsetPsychosisByGender"]);

  console.log(ageOfOnset.data);

  //NOTE does this need to be state since I am not updating?

  const [gender, setGender] = useState(
    () => calcGenderShares(personalStats.data) //TODO how do i import this type
  );
  const [ageOfRes, setAgeOfRes] = useState(() =>
    calcAgeOfResBrackets(personalStats.data)
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
      },
    },
  };

  const labels = ["0-9", "10-15", "16-20", "21-25", "26-30", "31-35", "36-80"];

  //NOTE consider percentage instead of number of age of responses below:

  const ageOfResdata = {
    labels,
    datasets: [
      {
        label: "age of responses",
        data: Object.keys(ageOfRes).map((e) => ageOfRes[e]),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

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

  console.log(personalStats.data);

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
          <h4 className="mb-2 text-center text-lg">Gender shares:</h4>
          <Doughnut data={dataGender} />
          <h4 className="mb-2 text-center text-lg">Age of responses:</h4>
          <div className="h-64">
            <Bar data={ageOfResdata} options={options}></Bar>
          </div>

          {/*NOTE I could make this check for null but i dont think its necessary */}
          <Item
            name={"Female onset average:"}
            item={`${ageOfOnset.data?.femaleAverage} years`}
          ></Item>
          <Item
            name={"Female onset median:"}
            item={`${ageOfOnset.data?.femaleMedian} years`}
          ></Item>
          <Item
            name={"Male onset average:"}
            item={`${ageOfOnset.data?.maleAverage} years`}
          ></Item>
          <Item
            name={"Male onset median:"}
            item={`${ageOfOnset.data?.maleMedian} years`}
          ></Item>
          <Item
            name={"Other onset average:"}
            item={`${ageOfOnset.data?.otherAverage} years`}
          ></Item>
          <Item
            name={"Other onset median:"}
            item={`${ageOfOnset.data?.otherMedian} years`}
          ></Item>
        </div>
      </div>
    </div>
  );
};

export default Stats;
