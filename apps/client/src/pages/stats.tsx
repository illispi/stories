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
import CustomButton from "../components/CustomButton";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const TextComponent = ({
  data,
  keyOfObject,
  header,
}: {
  data: any;
  keyOfObject: string;
  header: string;
}) => {
  const arr = data.map((e) => e[keyOfObject]);

  return (
    <div className="flex w-11/12 max-w-xs flex-col items-center justify-center">
      <h4 className="m-2 text-center text-lg">{header}</h4>
      {arr.slice(0, 3).map((e, i) => (
        <div
          className="flex w-full max-w-xs flex-col items-center justify-center"
          key={`${keyOfObject}_${i}_div`}
        >
          <h5 className="m-2 font-bold" key={`${keyOfObject}_${i}_h5`}>
            {i + 1}.
          </h5>
          <p className="w-full" key={`${keyOfObject}_${i}`}>
            {e}
          </p>
        </div>
      ))}
      <Link href={`/${keyOfObject}`}>
        <a
          className="m-2 rounded-full bg-blue-500 p-3 font-semibold
      text-white transition-all hover:scale-110 hover:bg-blue-600 active:scale-110 active:bg-blue-600"
        >
          Show more
        </a>
      </Link>
    </div>
  );
};

const psyLengthByGender = (data) => {
  const dataPsyLength = {
    labels: ["few weeks", "few months", "more than 6 months"],
    datasets: [
      {
        label: "Gender shares",
        data: [
          data?.filter((e) => e.length_of_psychosis === "few weeks").length,
          data?.filter((e) => e.length_of_psychosis === "few months").length,
          data?.filter((e) => e.length_of_psychosis === "more than 6 months")
            .length,
        ],
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
  return dataPsyLength;
};

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
  const psyLengthSplits = trpc.useQuery(["PsyLengthByGender"]);

  //NOTE does this need to be state since I am not updating?

  const [gender, setGender] = useState(
    () => calcGenderShares(personalStats.data) //TODO how do i import this type
  );
  const [ageOfRes, setAgeOfRes] = useState(() =>
    calcAgeOfResBrackets(personalStats.data)
  );

  const [byGenderPsyLength, setByGenderPsyLength] = useState(false);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  };

  const labelsAgeGroup = [
    "0-9",
    "10-15",
    "16-20",
    "21-25",
    "26-30",
    "31-35",
    "36-80",
  ];

  //NOTE consider percentage instead of number of age of responses below:

  const ageOfResdata = {
    labels: labelsAgeGroup,
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
        label: "Gender shares",
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

  const dataPsyLength = {
    labels: ["few weeks", "few months", "more than 6 months"],
    datasets: [
      {
        label: "Gender shares",
        data: [
          personalStats.data?.filter(
            (e) => e.length_of_psychosis === "few weeks"
          ).length,
          personalStats.data?.filter(
            (e) => e.length_of_psychosis === "few months"
          ).length,
          personalStats.data?.filter(
            (e) => e.length_of_psychosis === "more than 6 months"
          ).length,
        ],
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

  const dataHospitalizedFirst = {
    labels: ["Yes", "No"],
    datasets: [
      {
        label: "Hospitalization shares",
        data: [
          personalStats.data?.filter((e) => e.hospitalized_on_first === true)
            .length,
          personalStats.data?.filter((e) => e.hospitalized_on_first === false)
            .length,
        ],
        backgroundColor: ["rgba(54, 162, 235, 0.2)", "rgba(255, 99, 132, 0.2)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };
  const dataHospitalsSatisfaction = {
    labels: ["Yes", "No"],
    datasets: [
      {
        label: "Hospitalization shares",
        data: [
          personalStats.data?.filter((e) => e.hospital_satisfaction === true)
            .length,
          personalStats.data?.filter((e) => e.hospital_satisfaction === false)
            .length,
        ],
        backgroundColor: ["rgba(54, 162, 235, 0.2)", "rgba(255, 99, 132, 0.2)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const dataOnset = {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        label: "Average",
        data: [
          ageOfOnset.data?.maleAverage,
          ageOfOnset.data?.femaleAverage,
          ageOfOnset.data?.otherAverage,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Median",
        data: [
          ageOfOnset.data?.maleMedian,
          ageOfOnset.data?.femaleMedian,
          ageOfOnset.data?.otherMedian,
        ],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  if (!personalStats.data) {
    return <h2>Loading...</h2>;
  }

  console.log(personalStats.data);

  return (
    <div className="mt-8 flex w-screen flex-col items-center justify-center">
      <div className="flex w-11/12  max-w-xs flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 lg:max-w-xl">
        <div className="flex h-16 items-center justify-center bg-blue-300 p-4">
          <h1 className="text-center font-semibold">Personal Stats</h1>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Item
            name={"Total responses:"}
            item={`${personalStats.data.length}`}
          ></Item>
          <Item
            name={"Average age of responses:"}
            item={`${calcAverage(personalStats, "current_age")} years old`}
          />
          <h4 className="m-2 text-center text-lg">Gender shares:</h4>
          <div className="flex max-w-xs items-center justify-center">
            <Doughnut data={dataGender} />
          </div>
          <h4 className="m-2 text-center text-lg">Age of responses:</h4>
          <div className="h-64 w-11/12">
            <Bar data={ageOfResdata} options={options}></Bar>
          </div>

          {/*NOTE I could make this check for null but i dont think its necessary */}
          <h4 className="m-2 text-center text-lg">Age of onset:</h4>
          <div className="h-64 w-11/12">
            <Bar data={dataOnset} options={options}></Bar>
          </div>
          <h4 className="m-2 text-center text-lg">
            Length of first psychosis:
          </h4>
          <div className="flex max-w-xs items-center justify-center">
            <Doughnut data={dataPsyLength} />
          </div>
          <CustomButton
            onClick={() => {
              setByGenderPsyLength(byGenderPsyLength ? false : true);

              byGenderPsyLength
                ? setTimeout(() => {
                    window.scrollBy({
                      top: -250,
                      behavior: "smooth",
                    });
                  }, 100)
                : setTimeout(() => {
                    window.scrollBy({
                      top: 250,
                      behavior: "smooth",
                    });
                  }, 100);
            }}
          >
            {`${!byGenderPsyLength ? "Show by gender" : "Close by gender"}`}
          </CustomButton>

          <AnimatePresence>
            {byGenderPsyLength && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h4 className="m-2 text-center text-lg">
                  First psychosis male:
                </h4>
                <div className="flex max-w-xs items-center justify-center">
                  <Doughnut
                    data={psyLengthByGender(psyLengthSplits.data?.maleSplit)}
                  />
                </div>
                <h4 className="m-2 text-center text-lg">
                  First psychosis female:
                </h4>
                <div className="flex max-w-xs items-center justify-center">
                  <Doughnut
                    data={psyLengthByGender(psyLengthSplits.data?.femaleSplit)}
                  />
                </div>
                <h4 className="m-2 text-center text-lg">
                  First psychosis other:
                </h4>
                <div className="flex max-w-xs items-center justify-center">
                  <Doughnut
                    data={psyLengthByGender(psyLengthSplits.data?.otherSplit)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <h4 className="m-2 text-center text-lg">
            Hospitalized on first psychosis:
          </h4>
          <div className="flex max-w-xs items-center justify-center">
            <Doughnut data={dataHospitalizedFirst} />
          </div>
          <h4 className="m-2 text-center text-lg">
            Were satisfied with hospital care:
          </h4>
          <div className="flex max-w-xs items-center justify-center">
            <Doughnut data={dataHospitalsSatisfaction} />
          </div>
          <TextComponent
            data={personalStats.data}
            keyOfObject={"describe_hospital"}
            header={"hospital care description:"}
          ></TextComponent>
        </div>
      </div>
    </div>
  );
};

export default Stats;
