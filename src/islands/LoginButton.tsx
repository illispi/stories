import { createSignal } from "solid-js";
import { authClient, safeRedirect } from "~/utils/auth-client";

export default function LoginButton(props: { redir?: string | null }) {
	const [pending, setPending] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	const signIn = async () => {
		setPending(true);
		setError(null);
		const { error } = await authClient.signIn.social({
			provider: "discord",
			callbackURL: safeRedirect(props.redir),
			errorCallbackURL: "/login?error=1",
		});
		if (error) {
			setError(error.message ?? "Sign in failed, please try again.");
			setPending(false);
		}
	};

	return (
		<div class="flex flex-col items-center gap-4">
			<button
				type="button"
				class="m-8 w-full max-w-xs rounded-full border border-fuchsia-400 bg-white p-4 text-center font-semibold text-black text-xl shadow-fuchsia-400 shadow-lg transition-all duration-200 ease-out active:scale-125 hover:scale-110 disabled:opacity-60 2xl:text-2xl"
				disabled={pending()}
				onClick={signIn}
			>
				{pending() ? "Redirecting…" : "Sign in with Discord"}
			</button>
			{error() && <p class="text-red-600">{error()}</p>}
		</div>
	);
}
