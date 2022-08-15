import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import React from "react";

const Stats: NextPage = () => {
  const personalStats = trpc.useQuery(["personalStats"]);
  console.log(personalStats.data);

  return (
    <div>
      <p>Average age of responses:</p>
      <span>
        {personalStats.data?.reduce((a, b) => a + b.current_age, 0) /
          personalStats.data?.length}
      </span>
    </div>
  );
};

export default Stats;
