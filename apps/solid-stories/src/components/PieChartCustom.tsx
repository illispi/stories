import { PieChart } from "chartist";
import { Component, onCleanup, onMount } from "solid-js";

const PieChartCustom: Component<{}> = (props) => {
  onMount(() => {
    new PieChart(
      "#chart",
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

  return <div id="chart" />;
};

export default PieChartCustom;
