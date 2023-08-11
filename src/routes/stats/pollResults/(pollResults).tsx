import { route } from "routes-gen";
import type { Component } from "solid-js";
import { A } from "solid-start";

const All: Component = () => {
  return (
    <div class="flex h-screen flex-col items-center justify-around">
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/stats/pollResults/:pOrT/:fakeOrReal", {
          pOrT: "Personal_questions",
          fakeOrReal: "real"
        })}
      >
        Personal Stats
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/stats/pollResults/:pOrT/:fakeOrReal", {
          pOrT: "Their_questions",
          fakeOrReal: "real"
        })}
      >
        Their Stats
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/stats/pollResults/:pOrT/:fakeOrReal", {
          pOrT: "Personal_questions",
          fakeOrReal: "fake",
        })}
      >
        Personal Stats fake
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/stats/pollResults/:pOrT/:fakeOrReal", {
          pOrT: "Their_questions",
          fakeOrReal: "fake",
        })}
      >
        Their Stats fake
      </A>
    </div>
  );
};

export default All;
