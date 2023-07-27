import { getSession } from "@auth/solid-start";
import { signIn, signOut } from "@auth/solid-start/client";
import type { VoidComponent } from "solid-js";
import { createServerData$ } from "solid-start/server";
import { authOpts } from "~/routes/api/auth/[...solidauth]";

const createSession = () => {
  return createServerData$(async (_, event) => {
    return await getSession(event.request, authOpts);
  });
};

const Auth: VoidComponent = () => {
  const sessionData = createSession();
  return (
    <div class="flex flex-col items-center justify-center gap-4 bg-black">
      <p class="text-center text-2xl text-white">
        {sessionData() && <span>Logged in anonymously</span>}
      </p>
      <button
        class="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData() ? () => void signOut() : () => void signIn()}
      >
        {sessionData() ? "Sign out" : "Sign in/up"}
      </button>
    </div>
  );
};

export default Auth;
