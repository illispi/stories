import {
  ArcElement,
  BarElement,
  BubbleDataPoint,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  Legend,
  LinearScale,
  ScatterDataPoint,
  Title,
  Tooltip,
} from "chart.js";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import type { NextPage } from "next";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { PersonalQuestions } from "zod-types";
import CustomButton from "../components/CustomButton";
import { trpc } from "../utils/trpc";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Context } from "chartjs-plugin-datalabels";
import useIntersectionObserver from "../customHooks/useIntersectionObserver";
import React from "react";
import useIntObsHtml from "../customHooks/useIntObsHtml";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/src/router";
import type { Db } from "../../../server/src/index";

type PreventDbTypeAutoDelete = Db; //NOTE this is here because trpc needs type Db from backend for some reason

type DataBackEnd = inferRouterOutputs<AppRouter>;
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

const DataContext: any = React.createContext(null);

const optionsDoughnut = {
  plugins: {
    datalabels: {
      textAlign: "center",
      formatter: (value: number, ctx: Context) => {
        let sum = 0;
        let dataArr = ctx.chart.data.datasets[0].data as number[]; //NOTE once again bit hacky
        dataArr.map((data) => {
          sum += data;
        });
        let percentage = ((value * 100) / sum).toFixed(0) + "%";
        return `${percentage}\n${ctx.chart.data.labels![ctx.dataIndex]}`;
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
  data: ChartData<
    "doughnut",
    (number | ScatterDataPoint | BubbleDataPoint | null)[],
    unknown
  >;
  keyOfObject?: string;
  header: string;
}) => {
  const [containerRef, isVisible, firstDraw] =
    useIntersectionObserver(intObsOptions);

  return (
    <>
      <h4 className="m-2 text-center text-xl underline underline-offset-8">{`${header}:`}</h4>
      <div className="mb-8 flex w-11/12 items-center justify-center lg:max-w-xs">
        <Doughnut
          ref={containerRef}
          data={data}
          options={optionsDoughnut}
          redraw={firstDraw ? false : isVisible}
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
  data?: ChartData<
    "bar",
    (number | ScatterDataPoint | BubbleDataPoint | null)[],
    unknown
  >;
  keyOfObject?: string;
  header: string;
}) => {
  const dataDefault = useContext(DataContext);
  const [containerRef, isVisible, firstDraw] =
    useIntersectionObserver(intObsOptions);

  return (
    <>
      <h4 className="m-2 text-center text-xl underline underline-offset-8">{`${header}:`}</h4>
      <div className="mb-8 h-64 w-11/12">
        <Bar
          ref={containerRef}
          data={data ? data : dataDefault}
          options={optionsDefault}
          redraw={firstDraw ? false : isVisible}
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
  data?: DataBackEnd["personalStats"];
  header: string;
  stat: keyof PersonalQuestions;
}) => {
  const dataDefault = useContext(DataContext);
  const [containerRef, isVisible, firstDraw] =
    useIntersectionObserver(intObsOptions);

  return (
    <>
      <h4 className="m-2 text-center text-xl underline underline-offset-8">{`${header}:`}</h4>
      <div className="z-10 mb-8 flex max-w-xs items-center justify-center bg-white">
        <Doughnut
          ref={containerRef}
          data={yesOrNoData(data ? data : dataDefault, stat, header)}
          options={optionsDoughnut}
          redraw={firstDraw ? false : isVisible}
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
  data?: DataBackEnd["personalStats"];
  keyOfObject: keyof PersonalQuestions;
  header: string;
}) => {
  //TODO show more doesnt currently take anywhere.
  const dataDefault = useContext(DataContext);
  const [containerRef, isVisible] = useIntObsHtml(intObsOptions);
  const arr = (data ? data : (dataDefault as DataBackEnd["personalStats"])).map(
    (e) => e[keyOfObject]
  );

  return (
    <div className="flex w-11/12 max-w-xs flex-col items-center justify-center">
      <h4 className="m-2 text-center text-xl underline underline-offset-8">{`${header}:`}</h4>
      {arr.slice(0, 3).map((e, i) => (
        <m.div
          ref={containerRef}
          initial={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.2 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
          className="flex w-full max-w-xs flex-col items-center justify-center"
          key={`${keyOfObject}_${i}_div`}
        >
          <h5 className="m-2 font-bold" key={`${keyOfObject}_${i}_h5`}>
            {i + 1}.
          </h5>
          <p className="w-full" key={`${keyOfObject}_${i}`}>
            {e}
          </p>
        </m.div>
      ))}
      <Link href={`/${keyOfObject}`}>
        <div
          className="m-2 mb-8 rounded-full bg-blue-500 p-3
      font-semibold text-white transition-all hover:scale-110 hover:bg-blue-600 active:scale-110 active:bg-blue-600"
        >
          Show more
        </div>
      </Link>
    </div>
  );
};

const psyLengthByGender = (data: DataBackEnd["personalStats"]) => {
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
      <p className="mb-2 text-center text-xl underline underline-offset-8">
        {name}{" "}
      </p>
      <p className="rounded-full border-2 border-slate-400 p-2 text-center font-semibold">
        {item}
      </p>
    </div>
  );
};

const calcAverage = (
  data: DataBackEnd["personalStats"],
  key: keyof PersonalQuestions
) => {
  return data.reduce((a, b) => a + (b[key] as number), 0) / data.length;
};

const calcGenderShares = (data: DataBackEnd["personalStats"] | undefined) => {
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

const calcAgeOfResBrackets = (data: DataBackEnd["personalStats"]) => {
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
  data: DataBackEnd["personalStats"],
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

const dataOnset = (
  dataAgeOfOnset: DataBackEnd["ageOfOnsetPsychosisByGender"]
) => {
  return {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        label: "Average",
        data: [
          dataAgeOfOnset.maleAverage,
          dataAgeOfOnset.femaleAverage,
          dataAgeOfOnset.otherAverage,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Median",
        data: [
          dataAgeOfOnset.maleMedian,
          dataAgeOfOnset.femaleMedian,
          dataAgeOfOnset.otherMedian,
        ],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };
};

const dataGender = (data: DataBackEnd["personalStats"]) => {
  const gender = calcGenderShares(data);

  return {
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
};

const dataAgeOfRes = (data: DataBackEnd["personalStats"]) => {
  const labelsAgeGroup = [
    "0-9",
    "10-15",
    "16-20",
    "21-25",
    "26-30",
    "31-35",
    "36-80",
  ];

  const ageOfRes = calcAgeOfResBrackets(data);

  return {
    labels: labelsAgeGroup,
    datasets: [
      {
        label: "age of responses",
        data: ageOfRes
          ? (Object.keys(ageOfRes) as Array<keyof typeof ageOfRes>).map(
              (e) => ageOfRes[e]
            )
          : [null],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };
};

const dataPsyLength = (data: DataBackEnd["personalStats"]) => {
  return {
    labels: ["few weeks", "few months", "more than 6 months"],
    datasets: [
      {
        label: "Gender shares",
        data: [
          data.filter((e) => e.length_of_psychosis === "few weeks").length,
          data.filter((e) => e.length_of_psychosis === "few months").length,
          data.filter((e) => e.length_of_psychosis === "more than 6 months")
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
};

const Stats: NextPage = () => {
  const personalStats = trpc.personalStats.useQuery();
  const ageOfOnset = trpc.ageOfOnsetPsychosisByGender.useQuery();
  const psyLengthSplits = trpc.psyLengthByGender.useQuery();

  //TODO Is exclamanation mark good practice?

  const [byGenderPsyLength, setByGenderPsyLength] = useState(false);

  //NOTE consider percentage instead of number of age of responses below:

  if (!personalStats.data || !ageOfOnset.data || !psyLengthSplits.data) {
    return <h2>Loading...</h2>;
  }

  return (
    <DataContext.Provider value={personalStats.data}>
      <LazyMotion features={domAnimation}>
        <div className="mt-8 flex w-screen flex-col items-center justify-center">
          <div className="flex w-11/12 flex-col overflow-hidden rounded-3xl bg-white shadow-sm shadow-slate-500 lg:max-w-xl">
            <div className="flex h-16 items-center justify-center bg-blue-300 p-4">
              <h1 className="text-center font-semibold">Personal Stats</h1>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="z-[5] flex w-full flex-col items-center justify-center bg-white">
                <Item
                  name={"Total responses:"}
                  item={`${personalStats.data.length}`}
                ></Item>
                <Item
                  name={"Average age of responses:"}
                  item={`${calcAverage(
                    personalStats.data,
                    "current_age"
                  )} years old`}
                />

                <DoughnutComponent
                  data={dataGender(personalStats.data)}
                  header={"Gender shares"}
                ></DoughnutComponent>

                <CustomBar
                  data={dataAgeOfRes(personalStats.data)}
                  header={"Age of responses"}
                ></CustomBar>
                <CustomBar
                  data={dataOnset(ageOfOnset.data)}
                  header={"Age of onset"}
                ></CustomBar>

                {/*NOTE I could make this check for null but i dont think its necessary */}

                <DoughnutComponent
                  data={dataPsyLength(personalStats.data)}
                  header={"Length of first psychosis"}
                ></DoughnutComponent>
                <CustomButton
                  onClick={() => {
                    setByGenderPsyLength(byGenderPsyLength ? false : true);

                    /*  byGenderPsyLength
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
                      }, 100); */
                  }}
                >
                  {`${
                    !byGenderPsyLength ? "Show by gender" : "Close by gender"
                  }`}
                </CustomButton>
              </div>

              <AnimatePresence>
                {byGenderPsyLength && (
                  <m.div
                    initial={{ opacity: 0, height: 0, y: -600 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -600 }}
                    transition={{ duration: 1 }}
                    className="z-[2] my-4 flex w-full flex-col items-center justify-center rounded-3xl border-2 border-gray-900 bg-gray-100"
                  >
                    <div className=" flex w-full flex-col items-center justify-center lg:max-w-xs">
                      <DoughnutComponent
                        data={psyLengthByGender(psyLengthSplits.data.maleSplit)}
                        header={"First psychosis male"}
                      ></DoughnutComponent>

                      <DoughnutComponent
                        data={psyLengthByGender(
                          psyLengthSplits.data.femaleSplit
                        )}
                        header={"First psychosis female"}
                      ></DoughnutComponent>

                      <DoughnutComponent
                        data={psyLengthByGender(
                          psyLengthSplits.data.otherSplit
                        )}
                        header={"First psychosis other"}
                      ></DoughnutComponent>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>

              <YesOrNoComponent
                stat={"hospitalized_on_first"}
                header={"Hospitalized on first psychosis"}
              ></YesOrNoComponent>

              <YesOrNoComponent
                stat={"hospital_satisfaction"}
                header={"Were satisfied with hospital care"}
              ></YesOrNoComponent>
              <TextComponent
                keyOfObject={"describe_hospital"}
                header={"Hospital care description"}
              ></TextComponent>

              <YesOrNoComponent
                stat={"care_after_hospital"}
                header={"Recieved care after hospitalization"}
              ></YesOrNoComponent>

              <TextComponent
                keyOfObject={"what_kind_of_care_after"}
                header={"People recieved care after"}
              ></TextComponent>

              <YesOrNoComponent
                stat={"after_hospital_satisfaction"}
                header={"Were satisifed with after hospitalization care"}
              ></YesOrNoComponent>
            </div>
          </div>
        </div>
      </LazyMotion>
    </DataContext.Provider>
  );
};

export default Stats;

//TODO replace motion.div etc. with m.div, reduces bundlesize
//NOTE is as number for instance good practice?
