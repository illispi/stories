import { mergeRefs } from "@solid-primitives/refs";
import type { Component } from "solid-js";
import { Show, Suspense, createEffect, createUniqueId, onCleanup } from "solid-js";
import type { ChartistData } from "~/types/types";
import { useIsRouting } from "~/utils/router";

interface Adds {
	height?: string;
}

const BarChartCustomtest = (_props: { options?: Adds }) => {
	const id = 1;

	// createEffect(() => {
	// 	setTimeout(() => {
	// 		console.log("after");
	// 		bar = new BarChart(
	// 			`#chartBar1`,
	// 			{
	// 				series: [4, 7],
	// 				labels: ["hello", "test"],
	// 			},
	// 			{
	// 				...props.options,
	// 				width: "100%",
	// 				chartPadding: 25,
	// 				axisX: {
	// 					onlyInteger: true,
	// 				},
	// 				axisY: { offset: 80, scaleMinSpace: 25 },
	// 				distributeSeries: true,
	// 				horizontalBars: true,
	// 			}, //BUG use mergeProps if you want defaults
	// 		);
	// 	}, 500);
	// });

	return (
		<Suspense>
			<div>
				<div class="flex w-full flex-col items-center justify-center h-64">
					<div class={`h-64 w-full lg:w-11/12`} id={`chartBar1`} />
				</div>
			</div>
		</Suspense>
	);
};

export default BarChartCustomtest;

//NOTE index.css is global but you can get over it with module.css, see start.solidjs.com "styling"
