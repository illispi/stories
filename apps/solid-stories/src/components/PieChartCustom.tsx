import { PieChart } from "chartist";
import { Component, onCleanup, onMount } from "solid-js";

const PieChartCustom: Component<{}> = (props) => {
  let pie: PieChart;
  const id = Math.floor(Math.random() * 100000000).toString();
  console.log(id);

  onMount(() => {
    pie = new PieChart(
      `#chart${id}`,
      {
        series: [20, 10, 30, 40],
      },
      {
        donut: true,
        donutWidth: 60,
        startAngle: 270,
        showLabel: true,
      }
    );
  });

  onCleanup(() => pie?.detach);

  return <div id={`chart${id}`} />;
};

export default PieChartCustom;
