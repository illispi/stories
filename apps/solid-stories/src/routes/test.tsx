import PieChartCustom from "~/components/PieChartCustom";

const Test = () => {
  return (
    <PieChartCustom data={{ labels: ["male", "female"], series: [5, 10] }} />
  );
};

export default Test;
