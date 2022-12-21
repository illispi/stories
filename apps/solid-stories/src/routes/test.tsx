import { useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import PieChartCustom from "~/components/PieChartCustom";
import { personalStatsGet } from "~/routes/api/server";

export function routeData() {
  return createServerData$(async () => await personalStatsGet());
}

const Test = () => {
  const data = useRouteData<typeof routeData>();
  console.log(data());

  return (
    <PieChartCustom data={{ labels: ["male", "female"], series: [5, 10] }} />
  );
};

export default Test;
