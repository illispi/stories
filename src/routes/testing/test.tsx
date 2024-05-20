import type { ParentComponent } from "solid-js";
import {
	Suspense
} from "solid-js";
import BarChartCustomtest from "~/components/testing/TestChart";

const Test: ParentComponent = () => {
	return (
		<Suspense>
			<div>
				<BarChartCustomtest />
			</div>
		</Suspense>
	);
};

export default Test;

//TODO might want to change ask first if you have told anybody and then who
//TODO what_others_Should_know and not_have_schizophrenia_description need custom logic in text to show yes and no separately, backend solution might be good
