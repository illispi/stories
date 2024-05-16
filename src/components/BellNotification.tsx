import { Show } from "solid-js";
import { trpc } from "~/utils/trpc";

const BellNotification = () => {
	const authQuery = trpc.authStatus.createQuery();
	return (
		<>
			<Show when={authQuery.data?.user}>
				<div>Hello</div>
			</Show>
		</>
	);
};

export default BellNotification;
