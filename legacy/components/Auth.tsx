import { Show, type VoidComponent } from "solid-js";
import CustomButton from "./CustomButton";

import { useNavigate } from "@solidjs/router";
import { trpc } from "~/utils/trpc";
import LoginA from "./LoginA";



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
				disabled={logOutMut.isPending}
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
