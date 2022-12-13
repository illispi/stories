import { For, ParentComponent } from "solid-js";
import { createRouteData, useRouteData } from "solid-start";

export const routeData = () => {
  return createRouteData(async () => {
    const response = await fetch("http://127.0.0.1:4000/trpc/personalStats");

    return await response.json();
  });
};

const Stats: ParentComponent = () => {
  const personalStats = useRouteData<typeof routeData>();
  console.log(personalStats());

  if (personalStats.loading) {
    return <div>loading</div>;
  }

  return <p>{personalStats().result.data[0].describe_hospital}</p>;
};

export default Stats;
