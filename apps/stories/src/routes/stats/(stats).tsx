import type { Component } from "solid-js";
import { A } from "solid-start";

const Stats: Component = () => {
  return (
    <div class="flex h-screen flex-col items-center justify-around">
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href="/stats/personalStatsAll"
      >
        Personal Stats
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href="/stats/theirStatsAll"
      >
        Their Stats
      </A>
    </div>
  );
};

export default Stats;
