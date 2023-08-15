import type { Component } from "solid-js";
import { A } from "solid-start";

const InfoBox: Component<{
  header: string;
  text: string;
  link: string;
  route: string;
}> = (props) => {
  return (
    <div class="flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-t-4 border-fuchsia-600 bg-white px-4 py-12 shadow-xl lg:p-16">
      <h2 class="text-2xl font-bold lg:text-3xl">{props.header}</h2>
      <p class="text-lg">{props.text}</p>
      <A
        class="rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
        href={props.route}
      >
        {props.link}
      </A>
    </div>
  );
};

export default InfoBox;
