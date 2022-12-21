import { useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import PieChartCustom from "~/components/PieChartCustom";
import { test } from "~/routes/api/test";

export function routeData() {
  return createServerData$(async () => await test());
}

const Test = () => {
  const data = useRouteData<typeof routeData>();
  console.log(data());

  return (
    <PieChartCustom data={{ labels: ["male", "female"], series: [5, 10] }} />
  );
};

export default Test;
