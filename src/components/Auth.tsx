import { Show, type VoidComponent } from "solid-js";
import CustomButton from "./CustomButton";

import {
	createMutation,
	createQuery,
	useQueryClient,
} from "@tanstack/solid-query";
import LoginA from "./LoginA";
import { trpc } from "~/utils/trpc";

const Auth: VoidComponent = () => {
	const authQuery = trpc.authStatus.createQuery();

	const utils = trpc.useContext();

	const logOutMut = trpc.logOut.createMutation(() => ({
		onSuccess: () => utils.authStatus.invalidate(),
	}));

	return (
		<Show when={authQuery.data} fallback={<LoginA />}>
			<CustomButton
				onClick={() => {
					logOutMut.mutate();
				}}
				class="w-44"
			>
				Sign out
			</CustomButton>
		</Show>
	);
};

export default Auth;
