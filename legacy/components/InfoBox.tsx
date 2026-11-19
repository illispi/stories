import { A } from "@solidjs/router";
import type { Component } from "solid-js";

const InfoBox: Component<{
	header: string;
	text: string;
	link: string;
	route: string;
}> = (props) => {
	return (
		<div class="flex w-11/12 max-w-2xl flex-col justify-between gap-16 rounded-3xl border-fuchsia-600 border-t-4 bg-white px-4 py-12 shadow-xl lg:p-16">
			<h2 class="font-bold text-2xl lg:text-3xl">{props.header}</h2>
			<p class="text-lg">{props.text}</p>
			<A
				class="rounded-full border border-fuchsia-600 bg-white p-3 text-center font-semibold text-black text-xl shadow-fuchsia-600 shadow-lg transition-all duration-200 ease-out active:scale-125 hover:scale-110 2xl:text-2xl"
				href={props.route}
			>
				{props.link}
			</A>
		</div>
	);
};

export default InfoBox;
