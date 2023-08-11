import { route } from "routes-gen";
import type { Component } from "solid-js";
import { A } from "solid-start";

const Stats: Component = () => {
  return (
    <div class="flex h-screen flex-col items-center justify-around">
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/stats/compare")}
      >
        Compare
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/stats/all")}
      >
        Stats
      </A>
    </div>
  );
};

export default Stats;
