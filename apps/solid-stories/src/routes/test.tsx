import { Motion, Presence } from "@motionone/solid";
import { useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import PieChartCustom from "~/components/PieChartCustom";
import { personalStatsGet } from "~/routes/api/server";

const Test = () => {
  return (
    <Presence>
      <Motion.div
        class="fixed top-2 rounded-3xl border-4 border-red-600 bg-red-200 p-8 text-center shadow-xl"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <p>iifpowafopwa</p>
      </Motion.div>
    </Presence>
  );
};

export default Test;
