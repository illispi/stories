import type { Component } from "solid-js";
import { trpc } from "~/utils/trpc";

const trpcTest: Component = () => {
	const test = trpc.test.createQuery()

	return (
		<>
			<div>hello</div>
			<p>{test.data}</p>
		</>
	);
};

export default trpcTest;
