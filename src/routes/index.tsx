import { route } from "routes-gen";
import type { Component } from "solid-js";
import { A } from "solid-start";
import InfoBox from "~/components/InfoBox";
import img1 from "../pictures/first.png?w=400;500;700;900;1200&format=webp&as=srcset";
import img2 from "../pictures/second.png?w=400;500;700;900;1200&format=webp&as=srcset";
import img3 from "../pictures/third.png?w=400;500;700;900;1200&format=webp&as=srcset";

const Home: Component = () => {
  return (
    <div class="flex w-full flex-col items-center justify-center">
      <div class="col-span-2 row-span-2 flex w-full items-center justify-center bg-gradient-angle from-blue-500 to-fuchsia-500 ">
        <div class="grid grid-cols-1 items-center justify-items-center lg:grid-cols-2 xl:max-w-screen-2xl">
          <h1 class="mb-12 mt-24 max-w-md text-center font-mono text-3xl text-white lg:hidden">
            User poll & shared articles about schizophrenia
          </h1>
          <div class="my-32 hidden h-5/6 flex-col justify-evenly lg:flex">
            <h1 class="m-12 text-center font-mono text-white lg:text-4xl 2xl:max-w-4xl 2xl:text-5xl">
              User poll & shared articles about schizophrenia
            </h1>
            <div class="m-12 flex max-w-3xl items-center justify-center">
              <A
                class="m-8 flex-1 rounded-full border border-fuchsia-400 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-400 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
                href={route("/questionares/")}
                noScroll={false}
              >
                Take the poll
              </A>
              <A
                class="m-8 flex-1 rounded-full border border-fuchsia-400 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-400 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
                href={route("/articles/")}
                noScroll={false}
              >
                Share article
              </A>
            </div>
          </div>
          <div class="grid w-full auto-cols-max grid-flow-col justify-items-center gap-8 overflow-x-auto p-8 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-2 lg:gap-12 lg:p-12">
            <img
              class="max-h-96 rounded-3xl border border-fuchsia-400 shadow-lg shadow-fuchsia-400"
              // src="/first.png"
              srcset={img1}
              alt="Picture of poll"
            />

            <img
              class="max-h-96 rounded-3xl border border-fuchsia-400 shadow-lg shadow-fuchsia-400"
              // src="/second.png"
              srcset={img2}
              alt="Picture of poll"
            />

            <img
              class="col-span-2 max-h-96 rounded-3xl border border-fuchsia-400 shadow-lg shadow-fuchsia-400"
              // src="/third.png"
              srcset={img3}
              alt="Picture of poll"
              sizes="1006px"
            />
          </div>
          <div class="my-16 flex w-full max-w-md items-center justify-center gap-4 p-6 lg:hidden">
            <A
              class="flex-1 rounded-full border border-fuchsia-400 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-400 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
              href={route("/questionares/")}
            >
              Take the poll
            </A>
            <A
              class="flex-1 rounded-full border border-fuchsia-400 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-400 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
              href={route("/articles/")}
            >
              Share article
            </A>
          </div>
        </div>
      </div>
      <div class="flex w-full items-center justify-center bg-slate-100">
        <div class="grid w-full max-w-screen-2xl grid-cols-1 justify-items-center gap-12 py-16 lg:grid-cols-2">
          <InfoBox
            header="Useful statistics from poll filled by patients or relatives"
            text="You can fill out a comprehensive poll about schizophrenia related
          illness whether you are a patient, relative or even distantly familiar of someone with schizophrenia."
            link="Take the poll"
            route={route("/questionares/")}
          />
          <InfoBox
            header="Share articles or interviews about schizophrenia"
            text="From Google it can be bit hard to find articles or experiences of
        people with schizophrenia. Here you can share articles that are
        relevant to schizophrenia."
            link="Share article"
            route={route("/articles/")}
          />
          <InfoBox
            header="Take a look at the poll results"
            text="People have done the poll, have a look at the results."
            link="View the poll results"
            route={route("/pollResults/")}
          />
          <InfoBox
            header="Compare between diagnosis or gender"
            text="Gain insight on how symptoms or experiences differ between schizophrenia
        or schizoaffective and between genders."
            link="Compare"
            route={route("/compare/")}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
