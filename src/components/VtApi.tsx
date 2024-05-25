import { useBeforeLeave, useIsRouting, useNavigate } from "@solidjs/router";
import { Component, ParentComponent, createEffect } from "solid-js";

const VtApi: ParentComponent = (props) => {
	const transition = (fnStartingTheSynchronousTransition) => {
		// In case the API is not yet supported
		if (!document.startViewTransition) {
			return fnStartingTheSynchronousTransition();
		}

		// Transition the changes in the DOM
		const transition = document.startViewTransition(
			fnStartingTheSynchronousTransition,
		);
	};

	useBeforeLeave((e) => {
		// Stop the inmediate navigation and DOM change
		if (!e.defaultPrevented) {
			e.preventDefault();

			// Perform the action that triggers a DOM change synchronously
			transition(() => {
				e.retry(true);
			});
		}
	});

	return <>{props.children}</>;
};

export default VtApi;
