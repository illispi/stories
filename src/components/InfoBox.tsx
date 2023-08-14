import { Component } from "solid-js";
import { A } from "solid-start";

const InfoBox: Component<{
  header: string;
  text: string;
  link: string;
  route: string;
}> = (props) => {
  return (
    <div class="flex w-11/12 max-w-3xl flex-col gap-16 rounded-3xl border border-black px-4 py-8 shadow-xl">
      <h2 class="text-2xl font-bold lg:text-3xl">{props.header}</h2>
      <p class="text-lg">{props.text}</p>
      <A
        class="flex-1 rounded-full border border-fuchsia-600 bg-white p-3 text-center text-xl font-semibold text-black shadow-lg shadow-fuchsia-600 transition-all duration-200 ease-out hover:scale-110 active:scale-125 2xl:text-2xl "
        href={props.route}
      >
        {props.link}
      </A>
    </div>
  );
};

export default InfoBox;