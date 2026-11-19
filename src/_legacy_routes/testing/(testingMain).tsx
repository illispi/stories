import { A } from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import { Suspense } from "solid-js";
import BarChartCustomtest from "~/components/testing/TestChart";

const TestingMain: ParentComponent = () => {
	return (
		<div>
			<A href="/testing/test/">gesgesgsg</A>
		</div>
	);
};

export default TestingMain;
