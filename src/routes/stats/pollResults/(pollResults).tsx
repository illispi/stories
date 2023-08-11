import { route } from "routes-gen";
import type { Component } from "solid-js";
import { A } from "solid-start";

const All: Component = () => {
  return (
    <div class="flex h-screen flex-col items-center justify-around">
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/stats/all/:allStats", { allStats: "Personal_questions" })}
      >
        Personal Stats
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/stats/all/:allStats", { allStats: "Their_questions" })}
      >
        Their Stats
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/stats/all/:allStats", {
          allStats: "Personal_questions",
          fakeOrReal: "fake",
        })}
      >
        Personal Stats fake
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/stats/all/:allStats", {
          allStats: "Their_questions",
          fakeOrReal: "fake",
        })}
      >
        Their Stats fake
      </A>
    </div>
  );
};

export default All;
