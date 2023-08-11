import { route } from "routes-gen";
import type { Component } from "solid-js";
import { A } from "solid-start";

const Home: Component = () => {
  return (
    <div class="grid w-full grid-cols-1 justify-items-center lg:grid-cols-2">
      <div class="col-span-2 row-span-2 h-[50vh] w-full bg-gradient-angle from-blue-400 to-fuchsia-600 ">
        <div class="flex h-full flex-col items-center justify-center lg:flex-row">
          <h1>Polls and shared articles about schizophrenia</h1>
          <img
            class=""
            src="/media/cc0-images/grapefruit-slice-332-332.jpg"
            alt="Picture of poll and articles"
          />
        </div>
      </div>
      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/questionares")}
      >
        Poll
      </A>
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

export default Home;
