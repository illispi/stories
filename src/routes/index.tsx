import { route } from "routes-gen";
import type { Component } from "solid-js";
import { A } from "solid-start";

const Home: Component = () => {
  return (
    <div class="grid w-full grid-cols-1 justify-items-center lg:grid-cols-2">
      <div class="col-span-2 row-span-2 flex w-full items-center justify-center bg-gradient-angle from-blue-400 to-fuchsia-600 ">
        <div class="grid grid-cols-1 items-center justify-items-center lg:grid-cols-2 xl:w-9/12">
          <h1 class="m-12 max-w-sm text-center font-mono text-2xl text-white md:text-3xl lg:text-4xl 2xl:max-w-2xl 2xl:text-6xl">
            User poll & shared articles about schizophrenia
          </h1>
          <img
            class="md:w-7/12 lg:w-11/12"
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
