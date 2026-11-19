import { navigate } from "astro:transitions/client";
import { authClient } from "~/utils/auth-client";

export default function SignOutButton() {
	return (
		<button
			type="button"
			class="rounded-full border border-fuchsia-400 bg-white px-6 py-2 font-semibold shadow-fuchsia-400 shadow-md"
			onClick={async () => {
				await authClient.signOut();
				navigate("/");
			}}
		>
			Sign out
		</button>
	);
}
