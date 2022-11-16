import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import type { NextPage } from "next";
import Link from "next/link";
import { useContext, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { PersonalQuestions } from "zod-types";
import CustomButton from "../components/CustomButton";
import { trpc } from "../utils/trpc";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Context } from "chartjs-plugin-datalabels";
import useIntersectionObserver from "../customHooks/useIntersectionObserver";
import React from "react";

/* export const getStaticProps: GetStaticProps = async () => {
  const ssg = await createSSGHelpers({
    router: appRouter, //This app router is in fastify
    ctx: await createContext(),
  });

  await ssg.fetchQuery("personalStats");
  await ssg.fetchQuery("ageOfOnsetPsychosisByGender");
  await ssg.fetchQuery("PsyLengthByGender");

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
};
 */
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

ChartJS.register(ChartDataLabels);

ChartJS.defaults.set("plugins.datalabels", {
  font: { weight: "bold", size: 16 },
  color: "#000000",
});

const optionsDoughnut = {
  plugins: {
    datalabels: {
      textAlign: "center",
      formatter: (value, ctx: Context) => {
        let sum = 0;
        let dataArr = ctx.chart.data.datasets[0].data;
        dataArr.map((data) => {
          sum += data;
        });
        let percentage = ((value * 100) / sum).toFixed(0) + "%";
        return `${percentage}\n${ctx.chart.data.labels[ctx.dataIndex]}`;
      },
    },
  },
};

//NOTE getting trpc types out of nextjs page component

const intObsOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.2,
};

const DoughnutComponent = ({
  data,
  keyOfObject,
  header,
}: {
  data: any;
  keyOfObject?: string;
  header: string;
}) => {
  const [containerRef, isVisible] = useIntersectionObserver(intObsOptions);

  return (
    <>
      <h4 className="m-2 text-center text-lg">{`${header}:`}</h4>
      <div className="flex max-w-xs items-center justify-center">
        <Doughnut
          ref={containerRef}
          data={data}
          options={optionsDoughnut}
          redraw={isVisible}
        />
      </div>
    </>
  );
};

const CustomBar = ({
  data,
  keyOfObject,
  header,
}: {
  data: any;
  keyOfObject?: string;
  header: string;
}) => {
  const [containerRef, isVisible] = useIntersectionObserver(intObsOptions);

  return (
    <>
      <h4 className="m-2 text-center text-lg">{`${header}:`}</h4>
      <div className="h-64 w-11/12">
        <Bar
          ref={containerRef}
          data={data}
          options={optionsDefault}
          redraw={isVisible}
        />
      </div>
    </>
  );
};

const YesOrNoComponent = ({
  data,
  header,
  stat,
}: {
  data: any;
  header: string;
  stat: keyof PersonalQuestions;
}) => {
  const [containerRef, isVisible] = useIntersectionObserver(intObsOptions);

  return (
    <>
      <h4 className="m-2 text-center text-lg">{`${header}:`}</h4>
      <div className="flex max-w-xs items-center justify-center">
        <Doughnut
          ref={containerRef}
          data={yesOrNoData(data, stat, header)}
          options={optionsDoughnut}
          redraw={isVisible}
        />
      </div>
    </>
  );
};

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

  //TODO show more doesnt currently take anywhere.

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
        <div
          className="m-2 rounded-full bg-blue-500 p-3 font-semibold
      text-white transition-all hover:scale-110 hover:bg-blue-600 active:scale-110 active:bg-blue-600"
        >
          Show more
        </div>
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

const yesOrNoData = (
  data: any,
  stat: keyof PersonalQuestions,
  header: string
) => {
  return {
    labels: ["Yes", "No"],
    datasets: [
      {
        label: header,
        data: [
          data.filter((e) => e[stat] === true).length,
          data.filter((e) => e[stat] === false).length,
        ],
        backgroundColor: ["rgba(54, 162, 235, 0.2)", "rgba(255, 99, 132, 0.2)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };
};

const optionsDefault = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
};

const Stats: NextPage = () => {
  const personalStats = trpc.personalStats.useQuery();
  const ageOfOnset = trpc.ageOfOnsetPsychosisByGender.useQuery();
  const psyLengthSplits = trpc.psyLengthByGender.useQuery();

  //NOTE does this need to be state since I am not updating?

  const [gender, setGender] = useState(
    () => calcGenderShares(personalStats.data) //TODO how do i import this type
  );
  const [ageOfRes, setAgeOfRes] = useState(() =>
    calcAgeOfResBrackets(personalStats.data)
  );

  const [byGenderPsyLength, setByGenderPsyLength] = useState(false);

  const [containerRef, isVisible] = useIntersectionObserver(intObsOptions);

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

  const dataAgeOfRes = {
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

          <DoughnutComponent
            data={dataGender}
            header={"Gender shares"}
          ></DoughnutComponent>

          <CustomBar
            data={dataAgeOfRes}
            header={"Age of responses"}
          ></CustomBar>
          <CustomBar data={dataOnset} header={"Age of onset"}></CustomBar>

          {/*NOTE I could make this check for null but i dont think its necessary */}

          <DoughnutComponent
            data={dataPsyLength}
            header={"Length of first psychosis"}
          ></DoughnutComponent>
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
          <LazyMotion features={domAnimation}>
            <AnimatePresence>
              {byGenderPsyLength && (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <DoughnutComponent
                    data={psyLengthByGender(psyLengthSplits.data?.maleSplit)}
                    header={"First psychosis male"}
                  ></DoughnutComponent>

                  <DoughnutComponent
                    data={psyLengthByGender(psyLengthSplits.data?.femaleSplit)}
                    header={"First psychosis female"}
                  ></DoughnutComponent>

                  <DoughnutComponent
                    data={psyLengthByGender(psyLengthSplits.data?.otherSplit)}
                    header={"First psychosis other"}
                  ></DoughnutComponent>
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>

          <YesOrNoComponent
            data={personalStats.data}
            stat={"hospitalized_on_first"}
            header={"Hospitalized on first psychosis"}
          ></YesOrNoComponent>

          <YesOrNoComponent
            data={personalStats.data}
            stat={"hospital_satisfaction"}
            header={"Were satisfied with hospital care"}
          ></YesOrNoComponent>
          <TextComponent
            data={personalStats.data}
            keyOfObject={"describe_hospital"}
            header={"Hospital care description:"}
          ></TextComponent>

          <YesOrNoComponent
            data={personalStats.data}
            stat={"care_after_hospital"}
            header={"Recieved care after hospitalization"}
          ></YesOrNoComponent>
        </div>
      </div>
    </div>
  );
};

export default Stats;

//TODO replace motion.div etc. with m.div, reduces bundlesize
//TODO test if extra chartjs comps add to bundlesize
