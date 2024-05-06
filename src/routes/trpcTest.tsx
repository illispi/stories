import { type Component } from "solid-js";
import { trpc } from "~/utils/trpc";

const trpcTest: Component = () => {
	const test = trpc.allStats.createQuery(() => ({
		fake: "fake",
		pOrT: "Personal_questions",
		value: "all",
	}));

	return (
		<>
			<div>hello</div>
			<p>{test.data}</p>
		</>
	);
};

export default trpcTest;
