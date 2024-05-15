import { Show, createEffect, type VoidComponent } from "solid-js";
import CustomButton from "./CustomButton";

import {
	createMutation,
	createQuery,
	useQueryClient,
} from "@tanstack/solid-query";
import LoginA from "./LoginA";
import { trpc } from "~/utils/trpc";
import { useNavigate } from "@solidjs/router";

const Auth: VoidComponent = () => {
	const authQuery = trpc.authStatus.createQuery();

	const utils = trpc.useContext();
	const navigate = useNavigate();

	const logOutMut = trpc.logOut.createMutation(() => ({
		onSuccess: () => {
			utils.invalidate();
			navigate("/");
		},
	}));

	return (
		<Show when={authQuery.data?.user} fallback={<LoginA />}>
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
