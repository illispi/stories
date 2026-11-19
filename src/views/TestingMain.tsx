import { withProviders } from "~/islands/withProviders";
import { A } from "~/utils/router";
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

export default withProviders(TestingMain);
