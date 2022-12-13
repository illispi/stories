import { For, ParentComponent } from "solid-js";
import { createRouteData, useRouteData } from "solid-start";

export function routeData() {
  return createRouteData(async () => {
    const response = await fetch("http://127.0.0.1:4000/trpc/personalStats");

    return await response.json();
  });
}

const Stats: ParentComponent = () => {
  const personalStats = useRouteData<typeof routeData>();

  console.log(personalStats());

  return <p>{personalStats()}</p>;
};

export default Stats;
