import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import React from "react";
import { PersonalQuestions } from "zod-types";

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

const Stats: NextPage = () => {
  const personalStats = trpc.useQuery(["personalStats"]);

  const calcAverage = (
    arr: typeof personalStats,
    key: keyof PersonalQuestions
  ) => {
    return arr.data.reduce((a, b) => a + b[key], 0) / arr.data.length;
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
            name={"Gender proportions:"}
            item={`${calcAverage(personalStats, "current_age")} years old`}
          ></Item>
          <Item
            name={"Average age of responses:"}
            item={`${calcAverage(personalStats, "current_age")} years old`}
          />
        </div>
      </div>
    </div>
  );
};

export default Stats;
