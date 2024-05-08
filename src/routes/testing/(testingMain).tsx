import { A } from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import { Suspense } from "solid-js";
import BarChartCustomtest from "~/components/testing/TestChart";

const TestingMain: ParentComponent = () => {
	return (
		<Suspense>
			<div>
				<A href="/testing/test/" />
			</div>
		</Suspense>
	);
};

export default TestingMain;
