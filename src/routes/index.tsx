import { route } from "routes-gen";
import type { Component } from "solid-js";
import { A } from "solid-start";

const Home: Component = () => {
  return (
    <div class="grid w-full grid-cols-1 justify-items-center lg:grid-cols-2">
      <div class="col-span-2 row-span-2 h-[66vh] w-full bg-gradient-angle from-blue-400 to-fuchsia-600 ">
        <div class="flex h-full flex-col items-center justify-evenly lg:flex-row">
          <h1 class="text-center text-2xl text-white lg:w-4/12 lg:text-4xl">
            User poll & shared articles about schizophrenia
          </h1>
          <img
            class="w-full max-w-sm lg:max-w-xl"
            src="/hero_image.png"
            alt="Picture of poll"
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
        href={route("/stats/pollResults")}
      >
        Stats
      </A>
    </div>
  );
};

export default Home;
