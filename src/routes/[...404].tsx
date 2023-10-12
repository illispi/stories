import { route } from "routes-gen";
import { Component } from "solid-js";
import { A } from "solid-start";

const notFound: Component<{}> = (props) => {
  return (
    <div class="flex min-h-screen w-full flex-col items-center justify-center">
      <div class="flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
        <h1 class="text-center text-2xl">404! Page Not found</h1>

        <A
          class="flex-1 rounded-full border border-fuchsia-400 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-400 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
          href={route("/")}
        >
          Return home
        </A>
      </div>
    </div>
  );
};

export default notFound;
