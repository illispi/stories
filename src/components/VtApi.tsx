import { useBeforeLeave, type RouteSectionProps } from "@solidjs/router";
import type { ParentComponent } from "solid-js";
import "../app.css";

const VtApi: ParentComponent = (props) => {
	let isTransitionNavigate = false;

	useBeforeLeave((event) => {
		if (document.startViewTransition) {
			// if this is not already the second navigation,
			// which happens after the view-transition was initialized from inside this component
			if (!isTransitionNavigate) {
				const isBackNavigation =
					Number.isInteger(event.to) && (event.to as number) < 0;

				event.preventDefault();
				// console.log(isBackNavigation, event.to);

				isTransitionNavigate = true;

				document.documentElement.classList.add("slide");
				const transition = document.startViewTransition(() => {
					event.retry();
				});

				transition.finished.finally(() => {
					isTransitionNavigate = false;
					document.documentElement.classList.remove("slide");
				});
			}
		}
	});

	return <>{props.children}</>;
};

export default VtApi;
