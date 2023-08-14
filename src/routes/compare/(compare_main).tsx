import { route } from "routes-gen";
import type { Component } from "solid-js";
import { A } from "solid-start";

const All: Component = () => {
  return (
    <div class="flex h-screen flex-col items-center justify-around">
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/compare/:pOrT/:fOrT/compare", {
          pOrT: "Personal_questions",
          fOrT: "real",
        })}
      >
        Personal Stats
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/compare/:pOrT/:fOrT/compare", {
          pOrT: "Their_questions",
          fOrT: "real",
        })}
      >
        Their Stats
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/compare/:pOrT/:fOrT/compare", {
          pOrT: "Personal_questions",
          fOrT: "fake",
        })}
      >
        Personal Stats
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/compare/:pOrT/:fOrT/compare", {
          pOrT: "Their_questions",
          fOrT: "fake",
        })}
      >
        Their Stats
      </A>
    </div>
  );
};

export default All;