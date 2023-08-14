import { route } from "routes-gen";
import type { Component } from "solid-js";
import { A } from "solid-start";

const Home: Component = () => {
  return (
    <div class="grid w-full grid-cols-1 justify-items-center lg:grid-cols-2">
      <div class="col-span-2 row-span-2 flex w-full items-center justify-center bg-gradient-angle from-blue-400 to-fuchsia-500 ">
        <div class="grid grid-cols-1 items-center justify-items-center lg:grid-cols-2 xl:max-w-[1800px]">
          <h1 class="mb-12 mt-24 max-w-md text-center font-mono text-3xl text-white lg:hidden">
            User poll & shared articles about schizophrenia
          </h1>
          <div class="my-64 hidden h-5/6 flex-col justify-evenly lg:flex">
            <h1 class="m-12 text-center font-mono text-white lg:text-4xl 2xl:max-w-4xl 2xl:text-5xl">
              User poll & shared articles about schizophrenia
            </h1>
            <div class="m-12 flex items-center justify-center">
              <A
                class="m-8 w-1/2 rounded-full border border-fuchsia-400 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-400 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
                href={route("/questionares")}
              >
                Take poll
              </A>
              <A
                class="m-8 w-1/2 rounded-full border border-fuchsia-400 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-400 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
                href={route("/questionares")}
              >
                Share article
              </A>
            </div>
          </div>
          <div class="grid w-full auto-cols-max grid-flow-col justify-items-center gap-8 overflow-x-auto p-8 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-2 lg:gap-12 lg:p-12">
            <img
              class="max-h-96 rounded-3xl border border-fuchsia-400 shadow-lg shadow-fuchsia-400"
              src="/first.png"
              alt="Picture of poll"
            />
            <img
              class="max-h-96 rounded-3xl border border-fuchsia-400 shadow-lg shadow-fuchsia-400"
              src="/second.png"
              alt="Picture of poll"
            />
            <img
              class="col-span-2 max-h-96 rounded-3xl border border-fuchsia-400 shadow-lg shadow-fuchsia-400"
              src="/third.png"
              alt="Picture of poll"
            />
          </div>
          <div class="my-16 flex w-full max-w-md items-center justify-center gap-4 p-6 lg:hidden">
            <A
              // eslint-disable-next-line tailwindcss/no-custom-classname
              class="flex-1 rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
              href={route("/questionares")}
            >
              Take poll
            </A>
            <A
              // eslint-disable-next-line tailwindcss/no-custom-classname
              class="flex-1 rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
              href={route("/questionares")}
            >
              Share article
            </A>
          </div>
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
        href={route("/compare")}
      >
        Compare
      </A>

      <A
        noScroll={true}
        class="duration-200 ease-out active:scale-125"
        href={route("/pollResults")}
      >
        Stats
      </A>
    </div>
  );
};

export default Home;
