import type { Component } from "solid-js";
import { A } from "solid-start";

const Questionares: Component = () => {
  return (
    <div class="flex h-screen flex-col items-center justify-around">
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href="/questionares/personalQuestions"
      >
        Personal questions
      </A>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href="/questionares/theirQuestions"
      >
        Their questions
      </A>
    </div>
  );
};

export default Questionares;
