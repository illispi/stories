import { type Component } from "solid-js";
import type { StatsData } from "~/types/types";

export const Item: Component<{
	name: string;
	stat: string;
	data: StatsData | undefined;
}> = (props) => {
	return (
		<div
			id={props.name.split(" ").join("")}
			class="my-3 flex flex-col items-center justify-center"
		>
			<p class="mb-8 text-center text-xl underline underline-offset-8">
				{props.name}
			</p>
			<p class=" mb-4 rounded-full border-2 border-slate-400 p-2 text-center font-semibold">
				{props.data?.[props.stat]}
			</p>
		</div>
	);
};
